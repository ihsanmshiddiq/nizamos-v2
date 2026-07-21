import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await requireUser()
    const goals = await db.savingsGoal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ goals })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[savings GET]', e)
    return NextResponse.json({ error: 'Gagal memuat target tabungan' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    const body = await req.json().catch(() => ({}))

    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const target = typeof body.target === 'number' ? body.target : NaN
    if (!title || Number.isNaN(target) || target < 0) {
      return NextResponse.json(
        { error: 'title dan target (number >= 0) wajib diisi' },
        { status: 400 },
      )
    }

    let deadline: Date | null = null
    if (typeof body.deadline === 'string') {
      const d = new Date(body.deadline)
      if (!Number.isNaN(d.getTime())) deadline = d
    }

    const goal = await db.savingsGoal.create({
      data: {
        userId: user.id,
        title,
        target,
        deadline,
        current: 0,
      },
    })

    return NextResponse.json({ goal })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[savings POST]', e)
    return NextResponse.json({ error: 'Gagal membuat target tabungan' }, { status: 500 })
  }
}
