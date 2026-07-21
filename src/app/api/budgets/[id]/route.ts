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

    const existing = await db.budget.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (typeof body.limit === 'number' && body.limit >= 0) data.limit = body.limit
    if (typeof body.category === 'string' && body.category.trim()) {
      // Check for uniqueness conflict
      const conflict = await db.budget.findFirst({
        where: {
          userId: user.id,
          month: existing.month,
          category: body.category.trim(),
          NOT: { id },
        },
      })
      if (conflict) {
        return NextResponse.json(
          { error: 'Kategori sudah ada untuk bulan ini' },
          { status: 400 },
        )
      }
      data.category = body.category.trim()
    }

    const budget = await db.budget.update({ where: { id }, data })
    return NextResponse.json({ budget })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[budgets PATCH]', e)
    return NextResponse.json({ error: 'Gagal memperbarui anggaran' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params

    const existing = await db.budget.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    await db.budget.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[budgets DELETE]', e)
    return NextResponse.json({ error: 'Gagal menghapus anggaran' }, { status: 500 })
  }
}
