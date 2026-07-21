'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useHabits, useToggleHabit, useCreateHabit, useDeleteHabit, type Habit } from '@/hooks/data/use-life'
import { format, subDays, isToday, isSameDay, parseISO } from 'date-fns'
import { Plus, Flame, MoreVertical, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getColor, colorMap, type AccentColor } from '@/lib/colors'

const ICONS = ['✦', '☾', '◉', '❋', '✿', '◆', '△', '✸']
const COLORS: AccentColor[] = [
  'emerald', 'amber', 'teal', 'rose', 'lime', 'pink', 'sky', 'violet',
]

export function HabitPanel() {
  const { data, isLoading } = useHabits()
  const habits = data?.habits ?? []
  const today = format(new Date(), 'yyyy-MM-dd')
  const doneToday = habits.filter((h) => h.logs.some((l) => l.date === today)).length

  if (isLoading) return <HabitSkeleton />

  return (
    <div className="space-y-5">
      {/* Summary band */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Hari ini" value={`${doneToday}/${habits.length || 0}`} accent="emerald" />
        <StatCard
          label="Rentetan terbaik"
          value={`${habits.reduce((m, h) => Math.max(m, calcStreak(h)), 0)}h`}
          accent="amber"
        />
        <StatCard label="Kebiasaan aktif" value={`${habits.length}`} accent="teal" />
        <StatCard
          label="Minggu ini"
          value={`${Math.round(
            (habits.reduce((s, h) => s + h.logs.filter((l) => within7(l.date)).length, 0) /
              Math.max(habits.length * 7, 1)) * 100
          )}%`}
          accent="rose"
        />
      </div>

      {habits.length === 0 ? (
        <EmptyHabit />
      ) : (
        <div className="space-y-3">
          {habits.map((h, i) => (
            <HabitRow key={h.id} habit={h} index={i} />
          ))}
        </div>
      )}

      <AddHabitButton />
    </div>
  )
}

function HabitRow({ habit, index }: { habit: Habit; index: number }) {
  const toggle = useToggleHabit()
  const del = useDeleteHabit()
  const today = format(new Date(), 'yyyy-MM-dd')
  const doneToday = habit.logs.some((l) => l.date === today)
  const streak = calcStreak(habit)
  const color = getColor(habit.color)
  const icon = habit.icon || '✦'

  const days = Array.from({ length: 7 }, (_, k) => subDays(new Date(), 6 - k))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur surface-tactile transition hover:border-primary/30"
    >
      <div className="flex items-center gap-3">
        {/* Today toggle */}
        <button
          onClick={() => toggle.mutate({ id: habit.id, date: today })}
          disabled={toggle.isPending}
          className={cn(
            'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-lg transition',
            doneToday
              ? cn('border-transparent', color.fillBg, color.fillText)
              : 'border-dashed border-border bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-primary'
          )}
          aria-label={doneToday ? 'Tandai belum selesai' : 'Tandai selesai'}
        >
          <span>{icon}</span>
          {doneToday && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="4">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
          )}
        </button>

        {/* Title + meta */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{habit.title}</p>
          <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Flame className={cn('h-3 w-3', streak > 0 ? 'text-amber-500' : 'text-muted-foreground/50')} />
              {streak} hari
            </span>
            <span className="capitalize">{habit.schedule === 'daily' ? 'harian' : habit.schedule}</span>
            {habit.targetCount > 1 && <span>×{habit.targetCount}/hari</span>}
          </div>
        </div>

        {/* 7-day grid */}
        <div className="flex items-center gap-1.5">
          {days.map((d) => {
            const ds = format(d, 'yyyy-MM-dd')
            const done = habit.logs.some((l) => l.date === ds)
            const isTodayCell = isToday(d)
            return (
              <button
                key={ds}
                onClick={() => toggle.mutate({ id: habit.id, date: ds })}
                disabled={toggle.isPending}
                className={cn(
                  'flex h-8 w-8 flex-col items-center justify-center rounded-lg border text-[9px] font-medium transition',
                  done
                    ? cn('border-transparent', color.fillBg, color.fillText)
                    : 'border-border/60 bg-background/40 text-muted-foreground/60 hover:border-primary/30',
                  isTodayCell && 'ring-1 ring-primary/40 ring-offset-1 ring-offset-background'
                )}
                title={format(d, 'EEE, MMM d')}
              >
                <span className="leading-none">{format(d, 'EEEEE')}</span>
              </button>
            )
          })}
        </div>

        {/* Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition hover:bg-accent group-hover:opacity-100">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => {
                del.mutate(habit.id, {
                  onSuccess: () => toast.success('Kebiasaan dihapus'),
                })
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )
}

function AddHabitButton() {
  const create = useCreateHabit()
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState('')
  const [icon, setIcon] = React.useState(ICONS[0])
  const [color, setColor] = React.useState(COLORS[0])

  function submit() {
    if (!title.trim()) {
      toast.error('Beri nama kebiasaanmu')
      return
    }
    create.mutate(
      { title: title.trim(), icon, color, schedule: 'daily', targetCount: 1 },
      {
        onSuccess: () => {
          toast.success('Kebiasaan ditambahkan')
          setTitle('')
          setOpen(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 bg-card/30 py-4 text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
          <Plus className="h-4 w-4" />
          Kebiasaan baru
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Kebiasaan baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Kebiasaan apa?</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="cth. Baca 10 halaman, Minum air, Sholat dhuha"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Ikon</Label>
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition',
                    icon === ic
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-accent'
                  )}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Warna</Label>
            <div className="flex flex-wrap gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-8 w-8 rounded-lg border-2 transition',
                    color === c ? 'border-foreground' : 'border-transparent'
                  )}
                  style={{ backgroundColor: colorMap[c].hex + '55' }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Batal</Button>
          </DialogClose>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending ? 'Menambah…' : 'Tambah kebiasaan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EmptyHabit() {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-card/30 p-12 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Flame className="h-5 w-5" />
      </div>
      <p className="font-serif text-lg">Belum ada kebiasaan</p>
      <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
        Mulai dari yang kecil. Satu kebiasaan, dilakukan setiap hari, menjadi
        sebuah kehidupan.
      </p>
    </div>
  )
}

function HabitSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-20 rounded-2xl border border-border/60 bg-card/40 shimmer" />
      ))}
    </div>
  )
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur surface-tactile">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn('mt-1 font-serif text-2xl font-medium', getColor(accent).stat)}>
        {value}
      </p>
    </div>
  )
}

function calcStreak(habit: Habit): number {
  const dates = new Set(habit.logs.map((l) => l.date))
  let streak = 0
  let d = new Date()
  // allow today to be missed without breaking streak
  if (!dates.has(format(d, 'yyyy-MM-dd'))) {
    d = subDays(d, 1)
  }
  while (dates.has(format(d, 'yyyy-MM-dd'))) {
    streak++
    d = subDays(d, 1)
  }
  return streak
}

function within7(ds: string): boolean {
  const d = parseISO(ds)
  const sevenAgo = subDays(new Date(), 7)
  return d >= sevenAgo
}
