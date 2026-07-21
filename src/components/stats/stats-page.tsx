'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useHabits, useSholat } from '@/hooks/data/use-life'
import { useTransactions, useBudgets, useSavings } from '@/hooks/data/use-finance'
import { format, subDays } from 'date-fns'
import {
  BarChart3,
  Sparkles,
  Moon,
  Wallet,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

/* ── Mini Bar Chart ── */
function MiniBarChart({
  data,
  maxVal,
  color = 'bg-primary',
}: {
  data: { label: string; value: number }[]
  maxVal: number
  color?: string
}) {
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d, i) => {
        const pct = maxVal > 0 ? (d.value / maxVal) * 100 : 0
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[9px] text-muted-foreground">{d.value}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(pct, 2)}%` }}
              transition={{ duration: 0.5, delay: i * 0.03 }}
              className={`w-full rounded-t-md ${color}`}
            />
            <span className="text-[9px] text-muted-foreground truncate w-full text-center">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Donut Chart ── */
function DonutChart({
  segments,
  size = 120,
  strokeWidth = 14,
}: {
  segments: { value: number; color: string; label: string }[]
  size?: number
  strokeWidth?: number
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="shrink-0 -rotate-90">
        {segments.map((seg, i) => {
          const pct = (seg.value / total) * circumference
          const dashOffset = offset
          offset += pct
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${pct} ${circumference - pct}`}
              strokeDashoffset={-dashOffset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          )
        })}
      </svg>
      <div className="space-y-1.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-muted-foreground">{seg.label}</span>
            <span className="font-medium">{Math.round((seg.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatsPage() {
  const { data: habitData } = useHabits()
  const { data: sholatData } = useSholat()
  const { data: txData } = useTransactions()
  const { data: budgetData } = useBudgets()
  const { data: savingsData } = useSavings()

  const habits = habitData?.habits ?? []
  const history = sholatData?.history ?? []
  const transactions = txData?.transactions ?? []
  const totalIncome = txData?.totalIncome ?? 0
  const totalExpense = txData?.totalExpense ?? 0
  const budgets = budgetData?.budgets ?? []
  const savings = savingsData?.goals ?? []

  // Habit consistency last 7 days
  const habitWeekData = React.useMemo(() => {
    const days: { label: string; value: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i)
      const dateStr = format(d, 'yyyy-MM-dd')
      const count = habits.filter((h) => h.logs.some((l) => l.date === dateStr)).length
      days.push({ label: format(d, 'EEE'), value: count })
    }
    return days
  }, [habits])

  // Sholat completion last 7 days
  const sholatWeekData = React.useMemo(() => {
    const days: { label: string; value: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i)
      const dateStr = format(d, 'yyyy-MM-dd')
      const log = history.find((h) => h.date === dateStr)
      const count = log
        ? [log.subuh, log.dzuhur, log.ashar, log.maghrib, log.isya].filter(Boolean).length
        : 0
      days.push({ label: format(d, 'EEE'), value: count })
    }
    return days
  }, [history])

  // Expense by category
  const expenseByCategory = React.useMemo(() => {
    const cats: Record<string, number> = {}
    transactions
      .filter((t) => t.type === 'expense' && t.category)
      .forEach((t) => {
        cats[t.category!] = (cats[t.category!] || 0) + t.amount
      })
    return Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
  }, [transactions])

  const maxHabit = Math.max(...habitWeekData.map((d) => d.value), 1)
  const maxSholat = 5

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary">
          Statistik & Analitik
        </p>
        <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
          Gambaran hidupmu
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pantau konsistensi dan pola hidupmu dalam satu pandangan.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Kebiasaan aktif', value: habits.length, icon: Sparkles, tint: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Sholat minggu ini', value: `${sholatWeekData.reduce((s, d) => s + d.value, 0)}/35`, icon: Moon, tint: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Total pemasukan', value: `Rp ${Math.round(totalIncome).toLocaleString('id-ID')}`, icon: TrendingUp, tint: 'text-emerald-600', bg: 'bg-emerald-500/10' },
          { label: 'Total pengeluaran', value: `Rp ${Math.round(totalExpense).toLocaleString('id-ID')}`, icon: TrendingDown, tint: 'text-rose-500', bg: 'bg-rose-500/10' },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur surface-tactile"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
              <s.icon className={`h-4 w-4 ${s.tint}`} />
            </div>
            <p className="mt-2 font-serif text-lg font-medium">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Habit Consistency */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-medium">Konsistensi Kebiasaan</h2>
              <p className="text-[10px] text-muted-foreground">7 hari terakhir</p>
            </div>
            <Sparkles className="h-4 w-4 text-emerald-500" />
          </div>
          <MiniBarChart data={habitWeekData} maxVal={maxHabit} color="bg-emerald-500" />
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Rata-rata: {(habitWeekData.reduce((s, d) => s + d.value, 0) / 7).toFixed(1)} kebiasaan/hari</span>
            <span className="font-medium text-primary">
              {Math.round((habitWeekData.filter((d) => d.value > 0).length / 7) * 100)}% aktif
            </span>
          </div>
        </motion.div>

        {/* Sholat Consistency */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-medium">Sholat 5 Waktu</h2>
              <p className="text-[10px] text-muted-foreground">7 hari terakhir</p>
            </div>
            <Moon className="h-4 w-4 text-amber-500" />
          </div>
          <MiniBarChart data={sholatWeekData} maxVal={maxSholat} color="bg-amber-500" />
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Total: {sholatWeekData.reduce((s, d) => s + d.value, 0)}/35 sholat</span>
            <span className="font-medium text-primary">
              {Math.round((sholatWeekData.reduce((s, d) => s + d.value, 0) / 35) * 100)}% completion
            </span>
          </div>
        </motion.div>

        {/* Expense Donut */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-medium">Pengeluaran per Kategori</h2>
              <p className="text-[10px] text-muted-foreground">Bulan ini</p>
            </div>
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          {expenseByCategory.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Belum ada data pengeluaran.</p>
          ) : (
            <DonutChart
              segments={expenseByCategory.map(([cat, val], i) => ({
                label: cat,
                value: val,
                color: [
                  'oklch(0.46 0.09 165)',
                  'oklch(0.7 0.13 80)',
                  'oklch(0.62 0.14 250)',
                  'oklch(0.7 0.16 25)',
                  'oklch(0.6 0.12 310)',
                  'oklch(0.55 0.1 165)',
                ][i % 6],
              }))}
            />
          )}
        </motion.div>

        {/* Savings Progress */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-medium">Target Tabungan</h2>
              <p className="text-[10px] text-muted-foreground">{savings.length} target aktif</p>
            </div>
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          {savings.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Belum ada target tabungan.</p>
          ) : (
            <div className="space-y-3">
              {savings.map((g) => {
                const pct = g.target > 0 ? Math.min((g.current / g.target) * 100, 100) : 0
                return (
                  <div key={g.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{g.title}</span>
                      <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-amber-500"
                      />
                    </div>
                    <div className="mt-0.5 flex justify-between text-[10px] text-muted-foreground">
                      <span>Rp {Math.round(g.current).toLocaleString('id-ID')}</span>
                      <span>Rp {Math.round(g.target).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Budget Overview */}
      {budgets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile"
        >
          <div className="mb-4">
            <h2 className="font-serif text-lg font-medium">Anggaran Bulan Ini</h2>
            <p className="text-[10px] text-muted-foreground">{budgets.length} kategori</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((b) => {
              const pct = b.limit > 0 ? (b.spent / b.limit) * 100 : 0
              const over = pct > 100
              return (
                <div key={b.id} className="rounded-xl border border-border/50 bg-background/40 p-3">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{b.category}</span>
                    <span className={`text-xs ${over ? 'text-rose-500' : 'text-muted-foreground'}`}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                        over ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Rp {Math.round(b.spent).toLocaleString('id-ID')} / Rp {Math.round(b.limit).toLocaleString('id-ID')}
                  </p>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
