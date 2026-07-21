import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser()
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from') ?? ''
    const to = searchParams.get('to') ?? ''
    if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
      return NextResponse.json({ error: 'from dan to harus YYYY-MM-DD' }, { status: 400 })
    }

    const logs = await db.sholatLog.findMany({
      where: {
        userId: user.id,
        date: { gte: from, lte: to },
      },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ logs })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[sholat range GET]', e)
    return NextResponse.json({ error: 'Gagal memuat rentang log' }, { status: 500 })
  }
}
