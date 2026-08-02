// 关卡种子数据写入脚本：npm run seed
// 作用：清空 levels 表并写入 12 关数据（幂等，可重复执行）
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { DB_PATH } from '../common/config';
import { Level } from '../entities/level.entity';
import { LEVEL_SEED } from './levels.seed';

async function run() {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: join(process.cwd(), DB_PATH),
    entities: [Level],
    synchronize: true,
  });
  await dataSource.initialize();
  const repo = dataSource.getRepository(Level);

  // 清空旧数据
  await repo.clear();
  // 重置自增 ID（SQLite 的 DELETE 不会重置自增序列，否则二次 seed 后 ID 会从 9 开始）
  await dataSource.query(`DELETE FROM sqlite_sequence WHERE name = 'levels'`);
  // 批量插入
  await repo.save(LEVEL_SEED.map((l) => repo.create(l)));

  const count = await repo.count();
  console.log(`✅ 关卡数据写入完成，共 ${count} 关`);

  // 校验 1：关卡数量必须与种子数据一致（防漏写）
  if (count !== LEVEL_SEED.length) {
    throw new Error(`❌ 关卡数量校验失败：期望 ${LEVEL_SEED.length} 关，实际 ${count} 关`);
  }
  // 校验 2：每关 id 必须等于 order（防数组乱序破坏存量 progress 的 levelId 引用）
  const saved = await repo.find({ order: { order: 'ASC' } });
  for (const level of saved) {
    if (level.id !== level.order) {
      throw new Error(`❌ 关卡 ID 校验失败：order=${level.order} 的 id=${level.id}，要求 id === order`);
    }
  }
  console.log(`✅ 关卡校验通过：${saved.length} 关且 id 均与 order 一致`);
  await dataSource.destroy();
}

run().catch((err) => {
  console.error('❌ 种子数据写入失败:', err);
  process.exit(1);
});
