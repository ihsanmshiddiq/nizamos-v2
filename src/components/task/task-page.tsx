'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Moon, BookOpen, Target } from 'lucide-react'
import { HabitPanel } from '@/components/task/habit-panel'
import { SholatPanel } from '@/components/task/sholat-panel'
import { HifdzPanel } from '@/components/task/hifdz-panel'
import { TargetPanel } from '@/components/task/target-panel'

type Cat = 'habit' | 'sholat' | 'hifdz' | 'target'

const cats: {
  id: Cat
  label: string
  sub: string
  icon: React.ElementType
  tint: string
}[] = [
  { id: 'habit', label: 'Kebiasaan', sub: 'Ritual harian', icon: Sparkles, tint: 'text-emerald-500' },
  { id: 'sholat', label: 'Sholat', sub: 'Lima waktu', icon: Moon, tint: 'text-amber-500' },
  { id: 'hifdz', label: 'Hifdz', sub: 'Menjaga hafalan', icon: BookOpen, tint: 'text-teal-500' },
  { id: 'target', label: 'Tugas & Target', sub: 'Target jadi hari', icon: Target, tint: 'text-rose-500' },
]

export function TaskPage() {
  const [cat, setCat] = React.useState<Cat>('habit')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary">
            Satu permukaan · empat arus
          </p>
          <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
            Amalan kecil hari ini
          </h1>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Kebiasaan, sholat, hafalan, dan target — tersimpan dalam satu
          halaman, terpisah per kategori. Pindah arus tanpa kehilangan tempat.
        </p>
      </div>

      {/* Category switcher */}
      <div className="sticky top-14 z-20 -mx-1 rounded-2xl border border-border/60 bg-background/70 p-1.5 backdrop-blur-xl lg:top-2">
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
          {cats.map((c) => {
            const active = cat === c.id
            return (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition ${
                  active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="cat-active"
                    className="absolute inset-0 rounded-xl border border-primary/20 bg-primary/8"
                    transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                  />
                )}
                <c.icon className={`relative h-4 w-4 ${c.tint}`} />
                <div className="relative min-w-0 leading-tight">
                  <p className="truncate text-sm font-medium">{c.label}</p>
                  <p className="hidden truncate text-[10px] text-muted-foreground sm:block">
                    {c.sub}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cat}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {cat === 'habit' && <HabitPanel />}
          {cat === 'sholat' && <SholatPanel />}
          {cat === 'hifdz' && <HifdzPanel />}
          {cat === 'target' && <TargetPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
