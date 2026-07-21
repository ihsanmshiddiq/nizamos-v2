import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params
    const body = await req.json().catch(() => ({}))

    const existing = await db.menstrualLog.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (typeof body.startDate === 'string' && DATE_RE.test(body.startDate)) {
      data.startDate = body.startDate
    }
    if (body.endDate !== undefined) {
      if (body.endDate === null) {
        data.endDate = null
      } else if (typeof body.endDate === 'string' && DATE_RE.test(body.endDate)) {
        data.endDate = body.endDate
      }
    }
    if (typeof body.cycleLength === 'number' && body.cycleLength > 0) {
      data.cycleLength = Math.floor(body.cycleLength)
    }
    if (typeof body.periodLength === 'number' && body.periodLength > 0) {
      data.periodLength = Math.floor(body.periodLength)
    }
    if (typeof body.symptoms === 'string') {
      data.symptoms = body.symptoms.trim() || null
    }

    const log = await db.menstrualLog.update({ where: { id }, data })
    return NextResponse.json({ log })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[menstrual PATCH]', e)
    return NextResponse.json({ error: 'Gagal memperbarui siklus' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params

    const existing = await db.menstrualLog.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    await db.menstrualLog.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[menstrual DELETE]', e)
    return NextResponse.json({ error: 'Gagal menghapus siklus' }, { status: 500 })
  }
}
