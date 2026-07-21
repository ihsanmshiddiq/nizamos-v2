import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params
    const body = await req.json().catch(() => ({}))

    const amount = typeof body.amount === 'number' ? body.amount : NaN
    if (Number.isNaN(amount)) {
      return NextResponse.json({ error: 'amount (number) wajib diisi' }, { status: 400 })
    }

    const existing = await db.savingsGoal.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    const newCurrent = Math.max(0, existing.current + amount)
    const goal = await db.savingsGoal.update({
      where: { id },
      data: { current: newCurrent },
    })

    return NextResponse.json({ goal })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[savings deposit]', e)
    return NextResponse.json({ error: 'Gagal menabung' }, { status: 500 })
  }
}
