import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = typeof body.email === 'string' && body.email.trim()
      ? body.email.trim().toLowerCase()
      : null
    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 })
    }

    const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : null
    const image = typeof body.image === 'string' && body.image.trim() ? body.image.trim() : null
    const provider = typeof body.provider === 'string' && body.provider.trim() ? body.provider.trim() : 'credentials'

    const user = await db.user.upsert({
      where: { email },
      update: {
        ...(name ? { name } : {}),
        ...(image ? { image } : {}),
        provider,
      },
      create: {
        email,
        name: name ?? email.split('@')[0],
        image: image ?? null,
        provider,
      },
    })

    await createSession(user.id)
    return NextResponse.json({ user })
  } catch (e) {
    console.error('[auth/login]', e)
    return NextResponse.json({ error: 'Gagal masuk' }, { status: 500 })
  }
}
