import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { fileURLToPath } from 'node:url'
import * as schema from '@ask/db'
import type { Db } from '@ask/db'

/** Bellek içi Postgres (PGlite) üzerinde tüm migration'ları çalıştırır. Yalnız testlerde kullanılır. */
export async function createTestDb(): Promise<Db> {
  const db = drizzle(new PGlite(), { schema })
  await migrate(db, {
    migrationsFolder: fileURLToPath(new URL('../../../../packages/db/migrations', import.meta.url)),
  })
  return db as unknown as Db
}
