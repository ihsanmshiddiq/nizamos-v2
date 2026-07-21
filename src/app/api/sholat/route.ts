import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { format, subDays } from 'date-fns'

export const dynamic = 'force-dynamic'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser()
    const { searchParams } = new URL(req.url)
    const dateParam = searchParams.get('date')
    const today = dateParam && DATE_RE.test(dateParam) ? dateParam : format(new Date(), 'yyyy-MM-dd')
    const since = format(subDays(new Date(today), 30), 'yyyy-MM-dd')

    const todayLog = await db.sholatLog.findUnique({
      where: { userId_date: { userId: user.id, date: today } },
    })

    const history = await db.sholatLog.findMany({
      where: {
        userId: user.id,
        date: { gte: since, lte: today },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({
      date: today,
      log: todayLog ?? {
        date: today,
        subuh: false,
        dzuhur: false,
        ashar: false,
        maghrib: false,
        isya: false,
      },
      history,
    })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[sholat GET]', e)
    return NextResponse.json({ error: 'Gagal memuat log sholat' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireUser()
    const body = await req.json().catch(() => ({}))

    const date = typeof body.date === 'string' ? body.date : ''
    if (!DATE_RE.test(date)) {
      return NextResponse.json({ error: 'Format tanggal tidak valid (YYYY-MM-DD)' }, { status: 400 })
    }

    const existing = await db.sholatLog.findUnique({
      where: { userId_date: { userId: user.id, date } },
    })

    const data = {
      subuh: typeof body.subuh === 'boolean' ? body.subuh : existing?.subuh ?? false,
      dzuhur: typeof body.dzuhur === 'boolean' ? body.dzuhur : existing?.dzuhur ?? false,
      ashar: typeof body.ashar === 'boolean' ? body.ashar : existing?.ashar ?? false,
      maghrib: typeof body.maghrib === 'boolean' ? body.maghrib : existing?.maghrib ?? false,
      isya: typeof body.isya === 'boolean' ? body.isya : existing?.isya ?? false,
    }

    const log = await db.sholatLog.upsert({
      where: { userId_date: { userId: user.id, date } },
      update: data,
      create: { userId: user.id, date, ...data },
    })

    return NextResponse.json({ log })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[sholat PUT]', e)
    return NextResponse.json({ error: 'Gagal menyimpan log sholat' }, { status: 500 })
  }
}
