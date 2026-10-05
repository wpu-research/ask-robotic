// Canlıya çıkış girişi: migrasyonları uygular, sonra içeriği (idempotent) yazar. Sunucudan önce çalışır.
import path from 'node:path'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { createDb } from './index'
import { seedContent } from './seed-content'

async function main() {
  const db = createDb()
  const folder = process.env.MIGRATIONS_DIR ?? path.resolve(__dirname, '../migrations')
  await migrate(db, { migrationsFolder: folder })
  console.log('Migrasyonlar uygulandı:', folder)
  await seedContent(db)
  console.log('İçerik yazıldı')
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1) })
