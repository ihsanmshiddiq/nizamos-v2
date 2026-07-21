import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export const dynamic = 'force-dynamic'

const MONTH_RE = /^\d{4}-\d{2}$/

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser()
    const { searchParams } = new URL(req.url)
    const monthParam = searchParams.get('month')
    const month = monthParam && MONTH_RE.test(monthParam)
      ? monthParam
      : format(new Date(), 'yyyy-MM')

    const budgets = await db.budget.findMany({
      where: { userId: user.id, month },
      orderBy: { category: 'asc' },
    })

    // Compute spent per category from transactions in that month
    const monthStart = startOfMonth(new Date(month + '-01T00:00:00'))
    const monthEnd = endOfMonth(monthStart)
    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        type: 'expense',
        date: { gte: monthStart, lte: monthEnd },
      },
      select: { category: true, amount: true },
    })

    const spentByCategory: Record<string, number> = {}
    for (const t of transactions) {
      const key = t.category ?? 'uncategorized'
      spentByCategory[key] = (spentByCategory[key] ?? 0) + t.amount
    }

    const budgetsSpent = budgets.map((b) => ({
      ...b,
      spent: spentByCategory[b.category] ?? 0,
    }))

    return NextResponse.json({ budgets: budgetsSpent, month })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[budgets GET]', e)
    return NextResponse.json({ error: 'Gagal memuat anggaran' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    const body = await req.json().catch(() => ({}))

    const month = typeof body.month === 'string' && MONTH_RE.test(body.month) ? body.month : ''
    const category = typeof body.category === 'string' && body.category.trim() ? body.category.trim() : ''
    const limit = typeof body.limit === 'number' && body.limit >= 0 ? body.limit : NaN

    if (!month || !category || Number.isNaN(limit)) {
      return NextResponse.json(
        { error: 'month (YYYY-MM), category, dan limit wajib diisi' },
        { status: 400 },
      )
    }

    const budget = await db.budget.upsert({
      where: {
        userId_month_category: { userId: user.id, month, category },
      },
      update: { limit },
      create: { userId: user.id, month, category, limit },
    })

    return NextResponse.json({ budget })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[budgets POST]', e)
    return NextResponse.json({ error: 'Gagal menyimpan anggaran' }, { status: 500 })
  }
}
