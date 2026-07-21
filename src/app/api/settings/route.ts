import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await requireUser()
    return NextResponse.json({
      theme: user.theme,
      enableMenstrual: user.enableMenstrual,
      currency: user.currency,
      name: user.name,
      email: user.email,
      image: user.image,
    })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[settings GET]', e)
    return NextResponse.json({ error: 'Gagal memuat pengaturan' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser()
    const body = await req.json().catch(() => ({}))

    const data: Record<string, unknown> = {}
    if (typeof body.theme === 'string' && ['light', 'dark', 'system'].includes(body.theme)) {
      data.theme = body.theme
    }
    if (typeof body.enableMenstrual === 'boolean') {
      data.enableMenstrual = body.enableMenstrual
    }
    if (typeof body.currency === 'string' && body.currency.trim()) {
      data.currency = body.currency.trim().toUpperCase()
    }
    if (typeof body.name === 'string') {
      data.name = body.name.trim() || null
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data,
    })

    return NextResponse.json({
      theme: updated.theme,
      enableMenstrual: updated.enableMenstrual,
      currency: updated.currency,
      name: updated.name,
      email: updated.email,
      image: updated.image,
    })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[settings PATCH]', e)
    return NextResponse.json({ error: 'Gagal memperbarui pengaturan' }, { status: 500 })
  }
}
