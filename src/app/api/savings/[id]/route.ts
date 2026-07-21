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

    const existing = await db.savingsGoal.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (typeof body.title === 'string' && body.title.trim()) data.title = body.title.trim()
    if (typeof body.target === 'number' && body.target >= 0) data.target = body.target
    if (typeof body.current === 'number' && body.current >= 0) data.current = body.current
    if (body.deadline !== undefined) {
      if (body.deadline === null) {
        data.deadline = null
      } else if (typeof body.deadline === 'string') {
        const d = new Date(body.deadline)
        if (!Number.isNaN(d.getTime())) data.deadline = d
      }
    }

    const goal = await db.savingsGoal.update({ where: { id }, data })
    return NextResponse.json({ goal })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[savings PATCH]', e)
    return NextResponse.json({ error: 'Gagal memperbarui target tabungan' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params

    const existing = await db.savingsGoal.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    await db.savingsGoal.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[savings DELETE]', e)
    return NextResponse.json({ error: 'Gagal menghapus target tabungan' }, { status: 500 })
  }
}
