import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

async function recomputeProgress(targetId: string) {
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

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params
    const body = await req.json().catch(() => ({}))

    const existing = await db.target.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (typeof body.title === 'string' && body.title.trim()) data.title = body.title.trim()
    if (typeof body.description === 'string') data.description = body.description.trim() || null
    if (
      typeof body.category === 'string' &&
      ['personal', 'career', 'deen', 'health', 'finance'].includes(body.category)
    ) {
      data.category = body.category
    }
    if (body.deadline !== undefined) {
      if (body.deadline === null) {
        data.deadline = null
      } else if (typeof body.deadline === 'string') {
        const d = new Date(body.deadline)
        if (!Number.isNaN(d.getTime())) data.deadline = d
      }
    }
    if (typeof body.archived === 'boolean') data.archived = body.archived

    const target = await db.target.update({ where: { id }, data })

    // Recompute progress from tasks if tasks exist
    const tasks = await db.task.findMany({ where: { targetId: id } })
    if (tasks.length > 0) {
      await recomputeProgress(id)
      const refreshed = await db.target.findUnique({ where: { id } })
      if (refreshed) {
        return NextResponse.json({ target: refreshed })
      }
    }

    return NextResponse.json({ target })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[targets PATCH]', e)
    return NextResponse.json({ error: 'Gagal memperbarui target' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params

    const existing = await db.target.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    await db.target.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[targets DELETE]', e)
    return NextResponse.json({ error: 'Gagal menghapus target' }, { status: 500 })
  }
}
