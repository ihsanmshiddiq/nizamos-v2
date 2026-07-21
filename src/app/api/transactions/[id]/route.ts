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

    const existing = await db.transaction.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (typeof body.amount === 'number') data.amount = body.amount
    if (typeof body.type === 'string' && ['income', 'expense'].includes(body.type)) {
      data.type = body.type
    }
    if (typeof body.category === 'string') data.category = body.category.trim() || null
    if (typeof body.note === 'string') data.note = body.note.trim() || null
    if (typeof body.date === 'string') {
      const d = new Date(body.date)
      if (!Number.isNaN(d.getTime())) data.date = d
    }

    const transaction = await db.transaction.update({ where: { id }, data })
    return NextResponse.json({ transaction })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[transactions PATCH]', e)
    return NextResponse.json({ error: 'Gagal memperbarui transaksi' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params

    const existing = await db.transaction.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    await db.transaction.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[transactions DELETE]', e)
    return NextResponse.json({ error: 'Gagal menghapus transaksi' }, { status: 500 })
  }
}
