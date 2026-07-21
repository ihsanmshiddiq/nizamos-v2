import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params
    const body = await req.json().catch(() => ({}))

    const existing = await db.hifdzItem.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (typeof body.status === 'string' && ['learning', 'memorized', 'reviewing', 'weak'].includes(body.status)) {
      data.status = body.status
      if (body.status === 'memorized') {
        data.lastReviewed = new Date()
      }
    }
    if (body.lastReviewed !== undefined) {
      if (body.lastReviewed === null) {
        data.lastReviewed = null
      } else if (typeof body.lastReviewed === 'string') {
        const d = new Date(body.lastReviewed)
        if (!Number.isNaN(d.getTime())) data.lastReviewed = d
      }
    }
    if (typeof body.reviewCount === 'number' && body.reviewCount >= 0) {
      data.reviewCount = Math.floor(body.reviewCount)
    }
    if (typeof body.surah === 'string' && body.surah.trim()) data.surah = body.surah.trim()
    if (typeof body.surahNumber === 'number') data.surahNumber = Math.floor(body.surahNumber)
    if (typeof body.fromAyah === 'number') data.fromAyah = Math.floor(body.fromAyah)
    if (typeof body.toAyah === 'number') data.toAyah = Math.floor(body.toAyah)

    const item = await db.hifdzItem.update({ where: { id }, data })
    return NextResponse.json({ item })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[hifdz PATCH]', e)
    return NextResponse.json({ error: 'Gagal memperbarui hifdz' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params

    const existing = await db.hifdzItem.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    await db.hifdzItem.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[hifdz DELETE]', e)
    return NextResponse.json({ error: 'Gagal menghapus hifdz' }, { status: 500 })
  }
}
