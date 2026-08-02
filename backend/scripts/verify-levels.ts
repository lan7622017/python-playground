// 临时验证脚本：把 8 关的 starterCode + testCode 拼起来交给本机 Python 执行
// 用法：ts-node scripts/verify-levels.ts
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { LEVEL_SEED } from '../src/seed/levels.seed';

const tmpDir = join(process.cwd(), '.tmp-verify');
mkdirSync(tmpDir, { recursive: true });

let allPassed = true;
for (const level of LEVEL_SEED) {
  const code = `${level.starterCode}\n\n${level.testCode}`;
  const file = join(tmpDir, `level-${level.order}.py`);
  writeFileSync(file, code, 'utf-8');
  try {
    execSync(`python "${file}"`, {
      encoding: 'utf-8',
      // 强制 UTF-8 输出，避免 Windows 下 GBK 编码报错（浏览器端 Pyodide 无此问题）
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });
    console.log(`✅ 第 ${level.order} 关（${level.title}）验证通过`);
  } catch (err: unknown) {
    allPassed = false;
    const msg = err as { stdout?: string; stderr?: string };
    console.log(`❌ 第 ${level.order} 关（${level.title}）验证失败:`);
    console.log((msg.stderr || msg.stdout || String(err)).slice(0, 800));
  }
}

rmSync(tmpDir, { recursive: true, force: true });
console.log(allPassed ? '\n🎉 全部关卡验证通过' : '\n⚠️ 存在失败的关卡，请检查');
process.exit(allPassed ? 0 : 1);
