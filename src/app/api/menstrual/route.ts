import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { format, differenceInCalendarDays, addDays, parseISO } from 'date-fns'

export const dynamic = 'force-dynamic'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

interface CycleInfo {
  currentDay: number | null
  nextPredictedDate: string | null
}

function computeCycleInfo(
  logs: Array<{ startDate: string; cycleLength: number; periodLength: number }>,
): CycleInfo {
  if (logs.length === 0) {
    return { currentDay: null, nextPredictedDate: null }
  }
  // logs assumed sorted desc by startDate
  const latest = logs[0]
  const latestStart = parseISO(latest.startDate + 'T00:00:00')
  const today = new Date()
  const currentDay = differenceInCalendarDays(today, latestStart) + 1

  const nextPredictedDate = format(
    addDays(latestStart, latest.cycleLength),
    'yyyy-MM-dd',
  )

  return { currentDay, nextPredictedDate }
}

export async function GET() {
  try {
    const user = await requireUser()
    const logs = await db.menstrualLog.findMany({
      where: { userId: user.id },
      orderBy: { startDate: 'desc' },
    })

    const cycle = computeCycleInfo(logs)
    return NextResponse.json({ logs, ...cycle })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[menstrual GET]', e)
    return NextResponse.json({ error: 'Gagal memuat siklus' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    const body = await req.json().catch(() => ({}))

    const startDate = typeof body.startDate === 'string' ? body.startDate : ''
    if (!DATE_RE.test(startDate)) {
      return NextResponse.json(
        { error: 'startDate (YYYY-MM-DD) wajib diisi' },
        { status: 400 },
      )
    }

    const endDate =
      typeof body.endDate === 'string' && DATE_RE.test(body.endDate) ? body.endDate : null
    const cycleLength =
      typeof body.cycleLength === 'number' && body.cycleLength > 0 ? Math.floor(body.cycleLength) : 28
    const periodLength =
      typeof body.periodLength === 'number' && body.periodLength > 0 ? Math.floor(body.periodLength) : 5
    const symptoms =
      typeof body.symptoms === 'string' && body.symptoms.trim() ? body.symptoms.trim() : null

    const log = await db.menstrualLog.create({
      data: {
        userId: user.id,
        startDate,
        endDate,
        cycleLength,
        periodLength,
        symptoms,
      },
    })

    return NextResponse.json({ log })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[menstrual POST]', e)
    return NextResponse.json({ error: 'Gagal menyimpan siklus' }, { status: 500 })
  }
}
