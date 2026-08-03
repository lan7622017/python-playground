# -*- coding: utf-8 -*-
"""一键重新部署：上传代码 → 装依赖 → 构建 → 重启 → 验证
安全特性：不删除服务器数据库、node_modules 增量更新、sqlite3 固定 5.1.7
用法：python deploy/redeploy.py
前置条件：
  1. pip install paramiko
  2. 项目根目录下存在 .deploy-tmp/deploy_key（SSH 私钥，不进 Git）
本脚本可放在任意电脑上运行，路径自动识别。
"""
import os
import sys
import tarfile
import time
import tempfile
import paramiko

HOST = "122.51.253.204"
USER = "ubuntu"

# 路径自动识别：脚本位于 项目根目录/deploy/ 下
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY_PATH = os.path.join(PROJECT_DIR, '.deploy-tmp', 'deploy_key')
REMOTE_DIR = "/home/ubuntu/python-playground"

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

EXCLUDE_DIRS = {'node_modules', 'dist', '.git', '.deploy-tmp', '.vercel-tmp',
                'acceptance-screenshots', '__pycache__'}
EXCLUDE_FILES = {'playground.db', 'playground.db-journal'}


def create_tar(tar_path):
    print("[1/6] 打包本地代码...")
    count = 0
    with tarfile.open(tar_path, 'w:gz') as tar:
        for root, dirs, files in os.walk(PROJECT_DIR):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for f in files:
                fp = os.path.join(root, f)
                rel = os.path.relpath(fp, PROJECT_DIR)
                if os.path.basename(rel) not in EXCLUDE_FILES:
                    tar.add(fp, arcname=f'python-playground/{rel}')
                    count += 1
    size_mb = os.path.getsize(tar_path) / 1024 / 1024
    print(f"      {count} 个文件，{size_mb:.1f} MB")


def get_client():
    if not os.path.exists(KEY_PATH):
        print(f"!!! 找不到私钥文件：{KEY_PATH}")
        print("    请把 deploy_key 放到项目根目录的 .deploy-tmp 文件夹下")
        sys.exit(1)
    key = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=22, username=USER, pkey=key, timeout=15,
                   look_for_keys=False, allow_agent=False)
    return client


def run_cmd(client, cmd, timeout=300, show_lines=10):
    print(f"\n[CMD] {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    code = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', 'replace').strip()
    err = stderr.read().decode('utf-8', 'replace').strip()
    for tag, text in [('', out), ('[ERR]', err if code != 0 else '')]:
        if not text:
            continue
        lines = text.split('\n')
        if len(lines) > show_lines:
            for l in lines[:4]:
                print(f"  {tag} {l}")
            print(f"  ...({len(lines)-8} lines)...")
            for l in lines[-4:]:
                print(f"  {tag} {l}")
        else:
            for l in lines:
                print(f"  {tag} {l}")
    return code, out, err


def main():
    tar_path = os.path.join(tempfile.gettempdir(), 'pp_project.tar.gz')
    create_tar(tar_path)

    client = get_client()
    print("\n[2/6] 上传代码到服务器...")
    sftp = client.open_sftp()
    sftp.put(tar_path, '/tmp/project.tar.gz')
    sftp.close()
    os.remove(tar_path)
    print("      上传完成")

    # 解压到暂存区，再同步到项目目录（不删除数据库、node_modules）
    print("\n[3/6] 同步代码（保留数据库和依赖）...")
    sync_cmd = (
        "rm -rf /tmp/pp-stage && mkdir -p /tmp/pp-stage && "
        "tar xzf /tmp/project.tar.gz -C /tmp/pp-stage && "
        f"rsync -a --delete "
        "--exclude 'node_modules' --exclude 'playground.db*' --exclude 'backend/dist' --exclude 'frontend/dist' --exclude 'shared/dist' "
        f"/tmp/pp-stage/python-playground/ {REMOTE_DIR}/ && "
        "rm -rf /tmp/pp-stage /tmp/project.tar.gz && echo SYNC_OK"
    )
    code, out, _ = run_cmd(client, sync_cmd, timeout=120)
    if 'SYNC_OK' not in out:
        print("!!! 同步失败，中止")
        sys.exit(1)

    # 安装依赖 + 固定 sqlite3 版本（服务器 glibc 2.35 只兼容 5.1.7）
    print("\n[4/6] 安装依赖（sqlite3 固定 5.1.7）...")
    run_cmd(client, f"cd {REMOTE_DIR} && npm install --no-audit --no-fund 2>&1 | tail -3", timeout=600)
    ver = run_cmd(client, f"cd {REMOTE_DIR} && node -p \"require('sqlite3/package.json').version\"")[1]
    if ver.strip() != '5.1.7':
        print("      sqlite3 版本变化，重新安装 5.1.7...")
        run_cmd(client, f"cd {REMOTE_DIR} && npm install sqlite3@5.1.7 --no-audit --no-fund 2>&1 | tail -2", timeout=300)
    # 确保 sqlite3 原生模块可加载
    code, out, _ = run_cmd(client, f"cd {REMOTE_DIR} && node -e \"require('sqlite3');console.log('SQLITE3_OK')\"")
    if 'SQLITE3_OK' not in out:
        print("!!! sqlite3 无法加载，中止")
        sys.exit(1)

    # 构建
    print("\n[5/6] 构建 shared / backend / frontend...")
    for ws, t in [('shared', 120), ('backend', 180), ('frontend', 300)]:
        code, _, _ = run_cmd(client, f"cd {REMOTE_DIR} && npm run build -w {ws} 2>&1 | tail -3", timeout=t)
        if code != 0:
            print(f"!!! {ws} 构建失败，中止")
            sys.exit(1)
    run_cmd(client, "chmod -R a+rX /home/ubuntu/python-playground/frontend/dist")

    # 重启后端 + 验证
    print("\n[6/6] 重启后端并验证...")
    run_cmd(client, "pm2 restart python-playground-backend")
    time.sleep(5)
    run_cmd(client, "curl -s -o /dev/null -w 'Frontend: %{http_code}\\n' http://localhost:80")
    run_cmd(client, "curl -s -o /dev/null -w 'Backend:  %{http_code} (401=正常,需登录)\\n' http://localhost:3000/api/levels")
    run_cmd(client, "curl -s -o /dev/null -w 'Public:   %{http_code}\\n' http://122.51.253.204/")
    run_cmd(client, "pm2 save")

    client.close()
    print("\n✅ 部署完成！访问 http://122.51.253.204")


if __name__ == '__main__':
    main()
