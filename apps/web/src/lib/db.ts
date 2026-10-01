import { createDb, type Db } from '@ask/db'

let db: Db | undefined
export function getDb(): Db {
  return (db ??= createDb())
}
