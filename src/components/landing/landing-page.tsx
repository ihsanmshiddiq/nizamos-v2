'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { AuthCard } from '@/components/landing/auth-card'
import {
  Sparkles,
  Moon,
  BookOpen,
  Target,
  Wallet,
  CalendarHeart,
  ArrowUpRight,
} from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'Kebiasaan',
    desc: 'Ritual harian, rentetan yang lentur mengikuti hidup — bukan patah karena itu.',
    accent: 'from-emerald-500/15 to-emerald-500/0',
  },
  {
    icon: Moon,
    title: 'Sholat',
    desc: 'Lima waktu sholat, dalam grid yang tenang dan memaafkan.',
    accent: 'from-amber-500/15 to-amber-500/0',
  },
  {
    icon: BookOpen,
    title: 'Hifdz',
    desc: 'Jaga apa yang kau hafalkan. Siklus muraja‘ah yang menghormati masa lupa.',
    accent: 'from-teal-500/15 to-teal-500/0',
  },
  {
    icon: Target,
    title: 'Tugas & Target',
    desc: 'Garis panjang, dipecah jadi amalan kecil satu hari.',
    accent: 'from-rose-500/15 to-rose-500/0',
  },
  {
    icon: Wallet,
    title: 'Keuangan',
    desc: 'Anggaran bulanan dan target tabungan yang bisa kau lihat.',
    accent: 'from-lime-500/15 to-lime-500/0',
  },
  {
    icon: CalendarHeart,
    title: 'Siklus',
    desc: 'Kalkulator menstruasi, aktifkan dari pengaturan — privasi terjaga.',
    accent: 'from-pink-500/15 to-pink-500/0',
  },
]

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      {/* Aurora backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-aurora absolute -left-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-primary/15 blur-[120px]" />
        <div className="animate-aurora absolute -right-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-amber-400/12 blur-[120px] [animation-delay:-6s]" />
        <div className="animate-aurora absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full bg-teal-400/10 blur-[120px] [animation-delay:-12s]" />
      </div>

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground glow-primary">
            <span className="font-serif text-lg font-semibold leading-none">ح</span>
          </div>
          <div className="leading-tight">
            <p className="font-serif text-lg font-medium tracking-tight">Hayāt</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Sistem Hidup
            </p>
          </div>
        </div>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition hover:text-foreground">
            Fitur
          </a>
          <a href="#philosophy" className="transition hover:text-foreground">
            Falsafah
          </a>
          <a href="#begin" className="transition hover:text-foreground">
            Mulai
          </a>
        </nav>
        <a
          href="#begin"
          className="rounded-full border border-border/80 bg-background/60 px-4 py-2 text-xs font-medium backdrop-blur transition hover:border-primary/40 hover:bg-primary/5"
        >
          Masuk
        </a>
      </header>

      {/* Hero — asymmetric editorial */}
      <section className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-6 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:pb-28 lg:pt-10">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Dibuat untuk hidup yang fokus dan penuh niat
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="font-serif text-[clamp(2.6rem,7vw,5.2rem)] font-medium leading-[0.95] tracking-[-0.02em] text-balance"
          >
            Sistem operasi yang tenang untuk{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-br from-primary via-primary to-amber-500 bg-clip-text text-transparent">
                seluruh hidupmu
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full text-primary/40"
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 5 Q 50 1, 100 4 T 198 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg"
          >
            Kebiasaan, sholat, hifdz, target, dan keuangan — terkumpul dalam
            satu permukaan yang tenang. Tanpa ribut. Tanpa rasa bersalah atas
            rentetan yang putus. Hanya amalan kecil, yang dijaga.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              href="#begin"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground glow-primary transition hover:brightness-110"
            >
              Mulai gratis
              <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="#features"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-border/80 bg-background/40 px-6 text-sm font-medium backdrop-blur transition hover:border-primary/40 hover:bg-primary/5"
            >
              Lihat cara kerjanya
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex items-center gap-6 text-xs text-muted-foreground"
          >
            <div>
              <p className="font-serif text-2xl text-foreground">6</p>
              <p>permukaan hidup</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="font-serif text-2xl text-foreground">0</p>
              <p>langkah verifikasi</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="font-serif text-2xl text-foreground">∞</p>
              <p>kesempatan kedua</p>
            </div>
          </motion.div>
        </div>

        {/* Right column — auth + decorative */}
        <div id="begin" className="lg:col-span-5">
          <div className="flex flex-col items-center gap-6">
            <AuthCard />
            <p className="max-w-xs text-center text-[11px] leading-relaxed text-muted-foreground/70">
              Dengan melanjutkan, kau setuju untuk bersikap lembut pada dirimu.
              Datamu tersimpan di perangkat ini.
            </p>
          </div>
        </div>
      </section>

      {/* Features — varied grid, not 3-equal-cards */}
      <section
        id="features"
        className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="mb-12 flex flex-col items-start gap-4">
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary">
            Enam permukaan
          </span>
          <h2 className="max-w-2xl font-serif text-3xl font-medium leading-tight tracking-tight sm:text-4xl text-balance">
            Semua pada tempatnya, tak ada yang saling berdesakan.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className={`group relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 backdrop-blur transition hover:border-primary/30 surface-tactile ${
                i === 0 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div
                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${f.accent} blur-2xl transition group-hover:scale-125`}
              />
              <div className="relative">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-background/60">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1.5 font-serif text-xl font-medium tracking-tight">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Philosophy — editorial pull-quote */}
      <section
        id="philosophy"
        className="relative z-10 mx-auto max-w-5xl px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-primary/5 via-card/40 to-amber-400/5 p-8 backdrop-blur sm:p-14">
          <span className="absolute left-6 top-2 font-serif text-[10rem] leading-none text-primary/10">
            &ldquo;
          </span>
          <p className="relative font-serif text-2xl font-medium leading-snug tracking-tight text-balance sm:text-3xl">
            Sebaik-baik amal adalah yang kecil dan dilakukan terus-menerus.
            Hayāt menjaganya tetap kecil, dan menjaganya tetap konsisten —
            tanpa menjadikan imanmu sebuah panggung.
          </p>
          <div className="relative mt-6 flex items-center gap-3">
            <div className="h-px w-10 bg-primary/40" />
            <p className="text-sm text-muted-foreground">
              prinsip tenang di balik sistem ini
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-border/70 bg-card/50 p-10 text-center backdrop-blur surface-tactile sm:p-16">
          <h2 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl text-balance">
            Mulai amalan kecil, hari ini.
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Sekali masuk. Tanpa email untuk dikonfirmasi. Buka pintu, lalu
            melangkahlah.
          </p>
          <a
            href="#begin"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground glow-primary transition hover:brightness-110"
          >
            Buka Hayāt
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </section>

      {/* Footer — sticky to bottom */}
      <footer className="relative z-10 mt-auto border-t border-border/60 bg-background/40 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="font-serif text-xs font-semibold leading-none">
                ح
              </span>
            </div>
            <span>Hayāt · Sistem Hidup</span>
          </div>
          <p className="text-center">
            Dibuat dengan hati-hati. {new Date().getFullYear()} ·{' '}
            <span className="text-muted-foreground/70">
              Atas nama konsistensi yang lembut.
            </span>
          </p>
          <div className="flex gap-5">
            <a href="#features" className="transition hover:text-foreground">
              Fitur
            </a>
            <a href="#begin" className="transition hover:text-foreground">
              Masuk
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
