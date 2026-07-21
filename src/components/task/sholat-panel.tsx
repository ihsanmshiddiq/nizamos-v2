'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useSholat, useSaveSholat, type SholatLog } from '@/hooks/data/use-life'
import { format, subDays, isToday, parseISO } from 'date-fns'
import { Sunrise, Sun, CloudSun, Sunset, Moon, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const prayers = [
  { key: 'subuh', label: 'Subuh', time: 'Fajr', icon: Sunrise, tint: 'from-sky-500/20 to-transparent', hex: '#0ea5e9' },
  { key: 'dzuhur', label: 'Dzuhur', time: 'Dhuhr', icon: Sun, tint: 'from-amber-500/20 to-transparent', hex: '#f59e0b' },
  { key: 'ashar', label: 'Ashar', time: 'Asr', icon: CloudSun, tint: 'from-orange-500/20 to-transparent', hex: '#f97316' },
  { key: 'maghrib', label: 'Maghrib', time: 'Maghrib', icon: Sunset, tint: 'from-rose-500/20 to-transparent', hex: '#f43f5e' },
  { key: 'isya', label: 'Isya', time: 'Isha', icon: Moon, tint: 'from-violet-500/20 to-transparent', hex: '#8b5cf6' },
] as const

export function SholatPanel() {
  const [offset, setOffset] = React.useState(0) // days from today
  const date = format(subDays(new Date(), offset), 'yyyy-MM-dd')
  const { data, isLoading } = useSholat(date)
  const save = useSaveSholat()
  const log = data?.log

  const history = data?.history ?? []
  const weekDays = Array.from({ length: 7 }, (_, k) => subDays(new Date(), 6 - k))
  const todayCount = log ? prayers.filter((p) => log[p.key]).length : 0

  function toggle(key: keyof SholatLog) {
    if (!log) return
    const next = { ...log, [key]: !log[key] }
    save.mutate({ date, [key]: next[key] })
  }

  if (isLoading) return <div className="h-64 rounded-2xl bg-card/40 shimmer" />

  return (
    <div className="space-y-5">
      {/* Date navigator */}
      <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/50 px-4 py-3 backdrop-blur surface-tactile">
        <button
          onClick={() => setOffset((o) => Math.min(o + 1, 30))}
          disabled={offset >= 30}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <p className="font-serif text-lg font-medium">
            {isToday(parseISO(date)) ? 'Hari ini' : format(parseISO(date), 'EEEE')}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(parseISO(date), 'd MMMM yyyy')}
          </p>
        </div>
        <button
          onClick={() => setOffset((o) => Math.max(o - 1, 0))}
          disabled={offset <= 0}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Prayer cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {prayers.map((p, i) => {
          const done = log?.[p.key] ?? false
          return (
            <motion.button
              key={p.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => toggle(p.key as keyof SholatLog)}
              disabled={!log || save.isPending}
              className={cn(
                'group relative overflow-hidden rounded-2xl border p-4 text-left transition',
                done
                  ? 'border-transparent bg-primary/10'
                  : 'border-border/60 bg-card/50 hover:border-primary/40 hover:bg-primary/5'
              )}
            >
              <div
                className={cn('absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl transition group-hover:scale-125', p.tint)}
                style={{ opacity: done ? 1 : 0.5 }}
              />
              <div className="relative flex items-start justify-between">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/40 bg-background/60"
                  style={{ color: p.hex }}
                >
                  <p.icon className="h-5 w-5" />
                </div>
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full border-2 transition',
                    done ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                  )}
                >
                  {done && <Check className="h-3.5 w-3.5" />}
                </div>
              </div>
              <div className="relative mt-3">
                <p className="font-serif text-lg font-medium">{p.label}</p>
                <p className="text-[11px] text-muted-foreground">{p.time}</p>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Today summary */}
      <div className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {isToday(parseISO(date)) ? 'Progres hari ini' : 'Hari itu'}
            </p>
            <p className="mt-1 font-serif text-3xl font-medium">
              {todayCount}
              <span className="text-muted-foreground">/5</span>
            </p>
          </div>
          <div className="flex gap-1.5">
            {prayers.map((p) => (
              <div
                key={p.key}
                className="h-2.5 w-8 rounded-full transition"
                style={{
                  backgroundColor: log?.[p.key] ? p.hex : 'var(--muted)',
                  opacity: log?.[p.key] ? 1 : 0.4,
                }}
              />
            ))}
          </div>
        </div>
        {todayCount === 5 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-sm text-primary"
          >
            Maa syaa Allah — lima waktu terjaga. Baarokallaahu fiik.
          </motion.p>
        )}
      </div>

      {/* Weekly view */}
      <div className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile">
        <p className="mb-3 text-[11px] uppercase tracking-wider text-muted-foreground">
          7 hari terakhir
        </p>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((d) => {
            const ds = format(d, 'yyyy-MM-dd')
            const dayLog = history.find((l) => l.date === ds)
            const count = dayLog
              ? prayers.filter((p) => dayLog[p.key as keyof SholatLog]).length
              : 0
            return (
              <button
                key={ds}
                onClick={() => setOffset(Math.floor((Date.now() - parseISO(ds).getTime()) / 86400000))}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border p-2 transition hover:border-primary/40',
                  offset === Math.floor((Date.now() - parseISO(ds).getTime()) / 86400000)
                    ? 'border-primary bg-primary/5'
                    : 'border-border/50'
                )}
              >
                <span className="text-[10px] text-muted-foreground">
                  {format(d, 'EEEEE')}
                </span>
                <div className="flex flex-col gap-0.5">
                  {prayers.map((p) => (
                    <div
                      key={p.key}
                      className="h-1.5 w-6 rounded-full"
                      style={{
                        backgroundColor: dayLog?.[p.key as keyof SholatLog] ? p.hex : 'var(--muted)',
                        opacity: dayLog?.[p.key as keyof SholatLog] ? 1 : 0.3,
                      }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-medium">{count}/5</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
