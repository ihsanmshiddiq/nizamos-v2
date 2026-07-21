'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp, type View, type User } from '@/stores/app-store'
import {
  LayoutDashboard,
  ListChecks,
  Wallet,
  CalendarHeart,
  BarChart3,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navItems: { id: View; label: string; icon: React.ElementType; hint: string }[] = [
  { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard, hint: 'Ringkasan hidupmu hari ini' },
  { id: 'task', label: 'Tugas', icon: ListChecks, hint: 'Kebiasaan · Sholat · Hifdz · Target' },
  { id: 'finance', label: 'Keuangan', icon: Wallet, hint: 'Anggaran & tabungan' },
  { id: 'cycle', label: 'Siklus', icon: CalendarHeart, hint: 'Kalender menstruasi' },
  { id: 'stats', label: 'Statistik', icon: BarChart3, hint: 'Grafik & analitik' },
  { id: 'settings', label: 'Pengaturan', icon: SettingsIcon, hint: 'Preferensi' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, view, setView, refresh } = useApp()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const filteredNav = navItems.filter(
    (n) => n.id !== 'cycle' || user?.enableMenstrual
  )

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-aurora absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/8 blur-[100px]" />
        <div className="animate-aurora absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-amber-400/6 blur-[100px] [animation-delay:-8s]" />
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/60 bg-sidebar/70 backdrop-blur-xl lg:flex">
        <SidebarContent
          user={user}
          view={view}
          setView={setView}
          nav={filteredNav}
          refresh={refresh}
        />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="font-serif text-sm font-semibold leading-none">ح</span>
          </div>
          <span className="font-serif text-base font-medium">Hayāt</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/60 bg-sidebar shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between px-4 py-4">
                <span className="font-serif text-lg">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent
                user={user}
                view={view}
                setView={(v) => {
                  setView(v)
                  setMobileOpen(false)
                }}
                nav={filteredNav}
                refresh={refresh}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6 lg:px-10 lg:pt-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border/60 bg-background/90 px-2 py-1.5 backdrop-blur-xl lg:hidden">
        {filteredNav.map((item) => {
          const active = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] transition ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
              <span className={`font-medium ${active ? 'text-primary' : ''}`}>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

function SidebarContent({
  user,
  view,
  setView,
  nav,
  refresh,
}: {
  user: User | null
  view: View
  setView: (v: View) => void
  nav: { id: View; label: string; icon: React.ElementType; hint: string }[]
  refresh: () => Promise<void>
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
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

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        <p className="px-3 pb-2 pt-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
          Permukaan
        </p>
        {nav.map((item) => {
          const active = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                  transition={{ type: 'spring', damping: 24, stiffness: 280 }}
                />
              )}
              <item.icon className="h-4 w-4 shrink-0" />
              <div className="flex flex-col items-start leading-tight">
                <span className="font-medium">{item.label}</span>
                <span className="text-[10px] text-muted-foreground/70">
                  {item.hint}
                </span>
              </div>
            </button>
          )
        })}
      </nav>

      {/* Footer of sidebar */}
      <div className="border-t border-border/60 p-3">
        <div className="mb-2 flex items-center gap-1 rounded-lg p-1">
          <ThemeToggle compact />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition hover:bg-accent/60">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">
                  {(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium">
                  {user?.name || 'Sahabat'}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {user?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setView('settings')}
              className="cursor-pointer"
            >
              <SettingsIcon className="mr-2 h-4 w-4" />
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await apiClient.post('/api/auth/logout')
                  toast.success('Berhasil keluar')
                  await refresh()
                } catch {
                  toast.error('Gagal keluar')
                }
              }}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function ThemeToggle({ compact }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return <div className={compact ? 'h-8 w-full' : 'h-9 w-9'} />

  const options = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'system', icon: Monitor, label: 'Auto' },
  ] as const

  if (compact) {
    return (
      <div className="flex w-full items-center gap-1">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => setTheme(o.id)}
            className={`flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs transition ${
              theme === o.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent'
            }`}
          >
            <o.icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-9 w-9"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
