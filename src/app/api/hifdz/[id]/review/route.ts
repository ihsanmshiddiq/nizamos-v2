import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params

    const existing = await db.hifdzItem.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    const item = await db.hifdzItem.update({
      where: { id },
      data: {
        reviewCount: { increment: 1 },
        lastReviewed: new Date(),
      },
    })

    return NextResponse.json({ item })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[hifdz review]', e)
    return NextResponse.json({ error: 'Gagal mereview' }, { status: 500 })
  }
}
