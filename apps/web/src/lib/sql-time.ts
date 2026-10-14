import { sql } from '@ask/db'

/** Ham `sql` şablonunda zaman parametresi: postgres-js Date kabul etmez (PGlite eder), ISO metin + tür dönüşümü. */
export const tsz = (d: Date) => sql`${d.toISOString()}::timestamptz`
