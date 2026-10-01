import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

export * from './schema'

export function createDb(url = process.env.DATABASE_URL) {
  if (!url) throw new Error('DATABASE_URL tanımlı değil')
  return drizzle(postgres(url), { schema })
}
