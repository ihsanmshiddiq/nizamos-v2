import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { format, startOfDay, endOfDay } from 'date-fns'

export const dynamic = 'force-dynamic'

async function recomputeTargetProgress(targetId: string) {
  const tasks = await db.task.findMany({ where: { targetId } })
  if (tasks.length === 0) {
    await db.target.update({ where: { id: targetId }, data: { progress: 0 } })
    return 0
  }
  const completed = tasks.filter((t) => t.completed).length
  const progress = Math.round((completed / tasks.length) * 100)
  await db.target.update({ where: { id: targetId }, data: { progress } })
  return progress
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser()
    const { searchParams } = new URL(req.url)
    const targetId = searchParams.get('targetId')
    const date = searchParams.get('date')
    const scope = searchParams.get('scope')

    const where: Record<string, unknown> = { userId: user.id }
    if (targetId) where.targetId = targetId

    if (scope === 'today' || date) {
      const dayStr = date && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? date
        : format(new Date(), 'yyyy-MM-dd')
      const day = new Date(dayStr + 'T00:00:00')
      const start = startOfDay(day)
      const end = endOfDay(day)
      // Tasks due today OR all uncompleted
      where.OR = [
        { dueDate: { gte: start, lte: end } },
        { completed: false },
      ]
    }

    const tasks = await db.task.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ tasks })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[tasks GET]', e)
    return NextResponse.json({ error: 'Gagal memuat tugas' }, { status: 500 })
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

    const notes =
      typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null
    const priority =
      typeof body.priority === 'string' && ['low', 'medium', 'high'].includes(body.priority)
        ? body.priority
        : 'medium'

    let targetId: string | null = null
    if (typeof body.targetId === 'string' && body.targetId.trim()) {
      const t = await db.target.findFirst({
        where: { id: body.targetId.trim(), userId: user.id },
      })
      if (!t) {
        return NextResponse.json({ error: 'Target tidak ditemukan' }, { status: 404 })
      }
      targetId = t.id
    }

    let dueDate: Date | null = null
    if (typeof body.dueDate === 'string') {
      const d = new Date(body.dueDate)
      if (!Number.isNaN(d.getTime())) dueDate = d
    }

    const task = await db.task.create({
      data: {
        userId: user.id,
        targetId,
        title,
        notes,
        priority,
        dueDate,
        order: 0,
        completed: false,
      },
    })

    if (targetId) {
      await recomputeTargetProgress(targetId)
    }

    return NextResponse.json({ task })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[tasks POST]', e)
    return NextResponse.json({ error: 'Gagal membuat tugas' }, { status: 500 })
  }
}
