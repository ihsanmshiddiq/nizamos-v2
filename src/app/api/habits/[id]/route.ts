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

    const existing = await db.habit.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (typeof body.title === 'string' && body.title.trim()) data.title = body.title.trim()
    if (typeof body.icon === 'string') data.icon = body.icon.trim() || null
    if (typeof body.color === 'string') data.color = body.color.trim() || null
    if (typeof body.schedule === 'string' && ['daily', 'weekly'].includes(body.schedule)) {
      data.schedule = body.schedule
    }
    if (typeof body.targetCount === 'number' && body.targetCount > 0) {
      data.targetCount = Math.floor(body.targetCount)
    }

    const habit = await db.habit.update({ where: { id }, data })
    return NextResponse.json({ habit })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[habits PATCH]', e)
    return NextResponse.json({ error: 'Gagal memperbarui kebiasaan' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params

    const existing = await db.habit.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    await db.habit.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[habits DELETE]', e)
    return NextResponse.json({ error: 'Gagal menghapus kebiasaan' }, { status: 500 })
  }
}
