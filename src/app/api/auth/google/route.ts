import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    let email = typeof body.email === 'string' && body.email.trim()
      ? body.email.trim().toLowerCase()
      : null
    let name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : null

    if (!email) {
      // Generate a demo google account
      const rnd = Math.random().toString(36).slice(2, 8)
      email = `you.google.${rnd}@gmail.com`
      name = name ?? 'Google User'
    }

    const image = typeof body.image === 'string' && body.image.trim() ? body.image.trim() : null

    const user = await db.user.upsert({
      where: { email },
      update: {
        provider: 'google',
        ...(name ? { name } : {}),
        ...(image ? { image } : {}),
      },
      create: {
        email,
        name: name ?? 'Google User',
        image: image ?? null,
        provider: 'google',
      },
    })

    await createSession(user.id)
    return NextResponse.json({ user })
  } catch (e) {
    console.error('[auth/google]', e)
    return NextResponse.json({ error: 'Gagal masuk dengan Google' }, { status: 500 })
  }
}
