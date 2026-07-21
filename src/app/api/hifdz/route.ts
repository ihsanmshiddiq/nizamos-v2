import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await requireUser()
    const items = await db.hifdzItem.findMany({
      where: { userId: user.id },
      orderBy: [{ surahNumber: 'asc' }, { fromAyah: 'asc' }],
    })

    const totalAyahs = items.reduce((acc, it) => acc + (it.toAyah - it.fromAyah + 1), 0)
    const byStatus: Record<string, number> = {}
    for (const it of items) {
      byStatus[it.status] = (byStatus[it.status] ?? 0) + 1
    }

    return NextResponse.json({ items, summary: { totalAyahs, count: items.length, byStatus } })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[hifdz GET]', e)
    return NextResponse.json({ error: 'Gagal memuat hifdz' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    const body = await req.json().catch(() => ({}))

    const surah = typeof body.surah === 'string' ? body.surah.trim() : ''
    const surahNumber = typeof body.surahNumber === 'number' ? Math.floor(body.surahNumber) : NaN
    const fromAyah = typeof body.fromAyah === 'number' ? Math.floor(body.fromAyah) : NaN
    const toAyah = typeof body.toAyah === 'number' ? Math.floor(body.toAyah) : NaN

    if (!surah || Number.isNaN(surahNumber) || Number.isNaN(fromAyah) || Number.isNaN(toAyah)) {
      return NextResponse.json(
        { error: 'surah, surahNumber, fromAyah, toAyah wajib diisi' },
        { status: 400 },
      )
    }
    if (toAyah < fromAyah) {
      return NextResponse.json({ error: 'toAyah harus >= fromAyah' }, { status: 400 })
    }

    const status =
      typeof body.status === 'string' &&
      ['learning', 'memorized', 'reviewing', 'weak'].includes(body.status)
        ? body.status
        : 'learning'

    const item = await db.hifdzItem.create({
      data: {
        userId: user.id,
        surah,
        surahNumber,
        fromAyah,
        toAyah,
        status,
        lastReviewed: status === 'memorized' ? new Date() : null,
      },
    })

    return NextResponse.json({ item })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[hifdz POST]', e)
    return NextResponse.json({ error: 'Gagal menambah hifdz' }, { status: 500 })
  }
}
