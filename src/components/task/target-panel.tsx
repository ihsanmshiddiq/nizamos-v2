'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useTargets,
  useCreateTarget,
  useUpdateTarget,
  useDeleteTarget,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  type Target,
  type Task,
} from '@/hooks/data/use-life'
import { format, isToday, parseISO, differenceInDays, isPast } from 'date-fns'
import {
  Plus,
  Target as TargetIcon,
  ChevronDown,
  ChevronRight,
  Check,
  Trash2,
  MoreVertical,
  CalendarDays,
  Flag,
  Circle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { id: 'personal', label: 'Pribadi', color: 'text-rose-500' },
  { id: 'career', label: 'Karier', color: 'text-amber-500' },
  { id: 'deen', label: 'Agama', color: 'text-emerald-500' },
  { id: 'health', label: 'Kesehatan', color: 'text-teal-500' },
  { id: 'finance', label: 'Keuangan', color: 'text-lime-500' },
] as const

const PRIORITIES = [
  { id: 'low', label: 'Rendah', color: 'text-muted-foreground' },
  { id: 'medium', label: 'Sedang', color: 'text-amber-500' },
  { id: 'high', label: 'Tinggi', color: 'text-rose-500' },
] as const

export function TargetPanel() {
  const { data, isLoading } = useTargets()
  const targets = data?.targets ?? []
  const [expanded, setExpanded] = React.useState<string | null>(null)

  if (isLoading) return <div className="h-64 rounded-2xl bg-card/40 shimmer" />

  // Today's tasks across all targets
  const todays = targets.flatMap((t) =>
    (t.tasks || []).map((task) => ({ ...task, targetTitle: t.title }))
  )
  const todaysActive = todays
    .filter((t) => !t.completed && (t.dueDate ? isToday(parseISO(t.dueDate)) || !isPast(parseISO(t.dueDate)) : false))
    .slice(0, 6)

  return (
    <div className="space-y-5">
      {/* Today's tasks strip */}
      {todaysActive.length > 0 && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 backdrop-blur">
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Fokus hari ini</p>
            <Badge variant="secondary" className="ml-auto">{todaysActive.length} jatuh tempo</Badge>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {todaysActive.map((t) => (
              <div key={t.id} className="flex items-center gap-2 rounded-lg bg-background/50 px-3 py-2 text-sm">
                <span className={cn('h-1.5 w-1.5 rounded-full', t.priority === 'high' ? 'bg-rose-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-muted-foreground/40')} />
                <span className="truncate">{t.title}</span>
                <span className="ml-auto truncate text-[10px] text-muted-foreground">{t.targetTitle}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {targets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/30 p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <TargetIcon className="h-5 w-5" />
          </div>
          <p className="font-serif text-lg">Buat cakrawala pertamamu</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            Target panjang jadi amalan kecil harian. Tambah target, lalu
            pecahkan.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {targets.map((t, i) => (
            <TargetCard
              key={t.id}
              target={t}
              index={i}
              expanded={expanded === t.id}
              onToggle={() => setExpanded(expanded === t.id ? null : t.id)}
            />
          ))}
        </div>
      )}

      <AddTargetButton />
    </div>
  )
}

function TargetCard({
  target,
  index,
  expanded,
  onToggle,
}: {
  target: Target
  index: number
  expanded: boolean
  onToggle: () => void
}) {
  const del = useDeleteTarget()
  const upd = useUpdateTarget()
  const cat = CATEGORIES.find((c) => c.id === target.category) || CATEGORIES[0]
  const tasks = target.tasks || []
  const done = tasks.filter((t) => t.completed).length
  const total = tasks.length
  const deadline = target.deadline ? parseISO(target.deadline) : null
  const daysLeft = deadline ? differenceInDays(deadline, new Date()) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur surface-tactile transition hover:border-primary/30"
    >
      <div className="p-5">
        <div className="flex items-start gap-3">
          <button
            onClick={onToggle}
            className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-serif text-lg font-medium leading-tight">{target.title}</p>
                {target.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{target.description}</p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition hover:bg-accent group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {CATEGORIES.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      className="cursor-pointer"
                      onClick={() => upd.mutate({ id: target.id, category: c.id })}
                    >
                      <span className={cn('mr-2 h-2 w-2 rounded-full bg-current', c.color)} />
                      {c.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => del.mutate(target.id, { onSuccess: () => toast.success('Target dihapus') })}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <Badge variant="secondary" className={cn('gap-1 border-0', cat.color)}>
                {cat.label}
              </Badge>
              {deadline && (
                <span className={cn('inline-flex items-center gap-1', daysLeft !== null && daysLeft < 0 && 'text-rose-500')}>
                  <CalendarDays className="h-3 w-3" />
                  {daysLeft !== null && daysLeft >= 0
                    ? `${daysLeft}h lagi`
                    : daysLeft !== null
                      ? `${Math.abs(daysLeft)}h telat`
                      : format(deadline, 'd MMM')}
                </span>
              )}
              <span>{done}/{total} tugas</span>
            </div>

            {/* Progress */}
            <div className="mt-3 flex items-center gap-3">
              <Progress value={target.progress} className="h-2 flex-1" />
              <span className="font-serif text-sm font-medium text-primary">{target.progress}%</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-border/60 bg-background/30"
          >
            <TaskList target={target} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function TaskList({ target }: { target: Target }) {
  const create = useCreateTask()
  const upd = useUpdateTask()
  const del = useDeleteTask()
  const [title, setTitle] = React.useState('')
  const [priority, setPriority] = React.useState('medium')
  const [due, setDue] = React.useState('')
  const tasks = target.tasks || []

  function add() {
    if (!title.trim()) {
      toast.error('Tambah judul tugas dulu')
      return
    }
    create.mutate(
      {
        title: title.trim(),
        targetId: target.id,
        priority,
        dueDate: due ? new Date(due).toISOString() : undefined,
      },
      {
        onSuccess: () => {
          setTitle('')
          setDue('')
          setPriority('medium')
        },
      }
    )
  }

  return (
    <div className="p-5">
      {tasks.length === 0 ? (
        <p className="mb-3 text-sm text-muted-foreground">
          Belum ada tugas. Pecah target ini jadi amalan kecil harian di
          bawah.
        </p>
      ) : (
        <div className="mb-4 space-y-1.5">
          {tasks
            .sort((a, b) => Number(a.completed) - Number(b.completed) || a.order - b.order)
            .map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => upd.mutate({ id: task.id, completed: !task.completed })}
                onDelete={() => del.mutate(task.id)}
              />
            ))}
        </div>
      )}

      {/* Add task inline */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tambah amalan kecil harian…"
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                <span className={cn('mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current', p.color)} />
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className="w-full sm:w-40"
        />
        <Button onClick={add} size="sm" disabled={create.isPending}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  )
}

function TaskRow({
  task,
  onToggle,
  onDelete,
}: {
  task: Task
  onToggle: () => void
  onDelete: () => void
}) {
  const pri = PRIORITIES.find((p) => p.id === task.priority) || PRIORITIES[1]
  const due = task.dueDate ? parseISO(task.dueDate) : null
  const overdue = due && !task.completed && isPast(due) && !isToday(due)

  return (
    <div className="group flex items-center gap-2.5 rounded-lg px-2 py-2 transition hover:bg-accent/40">
      <button onClick={onToggle} className="shrink-0">
        {task.completed ? (
          <CheckCircle2 className="h-5 w-5 text-primary" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground/50 transition hover:text-primary" />
        )}
      </button>
      <span
        className={cn(
          'flex-1 text-sm',
          task.completed && 'text-muted-foreground line-through'
        )}
      >
        {task.title}
      </span>
      {due && (
        <span
          className={cn(
            'hidden items-center gap-1 text-[10px] sm:inline-flex',
            overdue ? 'text-rose-500' : 'text-muted-foreground'
          )}
        >
          <CalendarDays className="h-3 w-3" />
          {format(due, 'd MMM')}
        </span>
      )}
      <span className={cn('hidden h-1.5 w-1.5 rounded-full bg-current sm:block', pri.color)} title={`${pri.label} · prioritas`} />
      <button
        onClick={onDelete}
        className="shrink-0 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

function AddTargetButton() {
  const create = useCreateTarget()
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [category, setCategory] = React.useState('personal')
  const [deadline, setDeadline] = React.useState('')

  function submit() {
    if (!title.trim()) {
      toast.error('Kasih nama targetmu dulu')
      return
    }
    create.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      },
      {
        onSuccess: () => {
          toast.success('Target dibuat · sekarang pecah jadi hari-hari')
          setTitle('')
          setDescription('')
          setDeadline('')
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
          Target baru
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Target baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Target panjangnya apa?</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="cth. Selesaiin buku, Belajar skill baru"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Deskripsi (opsional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kayak gimana bentuk selesainya?"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tenggat (opsional)</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending ? 'Bikin…' : 'Bikin target'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
