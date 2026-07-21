'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  useHifdz,
  useCreateHifdz,
  useReviewHifdz,
  useUpdateHifdz,
  useDeleteHifdz,
} from '@/hooks/data/use-life'
import { formatDistanceToNow } from 'date-fns'
import {
  Plus,
  BookOpen,
  RotateCw,
  Trash2,
  MoreVertical,
  CheckCircle2,
  GraduationCap,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { surahs } from '@/lib/surahs'

const STATUSES = [
  { id: 'learning', label: 'Sedang dipelajari', color: 'bg-sky-500/15 text-sky-700 dark:text-sky-300', icon: GraduationCap },
  { id: 'memorized', label: 'Sudah dihafal', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300', icon: CheckCircle2 },
  { id: 'reviewing', label: 'Muraja‘ah', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300', icon: RotateCw },
  { id: 'weak', label: 'Perlu dikuatkan', color: 'bg-rose-500/15 text-rose-700 dark:text-rose-300', icon: AlertCircle },
] as const

export function HifdzPanel() {
  const { data, isLoading } = useHifdz()
  const items = data?.items ?? []
  const summary = data?.summary

  if (isLoading) return <div className="h-64 rounded-2xl bg-card/40 shimmer" />

  const totalAyahs = items.reduce((s, it) => s + (it.toAyah - it.fromAyah + 1), 0)

  return (
    <div className="space-y-5">
      {/* Summary band */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur surface-tactile">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ayat dijaga</p>
          <p className="mt-1 font-serif text-2xl font-medium text-emerald-600 dark:text-emerald-400">{totalAyahs}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur surface-tactile">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Surat</p>
          <p className="mt-1 font-serif text-2xl font-medium text-teal-600 dark:text-teal-400">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur surface-tactile">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sudah dihafal</p>
          <p className="mt-1 font-serif text-2xl font-medium text-amber-600 dark:text-amber-400">
            {items.filter((i) => i.status === 'memorized').length}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur surface-tactile">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Perlu muraja‘ah</p>
          <p className="mt-1 font-serif text-2xl font-medium text-rose-600 dark:text-rose-400">
            {items.filter((i) => i.status === 'weak' || i.status === 'reviewing').length}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/30 p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <p className="font-serif text-lg">Mulai catatan hafalanmu</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            Tambahkan ayat yang sedang kau hafalkan. Catat muraja‘ah agar
            tetap melekat.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item, i) => (
            <HifdzCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}

      <AddHifdzButton />
    </div>
  )
}

function HifdzCard({ item, index }: { item: any; index: number }) {
  const review = useReviewHifdz()
  const update = useUpdateHifdz()
  const del = useDeleteHifdz()
  const status = STATUSES.find((s) => s.id === item.status) || STATUSES[0]
  const ayahCount = item.toAyah - item.fromAyah + 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur surface-tactile transition hover:border-primary/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/8 text-primary">
            <span className="text-[9px] uppercase tracking-wider">S.</span>
            <span className="font-serif text-base font-semibold leading-none">
              {item.surahNumber}
            </span>
          </div>
          <div>
            <p className="font-serif text-lg font-medium leading-tight">{item.surah}</p>
            <p className="text-xs text-muted-foreground">
              Ayat {item.fromAyah}
              {item.toAyah !== item.fromAyah ? `–${item.toAyah}` : ''} · {ayahCount} ayat
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition hover:bg-accent group-hover:opacity-100">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {STATUSES.map((s) => (
              <DropdownMenuItem
                key={s.id}
                className="cursor-pointer"
                onClick={() => update.mutate({ id: item.id, status: s.id })}
              >
                <s.icon className="mr-2 h-4 w-4" />
                Tandai {s.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => del.mutate(item.id, { onSuccess: () => toast.success('Dihapus') })}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Badge variant="secondary" className={cn('gap-1 border-0 font-medium', status.color)}>
          <status.icon className="h-3 w-3" />
          {status.label}
        </Badge>
        <button
          onClick={() =>
            review.mutate(item.id, {
              onSuccess: () => toast.success('Muraja‘ah dicatat · semoga Allah kokohkan'),
            })
          }
          disabled={review.isPending}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/50 px-2.5 py-1.5 text-xs font-medium transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          <RotateCw className="h-3 w-3" />
          Muraja‘ah
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span>Muraja‘ah ×{item.reviewCount}</span>
        {item.lastReviewed && (
          <span>· {formatDistanceToNow(new Date(item.lastReviewed), { addSuffix: true })}</span>
        )}
      </div>
    </motion.div>
  )
}

function AddHifdzButton() {
  const create = useCreateHifdz()
  const [open, setOpen] = React.useState(false)
  const [surahIdx, setSurahIdx] = React.useState('0')
  const [fromAyah, setFromAyah] = React.useState('1')
  const [toAyah, setToAyah] = React.useState('1')
  const [status, setStatus] = React.useState('learning')

  const surah = surahs[parseInt(surahIdx, 10)] || surahs[0]

  function submit() {
    const from = parseInt(fromAyah, 10)
    const to = parseInt(toAyah, 10)
    if (!from || !to || from < 1 || to < from) {
      toast.error('Check the ayah range')
      return
    }
    create.mutate(
      {
        surah: surah.name,
        surahNumber: surah.number,
        fromAyah: from,
        toAyah: to,
        status,
      },
      {
          onSuccess: () => {
          toast.success('Hafalan ditambahkan · baarokallaahu laka')
          setOpen(false)
          setFromAyah('1')
          setToAyah('1')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 bg-card/30 py-4 text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
          <Plus className="h-4 w-4" />
          Tambah hafalan
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Tambah hafalan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Surat</Label>
            <Select value={surahIdx} onValueChange={setSurahIdx}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {surahs.map((s, i) => (
                  <SelectItem key={s.number} value={String(i)}>
                    {s.number}. {s.name} · {s.englishName} ({s.ayahs} ayat)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Dari ayat</Label>
              <Input
                type="number"
                min={1}
                max={surah.ayahs}
                value={fromAyah}
                onChange={(e) => setFromAyah(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Sampai ayat</Label>
              <Input
                type="number"
                min={1}
                max={surah.ayahs}
                value={toAyah}
                onChange={(e) => setToAyah(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Batal</Button>
          </DialogClose>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending ? 'Menambah…' : 'Tambah'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
