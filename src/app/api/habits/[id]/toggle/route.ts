import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params
    const body = await req.json().catch(() => ({}))

    const date = typeof body.date === 'string' ? body.date : ''
    if (!DATE_RE.test(date)) {
      return NextResponse.json({ error: 'Format tanggal tidak valid (YYYY-MM-DD)' }, { status: 400 })
    }

    const habit = await db.habit.findFirst({ where: { id, userId: user.id } })
    if (!habit) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    const existing = await db.habitLog.findUnique({
      where: { habitId_date: { habitId: id, date } },
    })

    if (existing) {
      await db.habitLog.delete({ where: { id: existing.id } })
      return NextResponse.json({ completed: false, log: null })
    }

    const log = await db.habitLog.create({
      data: { habitId: id, date, count: 1 },
    })
    return NextResponse.json({ completed: true, log })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[habits toggle]', e)
    return NextResponse.json({ error: 'Gagal mengubah log kebiasaan' }, { status: 500 })
  }
}
