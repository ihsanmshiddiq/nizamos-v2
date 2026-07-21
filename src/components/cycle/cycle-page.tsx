'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  useMenstrual,
  useCreateMenstrual,
  useDeleteMenstrual,
  type MenstrualLog,
} from '@/hooks/data/use-menstrual'
import {
  format,
  parseISO,
  addDays,
  differenceInCalendarDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  subMonths,
  addMonths,
} from 'date-fns'
import {
  Droplet,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CalendarHeart,
  Sparkles,
  Heart,
  Sun,
} from 'lucide-react'
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
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function CyclePage() {
  const { data, isLoading } = useMenstrual()
  const logs = data?.logs ?? []
  const currentDay = data?.currentDay
  const nextPredicted = data?.nextPredictedDate
  const [month, setMonth] = React.useState(new Date())

  if (isLoading) return <div className="h-96 rounded-2xl bg-card/40 shimmer" />

  const lastLog = logs[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-pink-500">
          Siklus · privasi terjaga
        </p>
        <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
          Kalender menstruasi
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Kalkulator tenang dan privat. Nggak ada data yang keluar dari
          perangkat ini. Matikan permukaan ini kapan aja di Pengaturan.
        </p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-pink-500/20 bg-pink-500/5 p-5 backdrop-blur surface-tactile">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Hari siklus</p>
            <Droplet className="h-4 w-4 text-pink-500" />
          </div>
          <p className="mt-2 font-serif text-3xl font-medium text-pink-600 dark:text-pink-400">
            {currentDay !== null && currentDay !== undefined ? `Hari ${currentDay}` : '—'}
          </p>
          {lastLog && (
            <p className="mt-1 text-xs text-muted-foreground">
              Siklus {lastLog.cycleLength} hari
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Haid berikutnya</p>
            <CalendarHeart className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 font-serif text-2xl font-medium">
            {nextPredicted ? format(parseISO(nextPredicted), 'd MMM') : '—'}
          </p>
          {nextPredicted && (
            <p className="mt-1 text-xs text-muted-foreground">
              dalam {Math.max(0, differenceInCalendarDays(parseISO(nextPredicted), new Date()))} hari
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Siklus tercatat</p>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 font-serif text-2xl font-medium">{logs.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">haid tercatat</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <CycleCalendar month={month} setMonth={setMonth} logs={logs} />
        </div>

        {/* Side: log + history */}
        <div className="space-y-4 lg:col-span-2">
          <LogPeriodCard />
          {logs.length > 0 && <HistoryCard logs={logs} />}
        </div>
      </div>
    </div>
  )
}

function CycleCalendar({
  month,
  setMonth,
  logs,
}: {
  month: Date
  setMonth: (d: Date) => void
  logs: MenstrualLog[]
}) {
  // Build predictions from the last log
  const predictions = React.useMemo(() => {
    if (logs.length === 0) return { period: [] as Date[], fertile: [] as Date[], ovulation: null as Date | null, actual: [] as Date[] }
    const last = logs[0]
    const start = parseISO(last.startDate)
    const cycleLen = last.cycleLength || 28
    const periodLen = last.periodLength || 5
    const periodDays: Date[] = []
    for (let i = 0; i < periodLen; i++) periodDays.push(addDays(start, i))
    // predict next 2 cycles
    for (let c = 1; c <= 2; c++) {
      const ns = addDays(start, cycleLen * c)
      for (let i = 0; i < periodLen; i++) periodDays.push(addDays(ns, i))
    }
    // fertile window: ovulation ~ cycleLen-14, fertile 5 days before + 1 after
    const ovulation = addDays(start, cycleLen - 14)
    const fertile: Date[] = []
    for (let i = -5; i <= 1; i++) fertile.push(addDays(ovulation, i))
    for (let c = 1; c <= 2; c++) {
      const ov = addDays(start, cycleLen * c - 14)
      for (let i = -5; i <= 1; i++) fertile.push(addDays(ov, i))
    }
    // actual logged period days from all logs
    const actual: Date[] = []
    logs.forEach((l) => {
      const s = parseISO(l.startDate)
      const e = l.endDate ? parseISO(l.endDate) : addDays(s, (l.periodLength || 5) - 1)
      eachDayOfInterval({ start: s, end: e }).forEach((d) => actual.push(d))
    })
    return { period: periodDays, fertile, ovulation, actual }
  }, [logs])
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  function dayState(d: Date) {
    const isActual = predictions.actual.some((x) => isSameDay(x, d))
    const isPredicted = !isActual && predictions.period.some((x) => isSameDay(x, d))
    const isFertile = predictions.fertile.some((x) => isSameDay(x, d))
    const isOvulation = predictions.ovulation && isSameDay(predictions.ovulation, d)
    return { isActual, isPredicted, isFertile, isOvulation }
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl font-medium">{format(month, 'MMMM yyyy')}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMonth(subMonths(month, 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMonth(new Date())}
            className="rounded-lg px-2.5 py-1 text-xs font-medium hover:bg-accent"
          >
            Hari ini
          </button>
          <button
            onClick={() => setMonth(addMonths(month, 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => (
          <div key={d} className="text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const inMonth = isSameMonth(d, month)
          const st = dayState(d)
          const today = isToday(d)
          return (
            <div
              key={d.toISOString()}
              className={cn(
                'relative flex aspect-square items-center justify-center rounded-lg text-sm transition',
                !inMonth && 'opacity-30',
                st.isActual && 'bg-pink-500/25 font-semibold text-pink-700 dark:text-pink-300',
                st.isPredicted && 'border border-dashed border-pink-400/60 text-pink-500',
                st.isFertile && !st.isActual && !st.isPredicted && 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
                !st.isActual && !st.isPredicted && !st.isFertile && inMonth && 'hover:bg-accent/50',
                today && 'ring-1 ring-primary ring-offset-1 ring-offset-background'
              )}
              title={
                st.isActual ? 'Haid (tercatat)' :
                st.isPredicted ? 'Haid (prediksi)' :
                st.isFertile ? 'Masa subur' : ''
              }
            >
              {st.isOvulation && <Sun className="absolute h-3 w-3 text-amber-500" style={{ top: 2, right: 2 }} />}
              <span>{format(d, 'd')}</span>
              {st.isActual && <Droplet className="absolute bottom-1 h-2.5 w-2.5 text-pink-500" />}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-pink-500/40" /> Haid
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-dashed border-pink-400" /> Prediksi
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-violet-500/30" /> Subur
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Sun className="h-2.5 w-2.5 text-amber-500" /> Ovulasi
        </span>
      </div>
    </div>
  )
}

function LogPeriodCard() {
  const create = useCreateMenstrual()
  const [open, setOpen] = React.useState(false)
  const [startDate, setStartDate] = React.useState(format(new Date(), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = React.useState('')
  const [cycleLength, setCycleLength] = React.useState('28')
  const [periodLength, setPeriodLength] = React.useState('5')

  function submit() {
    if (!startDate) {
      toast.error('Pilih tanggal mulai')
      return
    }
    create.mutate(
      {
        startDate,
        endDate: endDate || undefined,
        cycleLength: parseInt(cycleLength, 10) || 28,
        periodLength: parseInt(periodLength, 10) || 5,
      },
      {
        onSuccess: () => {
          toast.success('Haid dicatat')
          setOpen(false)
        },
      }
    )
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile">
      <div className="mb-3 flex items-center gap-2">
        <Heart className="h-4 w-4 text-pink-500" />
        <h3 className="font-serif text-lg font-medium">Catat haid</h3>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Catat kapan mulainya. Kalender bakal memprediksi yang berikutnya.
      </p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="h-4 w-4" />
            Catat haid
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Catat haid</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Tanggal mulai</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal selesai (opsional)</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Panjang siklus</Label>
                <Input type="number" min={20} max={40} value={cycleLength} onChange={(e) => setCycleLength(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Lama haid</Label>
                <Input type="number" min={1} max={10} value={periodLength} onChange={(e) => setPeriodLength(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">Batal</Button></DialogClose>
            <Button onClick={submit} disabled={create.isPending}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function HistoryCard({ logs }: { logs: MenstrualLog[] }) {
  const del = useDeleteMenstrual()
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile">
      <h3 className="mb-3 font-serif text-lg font-medium">Riwayat</h3>
      <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
        {logs.map((l) => (
          <div key={l.id} className="group flex items-center gap-3 rounded-lg border border-border/40 bg-background/40 px-3 py-2">
            <Droplet className="h-4 w-4 shrink-0 text-pink-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {format(parseISO(l.startDate), 'd MMM yyyy')}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {l.periodLength}-day period · {l.cycleLength}-day cycle
              </p>
            </div>
            <button
              onClick={() => del.mutate(l.id)}
              className="shrink-0 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
