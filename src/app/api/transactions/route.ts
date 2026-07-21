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

    const monthStart = startOfMonth(new Date(month + '-01T00:00:00'))
    const monthEnd = endOfMonth(monthStart)

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: monthStart, lte: monthEnd },
      },
      orderBy: { date: 'desc' },
    })

    let totalIncome = 0
    let totalExpense = 0
    for (const t of transactions) {
      if (t.type === 'income') totalIncome += t.amount
      else if (t.type === 'expense') totalExpense += t.amount
    }

    return NextResponse.json({
      transactions,
      month,
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      },
    })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[transactions GET]', e)
    return NextResponse.json({ error: 'Gagal memuat transaksi' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    const body = await req.json().catch(() => ({}))

    const amount = typeof body.amount === 'number' ? body.amount : NaN
    const type =
      typeof body.type === 'string' && ['income', 'expense'].includes(body.type)
        ? body.type
        : ''

    if (Number.isNaN(amount) || !type) {
      return NextResponse.json(
        { error: 'amount (number) dan type (income|expense) wajib diisi' },
        { status: 400 },
      )
    }

    const category =
      typeof body.category === 'string' && body.category.trim() ? body.category.trim() : null
    const note =
      typeof body.note === 'string' && body.note.trim() ? body.note.trim() : null
    const date =
      typeof body.date === 'string'
        ? (() => {
            const d = new Date(body.date)
            return Number.isNaN(d.getTime()) ? new Date() : d
          })()
        : new Date()

    const transaction = await db.transaction.create({
      data: {
        userId: user.id,
        amount,
        type,
        category,
        note,
        date,
      },
    })

    return NextResponse.json({ transaction })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[transactions POST]', e)
    return NextResponse.json({ error: 'Gagal membuat transaksi' }, { status: 500 })
  }
}
