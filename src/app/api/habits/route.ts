import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { format, subDays } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await requireUser()
    const today = format(new Date(), 'yyyy-MM-dd')
    const since = subDays(new Date(), 30)

    const habits = await db.habit.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      include: {
        logs: {
          where: { date: { gte: format(since, 'yyyy-MM-dd'), lte: today } },
        },
      },
    })

    return NextResponse.json({ habits })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[habits GET]', e)
    return NextResponse.json({ error: 'Gagal memuat kebiasaan' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    const body = await req.json().catch(() => ({}))

    const title = typeof body.title === 'string' ? body.title.trim() : ''
    if (!title) {
      return NextResponse.json({ error: 'Judul wajib diisi' }, { status: 400 })
    }

    const icon = typeof body.icon === 'string' && body.icon.trim() ? body.icon.trim() : null
    const color = typeof body.color === 'string' && body.color.trim() ? body.color.trim() : null
    const schedule =
      typeof body.schedule === 'string' && ['daily', 'weekly'].includes(body.schedule)
        ? body.schedule
        : 'daily'
    const targetCount =
      typeof body.targetCount === 'number' && body.targetCount > 0 ? Math.floor(body.targetCount) : 1

    const habit = await db.habit.create({
      data: {
        userId: user.id,
        title,
        icon,
        color,
        schedule,
        targetCount,
      },
    })

    return NextResponse.json({ habit })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[habits POST]', e)
    return NextResponse.json({ error: 'Gagal membuat kebiasaan' }, { status: 500 })
  }
}
