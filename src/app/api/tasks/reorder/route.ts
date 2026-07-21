import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    const body = await req.json().catch(() => ({}))
    const items = Array.isArray(body.items) ? body.items : null
    if (!items) {
      return NextResponse.json({ error: 'items wajib diisi' }, { status: 400 })
    }

    const updates: Promise<unknown>[] = []
    for (const it of items) {
      if (it && typeof it.id === 'string' && typeof it.order === 'number') {
        updates.push(
          db.task.updateMany({
            where: { id: it.id, userId: user.id },
            data: { order: Math.floor(it.order) },
          }),
        )
      }
    }

    await Promise.all(updates)
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[tasks reorder]', e)
    return NextResponse.json({ error: 'Gagal menyusun ulang tugas' }, { status: 500 })
  }
}
