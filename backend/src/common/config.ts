// 全局配置常量
export const JWT_SECRET = process.env.JWT_SECRET || 'python-playground-dev-secret';
export const JWT_EXPIRES_IN = '7d';
export const PORT = 3000;

/** 数据库文件路径（SQLite，相对 backend 目录） */
export const DB_PATH = process.env.DB_PATH || 'playground.db';
