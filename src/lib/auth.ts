import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export const SESSION_COOKIE = 'hayat_session'

export async function getSession() {
  const store = await cookies()
  const userId = store.get(SESSION_COOKIE)?.value
  if (!userId) return null
  try {
    const user = await db.user.findUnique({ where: { id: userId } })
    return user
  } catch {
    return null
  }
}

export async function requireUser() {
  const user = await getSession()
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}

export async function createSession(userId: string) {
  const store = await cookies()
  store.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
}

export async function destroySession() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}
