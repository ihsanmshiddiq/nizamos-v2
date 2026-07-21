import { NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await destroySession()
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[auth/logout]', e)
    return NextResponse.json({ error: 'Gagal keluar' }, { status: 500 })
  }
}
