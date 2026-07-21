'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  useBudgets,
  useSaveBudget,
  useDeleteBudget,
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
  useSavings,
  useCreateSavings,
  useDepositSavings,
  useDeleteSavings,
  type Budget,
  type SavingsGoal,
} from '@/hooks/data/use-finance'
import { useApp } from '@/stores/app-store'
import { format, parseISO, subMonths, isSameMonth } from 'date-fns'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Target,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  PiggyBank,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const DEFAULT_CATEGORIES = [
  'Makan', 'Transport', 'Tagihan', 'Belanja', 'Sedekah', 'Kesehatan', 'Pendidikan', 'Lainnya',
]

export function FinancePage() {
  const { user } = useApp()
  const currency = user?.currency || 'IDR'
  const [monthOffset, setMonthOffset] = React.useState(0)
  const monthDate = subMonths(new Date(), monthOffset)
  const month = format(monthDate, 'yyyy-MM')

  const { data: budgetData } = useBudgets(month)
  const { data: txData } = useTransactions(month)
  const { data: savingsData } = useSavings()

  const budgets = budgetData?.budgets ?? []
  const transactions = txData?.transactions ?? []
  const totalIncome = txData?.totalIncome ?? 0
  const totalExpense = txData?.totalExpense ?? 0
  const balance = txData?.balance ?? 0
  const savings = savingsData?.goals ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary">
            Keuangan
          </p>
          <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
            {format(monthDate, 'MMMM yyyy')}
          </h1>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-card/50 p-1 backdrop-blur">
          <button
            onClick={() => setMonthOffset((o) => o + 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMonthOffset(0)}
            className="rounded-lg px-3 py-1 text-xs font-medium hover:bg-accent"
          >
            Bulan ini
          </button>
          <button
            onClick={() => setMonthOffset((o) => Math.max(o - 1, 0))}
            disabled={monthOffset <= 0}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Pemasukan"
          value={fmt(totalIncome, currency)}
          icon={TrendingUp}
          tint="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-500/10"
        />
        <SummaryCard
          label="Pengeluaran"
          value={fmt(totalExpense, currency)}
          icon={TrendingDown}
          tint="text-rose-600 dark:text-rose-400"
          bg="bg-rose-500/10"
        />
        <SummaryCard
          label="Sisa"
          value={fmt(balance, currency)}
          icon={Wallet}
          tint={balance >= 0 ? 'text-primary' : 'text-rose-500'}
          bg="bg-primary/10"
        />
      </div>

      {/* Budget + Savings grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <BudgetSection budgets={budgets} month={month} currency={currency} />
        <SavingsSection savings={savings} currency={currency} />
      </div>

      {/* Transactions */}
      <TransactionSection
        transactions={transactions}
        currency={currency}
        categories={budgets.map((b) => b.category)}
      />
    </div>
  )
}

/* ---------- Budget ---------- */
function BudgetSection({
  budgets,
  month,
  currency,
}: {
  budgets: Budget[]
  month: string
  currency: string
}) {
  const save = useSaveBudget()
  const del = useDeleteBudget()
  const [open, setOpen] = React.useState(false)
  const [category, setCategory] = React.useState(DEFAULT_CATEGORIES[0])
  const [limit, setLimit] = React.useState('')

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)

  function add() {
    const l = parseFloat(limit)
    if (!l || l <= 0) {
      toast.error('Masukkan batas yang valid')
      return
    }
    save.mutate(
      { month, category, limit: l },
      {
        onSuccess: () => {
          toast.success('Anggaran diset')
          setLimit('')
          setOpen(false)
        },
      }
    )
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-medium">Anggaran bulanan</h2>
          <p className="text-xs text-muted-foreground">
            {fmt(totalSpent, currency)} dari {fmt(totalLimit, currency)} terpakai
          </p>
        </div>
        <Badge variant="secondary">
          {totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0}%
        </Badge>
      </div>

      {budgets.length > 0 && (
        <div className="mb-4 space-y-3">
          {budgets.map((b) => {
            const pct = b.limit > 0 ? (b.spent / b.limit) * 100 : 0
            const over = pct > 100
            return (
              <div key={b.id} className="group">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{b.category}</span>
                  <span className={cn('text-xs', over ? 'text-rose-500' : 'text-muted-foreground')}>
                    {fmt(b.spent, currency)} / {fmt(b.limit, currency)}
                  </span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-full',
                      over ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-primary'
                    )}
                  />
                </div>
                <button
                  onClick={() => del.mutate(b.id)}
                  className="mt-1 text-[10px] text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
                >
                  Hapus
                </button>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 py-2.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
            <Plus className="h-3.5 w-3.5" />
            Tambah kategori anggaran
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Kategori anggaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Batas per bulan ({currency})</Label>
              <Input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="500000"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">Batal</Button></DialogClose>
            <Button onClick={add} disabled={save.isPending}>Set anggaran</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ---------- Savings ---------- */
function SavingsSection({
  savings,
  currency,
}: {
  savings: SavingsGoal[]
  currency: string
}) {
  const create = useCreateSavings()
  const deposit = useDepositSavings()
  const del = useDeleteSavings()
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState('')
  const [target, setTarget] = React.useState('')
  const [depOpen, setDepOpen] = React.useState<string | null>(null)
  const [depAmt, setDepAmt] = React.useState('')

  function add() {
    const t = parseFloat(target)
    if (!title.trim() || !t || t <= 0) {
      toast.error('Isi judul dan nominal target')
      return
    }
    create.mutate(
      { title: title.trim(), target: t },
      {
        onSuccess: () => {
          toast.success('Target tabungan dibuat')
          setTitle('')
          setTarget('')
          setOpen(false)
        },
      }
    )
  }

  function doDeposit(id: string) {
    const a = parseFloat(depAmt)
    if (!a) {
      toast.error('Masukkan nominal')
      return
    }
    deposit.mutate(
      { id, amount: a },
      {
        onSuccess: () => {
          toast.success(a > 0 ? 'Ditabung' : 'Ditarik')
          setDepOpen(null)
          setDepAmt('')
        },
      }
    )
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-medium">Target tabungan</h2>
          <p className="text-xs text-muted-foreground">
            {savings.length} target berjalan
          </p>
        </div>
        <PiggyBank className="h-5 w-5 text-primary" />
      </div>

      {savings.length === 0 ? (
        <p className="mb-4 text-sm text-muted-foreground">
          Tentukan target tabungan — umrah, dana darurat, atau mimpi kecilmu.
        </p>
      ) : (
        <div className="mb-4 space-y-3">
          {savings.map((g) => {
            const pct = g.target > 0 ? Math.min((g.current / g.target) * 100, 100) : 0
            return (
              <div key={g.id} className="group rounded-xl border border-border/50 bg-background/40 p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium">{g.title}</span>
                  <button
                    onClick={() => del.mutate(g.id)}
                    className="text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{fmt(g.current, currency)} ditabung</span>
                  <span>{pct.toFixed(0)}% dari {fmt(g.target, currency)}</span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-amber-500"
                  />
                </div>
                {pct >= 100 && (
                  <p className="mt-1.5 text-xs text-primary">Goal reached, alhamdulillah.</p>
                )}
                <Dialog open={depOpen === g.id} onOpenChange={(o) => !o && setDepOpen(null)}>
                  <DialogTrigger asChild>
                    <button
                      onClick={() => setDepOpen(g.id)}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg border border-border/60 px-2.5 py-1 text-[11px] font-medium transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    >
                      <Plus className="h-3 w-3" />
                      Tabung / tarik
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xs">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-lg">{g.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                      <Label>Nominal (pakai minus buat narik)</Label>
                      <Input
                        type="number"
                        value={depAmt}
                        onChange={(e) => setDepAmt(e.target.value)}
                        placeholder="100000"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && doDeposit(g.id)}
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button variant="ghost">Batal</Button></DialogClose>
                      <Button onClick={() => doDeposit(g.id)} disabled={deposit.isPending}>Konfirmasi</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 py-2.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
            <Plus className="h-3.5 w-3.5" />
            Target tabungan baru
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Target tabungan</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Nabung buat apa?</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mis. Umrah, Dana darurat"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nominal target ({currency})</Label>
              <Input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="20000000"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">Batal</Button></DialogClose>
            <Button onClick={add} disabled={create.isPending}>Buat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ---------- Transactions ---------- */
function TransactionSection({
  transactions,
  currency,
  categories,
}: {
  transactions: any[]
  currency: string
  categories: string[]
}) {
  const create = useCreateTransaction()
  const del = useDeleteTransaction()
  const [open, setOpen] = React.useState(false)
  const [type, setType] = React.useState('expense')
  const [amount, setAmount] = React.useState('')
  const [category, setCategory] = React.useState(categories[0] || DEFAULT_CATEGORIES[0])
  const [note, setNote] = React.useState('')

  function add() {
    const a = parseFloat(amount)
    if (!a || a <= 0) {
      toast.error('Masukkan nominal yang valid')
      return
    }
    create.mutate(
      { amount: a, type, category: type === 'expense' ? category : null, note: note.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('Transaksi ditambah')
          setAmount('')
          setNote('')
          setOpen(false)
        },
      }
    )
  }

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl font-medium">Transaksi</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Tambah
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Tambah transaksi</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setType('expense')}
                  className={cn(
                    'rounded-xl border py-2 text-sm font-medium transition',
                    type === 'expense' ? 'border-rose-500 bg-rose-500/10 text-rose-600' : 'border-border hover:bg-accent'
                  )}
                >
                  <TrendingDown className="mr-1 inline h-4 w-4" /> Pengeluaran
                </button>
                <button
                  onClick={() => setType('income')}
                  className={cn(
                    'rounded-xl border py-2 text-sm font-medium transition',
                    type === 'income' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600' : 'border-border hover:bg-accent'
                  )}
                >
                  <TrendingUp className="mr-1 inline h-4 w-4" /> Pemasukan
                </button>
              </div>
              <div className="space-y-1.5">
                <Label>Nominal ({currency})</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50000" autoFocus />
              </div>
              {type === 'expense' && (
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(categories.length ? Array.from(new Set([...categories, ...DEFAULT_CATEGORIES])) : DEFAULT_CATEGORIES).map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Catatan (opsional)</Label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Buat apa?" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="ghost">Batal</Button></DialogClose>
              <Button onClick={add} disabled={create.isPending}>Tambah</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Belum ada transaksi bulan ini.
        </p>
      ) : (
        <div className="max-h-96 space-y-1 overflow-y-auto pr-1">
          {sorted.map((t) => {
            const income = t.type === 'income'
            return (
              <div key={t.id} className="group flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-accent/40">
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    income ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                  )}
                >
                  {income ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.note || t.category || (income ? 'Pemasukan' : 'Pengeluaran')}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {format(parseISO(t.date), 'd MMM')}{t.category ? ` · ${t.category}` : ''}
                  </p>
                </div>
                <span className={cn('text-sm font-semibold', income ? 'text-emerald-600' : 'text-foreground')}>
                  {income ? '+' : '−'}{fmt(t.amount, currency)}
                </span>
                <button
                  onClick={() => del.mutate(t.id)}
                  className="shrink-0 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tint,
  bg,
}: {
  label: string
  value: string
  icon: React.ElementType
  tint: string
  bg: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', bg)}>
          <Icon className={cn('h-4 w-4', tint)} />
        </div>
      </div>
      <p className={cn('mt-2 font-serif text-2xl font-medium', tint)}>{value}</p>
    </div>
  )
}

function fmt(n: number, currency: string) {
  if (currency === 'IDR') {
    return 'Rp ' + Math.round(n).toLocaleString('id-ID')
  }
  return currency + ' ' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
