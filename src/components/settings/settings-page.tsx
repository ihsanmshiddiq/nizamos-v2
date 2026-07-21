'use client'

import * as React from 'react'
import { useApp } from '@/stores/app-store'
import { apiClient } from '@/lib/api-client'
import { useTheme } from 'next-themes'
import {
  User as UserIcon,
  Palette,
  CalendarHeart,
  Coins,
  Moon,
  Sun,
  Monitor,
  LogOut,
  Check,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const CURRENCIES = [
  { code: 'IDR', label: 'Indonesian Rupiah (Rp)' },
  { code: 'USD', label: 'Dolar AS ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'Pound Sterling (£)' },
  { code: 'MYR', label: 'Ringgit Malaysia (RM)' },
  { code: 'SAR', label: 'Riyal Saudi (﷼)' },
  { code: 'AED', label: 'Dirham UAE (د.إ)' },
  { code: 'TRY', label: 'Lira Turki (₺)' },
]

export function SettingsPage() {
  const { user, refresh, setView } = useApp()
  const { theme, setTheme } = useTheme()
  const [name, setName] = React.useState(user?.name || '')
  const [currency, setCurrency] = React.useState(user?.currency || 'IDR')
  const [enableMenstrual, setEnableMenstrual] = React.useState(user?.enableMenstrual || false)
  const [saving, setSaving] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  async function patch(body: any) {
    setSaving(true)
    try {
      await apiClient.patch('/api/settings', body)
      await refresh()
      toast.success('Tersimpan')
    } catch {
      toast.error('Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  async function handleName() {
    await patch({ name: name.trim() })
  }

  async function handleCurrency(c: string) {
    setCurrency(c)
    await patch({ currency: c })
  }

  async function handleMenstrual(v: boolean) {
    setEnableMenstrual(v)
    await patch({ enableMenstrual: v })
    if (!v) setView('task')
  }

  async function handleTheme(t: string) {
    setTheme(t)
    await patch({ theme: t })
  }

  async function logout() {
    try {
      await apiClient.post('/api/auth/logout')
      toast.success('Berhasil keluar')
      await refresh()
    } catch {
      toast.error('Gagal keluar')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary">
          Pengaturan
        </p>
        <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
          Atur sesukamu
        </h1>
      </div>

      {/* Profile */}
      <Section icon={UserIcon} title="Profil" desc="Namamu di Hayāt">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-border">
            <AvatarFallback className="bg-primary/15 text-xl font-medium text-primary">
              {(name || user?.email || 'U').slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{user?.email}</p>
            <p className="text-xs text-muted-foreground">
              Masuk lewat {user?.provider === 'google' ? 'Google' : 'email'}
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          <Label>Nama tampilan</Label>
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Namamu" />
            <Button onClick={handleName} disabled={saving || name === (user?.name || '')}>
              Simpan
            </Button>
          </div>
        </div>
      </Section>

      {/* Appearance */}
      <Section icon={Palette} title="Tampilan" desc="Terang, gelap, atau ikut sistem">
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'light', label: 'Terang', icon: Sun },
            { id: 'dark', label: 'Gelap', icon: Moon },
            { id: 'system', label: 'Otomatis', icon: Monitor },
          ].map((o) => (
            <button
              key={o.id}
              onClick={() => handleTheme(o.id)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border p-4 transition',
                mounted && theme === o.id
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:bg-accent/50'
              )}
            >
              <o.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{o.label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Menstrual */}
      <Section
        icon={CalendarHeart}
        title="Kalender menstruasi"
        desc="Kalkulator siklus privat buat Muslimah. Default-nya mati."
      >
        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 p-4">
          <div>
            <p className="text-sm font-medium">Aktifkan permukaan Siklus</p>
            <p className="text-xs text-muted-foreground">
              Nambah kalender privat di sidebar. Bisa dimatiin kapan aja.
            </p>
          </div>
          <Switch checked={enableMenstrual} onCheckedChange={handleMenstrual} />
        </div>
        {enableMenstrual && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-pink-500/5 px-3 py-2 text-xs text-pink-600 dark:text-pink-400">
            <Sparkles className="h-3.5 w-3.5" />
            Siklus sekarang muncul di sidebar.
          </div>
        )}
      </Section>

      {/* Currency */}
      <Section icon={Coins} title="Mata uang" desc="Dipakai di permukaan Keuangan">
        <Select value={currency} onValueChange={handleCurrency}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Section>

      {/* Account / sign out */}
      <Section icon={LogOut} title="Akun" desc="Akhiri sesi ini">
        <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Keluar
        </Button>
      </Section>

      <p className="pb-8 text-center text-xs text-muted-foreground/60">
        Hayāt · Life OS · Datamu cuma ada di perangkat ini.
      </p>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: React.ElementType
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur surface-tactile sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="font-serif text-lg font-medium">{title}</h2>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  )
}
