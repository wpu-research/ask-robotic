import { getDb } from '@/lib/db'
import { readSessionToken } from './http'
import { getSessionUser } from './session'

export async function getCurrentUser() {
  return getSessionUser(getDb(), await readSessionToken())
}
