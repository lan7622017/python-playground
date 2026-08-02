// 密码哈希工具：使用 Node 内置 scrypt（免第三方依赖）
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

/** 生成密码哈希，格式：盐:哈希（hex） */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}

/** 校验密码是否匹配 */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [salt, hashHex] = stored.split(':');
  if (!salt || !hashHex) return false;
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  const storedHash = Buffer.from(hashHex, 'hex');
  // 长度不一致直接返回 false，避免 timingSafeEqual 抛错
  if (hash.length !== storedHash.length) return false;
  return timingSafeEqual(hash, storedHash);
}
