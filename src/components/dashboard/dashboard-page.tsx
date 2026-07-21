'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/stores/app-store'
import { useHabits, useSholat } from '@/hooks/data/use-life'
import { useTransactions, useBudgets, useSavings } from '@/hooks/data/use-finance'
import { format } from 'date-fns'
import { InteractiveHeatmap } from '@/components/ui/interactive-heatmap'
import {
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Star,
  Wallet,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Circle,
  ChevronRight,
  Flame,

  PiggyBank,
  BarChart3,
} from 'lucide-react'

/* ── Greeting ── */
function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 5) return 'Selamat malam'
  if (h < 12) return 'Selamat pagi'
  if (h < 17) return 'Selamat siang'
  if (h < 20) return 'Selamat sore'
  return 'Selamat malam'
}

/* ── Quran Verses ── */
const verses = [
  { text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', translation: 'Sesungguhnya bersama kesulitan ada kemudahan.', surah: 'Al-Insyirah: 6' },
  { text: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', translation: 'Dan barangsiapa bertawakal kepada Allah, niscaya Allah akan mencukupkan kebutuhannya.', surah: 'Ath-Thalaq: 3' },
  { text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً', translation: 'Ya Tuhan kami, berilah kami kebaikan di dunia.', surah: 'Al-Baqarah: 201' },
  { text: 'فَاذْكُرُونِي أَذْكُرْكُمْ', translation: 'Maka berilah aku ingat dengan mengingat-Ku, niscaya aku pun akan mengingatmu.', surah: 'Al-Baqarah: 152' },
  { text: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ', translation: 'Dan Dia bersamamu di mana pun kamu berada.', surah: 'Al-Hadid: 4' },
]

/* ── Sholat times ── */
const SHOLAT_TIMES = [
  { name: 'Subuh', icon: Sunrise, time: '04:47' },
  { name: 'Dzuhur', icon: Sun, time: '12:00' },
  { name: 'Ashar', icon: Sunset, time: '15:22' },
  { name: 'Maghrib', icon: Moon, time: '17:56' },
  { name: 'Isya', icon: Star, time: '19:10' },
]

function getNextPrayer() {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  const current = h * 60 + m
  for (let i = 0; i < SHOLAT_TIMES.length; i++) {
    const [ph, pm] = SHOLAT_TIMES[i].time.split(':').map(Number)
    const prayerMin = ph * 60 + pm
    if (current < prayerMin) {
      return { ...SHOLAT_TIMES[i], minutesLeft: prayerMin - current, index: i }
    }
  }
  const [sh, sm] = SHOLAT_TIMES[0].time.split(':').map(Number)
  return { ...SHOLAT_TIMES[0], minutesLeft: (24 * 60 - current) + (sh * 60 + sm), index: 0 }
}

function formatCountdown(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return `${h}j ${m}m`
  return `${m}m`
}

/* ── Ring Chart ── */
function RingChart({ value, max, size = 64, strokeWidth = 5, color }: {
  value: number; max: number; size?: number; strokeWidth?: number; color: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  const offset = circumference * (1 - pct)
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-border/40" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  )
}

/* ── Live Clock ── */
function LiveClock() {
  const [time, setTime] = React.useState(new Date())
  React.useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="font-mono tabular-nums text-3xl font-medium tracking-tight sm:text-4xl">
      {format(time, 'HH:mm')}
      <span className="text-lg text-muted-foreground">:{format(time, 'ss')}</span>
    </div>
  )
}

/* ── Progress Link Card ── */
function ProgressCard({ label, subtitle, value, max, icon: Icon, color, bgColor, onNavigate }: {
  label: string; subtitle: string; value: number; max: number
  icon: React.ElementType; color: string; bgColor: string; onNavigate: () => void
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <button
      onClick={onNavigate}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-4 text-left backdrop-blur surface-tactile transition hover:border-primary/30 hover:bg-card/80"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div className="relative">
          <RingChart value={value} max={max} color={color === 'text-emerald-500' ? 'oklch(0.46 0.09 165)' : color === 'text-amber-500' ? 'oklch(0.7 0.13 80)' : color === 'text-primary' ? 'oklch(0.46 0.09 165)' : 'oklch(0.6 0.12 310)'} />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{pct}%</span>
        </div>
      </div>
      <p className="mt-3 font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
      <div className="mt-2 flex items-center gap-1 text-[11px] text-primary opacity-0 transition group-hover:opacity-100">
        Buka <ChevronRight className="h-3 w-3" />
      </div>
    </button>
  )
}

/* ── Main Dashboard ── */
export function DashboardPage() {
  const { user, setView } = useApp()
  const { data: habitData } = useHabits()
  const { data: sholatData } = useSholat()
  const { data: txData } = useTransactions()
  const { data: budgetData } = useBudgets()
  const { data: savingsData } = useSavings()

  const habits = habitData?.habits ?? []
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayLogs = sholatData?.log
  const history = sholatData?.history ?? []
  const transactions = txData?.transactions ?? []
  const balance = txData?.balance ?? 0
  const budgets = budgetData?.budgets ?? []
  const savings = savingsData?.goals ?? []

  const habitsCompleted = habits.filter((h) => h.logs.some((l) => l.date === today)).length
  const sholatDone = todayLogs
    ? [todayLogs.subuh, todayLogs.dzuhur, todayLogs.ashar, todayLogs.maghrib, todayLogs.isya].filter(Boolean).length
    : 0

  // Streak: consecutive days with at least 1 habit done
  const streak = React.useMemo(() => {
    let count = 0
    for (let i = 0; i < 90; i++) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const ds = format(d, 'yyyy-MM-dd')
      if (habits.some((h) => h.logs.some((l) => l.date === ds))) count++
      else break
    }
    return count
  }, [habits])

  // 7-day heatmap
  const heatmapDays = React.useMemo(() => {
    const days: { date: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const ds = format(d, 'yyyy-MM-dd')
      days.push({ date: ds, count: habits.filter((h) => h.logs.some((l) => l.date === ds)).length })
    }
    return days
  }, [habits])

  const verse = React.useMemo(() => verses[Math.floor(Math.random() * verses.length)], [])
  const nextPrayer = React.useMemo(() => getNextPrayer(), [])

  const maxHabit = Math.max(...heatmapDays.map((d) => d.count), 1)

  return (
    <div className="space-y-6">
      {/* ── Clock + Greeting ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary">
            {format(new Date(), 'EEEE, d MMMM yyyy')}
          </p>
          <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Sahabat'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hari ini adalah hari baru untuk amalan kecilmu.
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <LiveClock />
        </div>
      </motion.div>

      {/* ── Quran Verse ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-card/40 to-amber-400/5 p-6 backdrop-blur sm:p-8"
      >
        <span className="absolute right-4 top-2 font-serif text-[8rem] leading-none text-primary/8">
          ﴿
        </span>
        <p className="relative font-serif text-xl font-medium leading-relaxed text-foreground sm:text-2xl" dir="rtl">
          {verse.text}
        </p>
        <p className="relative mt-2 text-sm text-muted-foreground">
          &ldquo;{verse.translation}&rdquo;
        </p>
        <p className="relative mt-1 text-[11px] text-primary/70 font-medium">— {verse.surah}</p>
      </motion.div>

      {/* ── Prayer Tracker ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-medium">Sholat Hari Ini</h2>
            <p className="text-xs text-muted-foreground">
              {sholatDone}/5 selesai · Berikutnya: <span className="text-primary font-medium">{nextPrayer.name}</span> ({formatCountdown(nextPrayer.minutesLeft)})
            </p>
          </div>
          <Moon className="h-5 w-5 text-amber-500" />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {SHOLAT_TIMES.map((s, i) => {
            const isDone = todayLogs
              ? [todayLogs.subuh, todayLogs.dzuhur, todayLogs.ashar, todayLogs.maghrib, todayLogs.isya][i]
              : false
            const isNext = i === nextPrayer.index
            return (
              <div
                key={s.name}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition ${
                  isDone
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : isNext
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-border/40 bg-muted/30 text-muted-foreground'
                }`}
              >
                <s.icon className={`h-4 w-4 ${isDone ? 'text-primary' : isNext ? 'text-amber-500' : 'text-muted-foreground'}`} />
                <span className="text-[10px] font-medium">{s.name}</span>
                <span className="text-[9px] text-muted-foreground">{s.time}</span>
                {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* ── Progress Link Cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ProgressCard
          label="Kebiasaan"
          subtitle={`${habitsCompleted}/${habits.length} hari ini`}
          value={habitsCompleted} max={Math.max(habits.length, 1)}
          icon={Flame} color="text-emerald-500" bgColor="bg-emerald-500/10"
          onNavigate={() => setView('task')}
        />
        <ProgressCard
          label="Sholat"
          subtitle={`${sholatDone}/5 hari ini`}
          value={sholatDone} max={5}
          icon={Moon} color="text-amber-500" bgColor="bg-amber-500/10"
          onNavigate={() => setView('task')}
        />
        <ProgressCard
          label="Keuangan"
          subtitle={balance >= 0 ? 'Saldo positif' : 'Saldo negatif'}
          value={Math.max(budgets.length, 0)} max={Math.max(budgets.length, 1)}
          icon={Wallet} color="text-primary" bgColor="bg-primary/10"
          onNavigate={() => setView('finance')}
        />
        <ProgressCard
          label="Tabungan"
          subtitle={`${savings.length} target`}
          value={savings.reduce((s, g) => s + (g.target > 0 ? Math.min(g.current / g.target, 1) : 0), 0) * 100}
          max={Math.max(savings.length, 1) * 100}
          icon={PiggyBank} color="text-rose-500" bgColor="bg-rose-500/10"
          onNavigate={() => setView('finance')}
        />
      </div>

      {/* ── Focus Stats Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: 'Streak', value: `${streak}`, sub: 'hari berturut', color: 'oklch(0.46 0.09 165)' },
          { label: 'Sholat minggu ini', value: `${history.reduce((s, h) => s + [h.subuh, h.dzuhur, h.ashar, h.maghrib, h.isya].filter(Boolean).length, 0)}`, sub: 'dari 35', color: 'oklch(0.7 0.13 80)' },
          { label: 'Transaksi', value: `${transactions.length}`, sub: 'bulan ini', color: 'oklch(0.6 0.12 310)' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur surface-tactile text-center">
            <p className="font-serif text-2xl font-medium" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="text-[10px] text-muted-foreground/70">{s.sub}</p>
          </div>
        ))}
      </motion.div>

      {/* ── 7-Day Heatmap (Interactive) ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-medium">Minggu Ini</h2>
            <p className="text-xs text-muted-foreground">Konsistensi kebiasaan 7 hari terakhir</p>
          </div>
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <InteractiveHeatmap
          data={heatmapDays.map(d => ({ ...d, label: format(new Date(d.date), 'EEE') }))}
          maxVal={maxHabit}
        />
      </motion.div>

      {/* ── Recent Transactions (compact) ── */}
      {transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg font-medium">Transaksi Terakhir</h2>
            <button onClick={() => setView('finance')} className="flex items-center gap-1 text-[11px] text-primary hover:underline">
              Lihat semua <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-1">
            {[...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((t) => {
              const income = t.type === 'income'
              return (
                <div key={t.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-accent/40">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${income ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                    {income ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.note || t.category || (income ? 'Pemasukan' : 'Pengeluaran')}</p>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(t.date), 'd MMM')}</p>
                  </div>
                  <span className={`text-sm font-medium ${income ? 'text-emerald-600' : 'text-foreground'}`}>
                    {income ? '+' : '−'}Rp {Math.round(t.amount).toLocaleString('id-ID')}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
