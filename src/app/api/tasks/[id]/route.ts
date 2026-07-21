import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'

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

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params
    const body = await req.json().catch(() => ({}))

    const existing = await db.task.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (typeof body.title === 'string' && body.title.trim()) data.title = body.title.trim()
    if (typeof body.notes === 'string') data.notes = body.notes.trim() || null
    if (typeof body.priority === 'string' && ['low', 'medium', 'high'].includes(body.priority)) {
      data.priority = body.priority
    }
    if (typeof body.order === 'number') data.order = Math.floor(body.order)
    if (typeof body.completed === 'boolean') data.completed = body.completed

    if (body.dueDate !== undefined) {
      if (body.dueDate === null) {
        data.dueDate = null
      } else if (typeof body.dueDate === 'string') {
        const d = new Date(body.dueDate)
        if (!Number.isNaN(d.getTime())) data.dueDate = d
      }
    }
    if (body.targetId !== undefined) {
      if (body.targetId === null) {
        data.targetId = null
      } else if (typeof body.targetId === 'string') {
        const t = await db.target.findFirst({
          where: { id: body.targetId.trim(), userId: user.id },
        })
        if (!t) {
          return NextResponse.json({ error: 'Target tidak ditemukan' }, { status: 404 })
        }
        data.targetId = t.id
      }
    }

    const completedChanged =
      typeof body.completed === 'boolean' && body.completed !== existing.completed

    const task = await db.task.update({ where: { id }, data })

    if (completedChanged && (task.targetId || existing.targetId)) {
      const targetId = task.targetId ?? existing.targetId
      if (targetId) await recomputeTargetProgress(targetId)
    }

    return NextResponse.json({ task })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[tasks PATCH]', e)
    return NextResponse.json({ error: 'Gagal memperbarui tugas' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params

    const existing = await db.task.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    await db.task.delete({ where: { id } })

    if (existing.targetId) {
      await recomputeTargetProgress(existing.targetId)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[tasks DELETE]', e)
    return NextResponse.json({ error: 'Gagal menghapus tugas' }, { status: 500 })
  }
}
