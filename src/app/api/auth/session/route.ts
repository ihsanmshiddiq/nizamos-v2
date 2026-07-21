import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getSession()
    return NextResponse.json({ user })
  } catch (e) {
    console.error('[auth/session]', e)
    return NextResponse.json({ user: null })
  }
}
