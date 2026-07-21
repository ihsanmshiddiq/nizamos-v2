import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await requireUser()
    const targets = await db.target.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      include: { tasks: { orderBy: { order: 'asc' } } },
    })
    return NextResponse.json({ targets })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[targets GET]', e)
    return NextResponse.json({ error: 'Gagal memuat target' }, { status: 500 })
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

    const description =
      typeof body.description === 'string' && body.description.trim() ? body.description.trim() : null
    const category =
      typeof body.category === 'string' &&
      ['personal', 'career', 'deen', 'health', 'finance'].includes(body.category)
        ? body.category
        : 'personal'
    const deadline =
      typeof body.deadline === 'string' ? new Date(body.deadline) : null
    if (deadline && Number.isNaN(deadline.getTime())) {
      return NextResponse.json({ error: 'Deadline tidak valid' }, { status: 400 })
    }

    const target = await db.target.create({
      data: {
        userId: user.id,
        title,
        description,
        category,
        deadline: deadline ?? null,
      },
    })

    return NextResponse.json({ target })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[targets POST]', e)
    return NextResponse.json({ error: 'Gagal membuat target' }, { status: 500 })
  }
}
