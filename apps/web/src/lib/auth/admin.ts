import { getCurrentUser } from './current'

/** Admin paneli ve API'si: yalnız users.role = 'admin'. Değilse null. */
export async function getAdminUser() {
  const user = await getCurrentUser()
  return user?.role === 'admin' ? user : null
}
