'use client'

import * as React from 'react'
import { useApp } from '@/stores/app-store'
import { QueryProvider } from '@/components/query-provider'
import { LandingPage } from '@/components/landing/landing-page'
import { AppShell } from '@/components/app/app-shell'
import { DashboardPage } from '@/components/dashboard/dashboard-page'
import { TaskPage } from '@/components/task/task-page'
import { FinancePage } from '@/components/finance/finance-page'
import { CyclePage } from '@/components/cycle/cycle-page'
import { StatsPage } from '@/components/stats/stats-page'
import { SettingsPage } from '@/components/settings/settings-page'

export default function Home() {
  return (
    <QueryProvider>
      <Gate />
    </QueryProvider>
  )
}

function Gate() {
  const { user, loading, view, refresh } = useApp()

  React.useEffect(() => {
    refresh()
  }, [refresh])

  // Apply theme from user settings on login
  React.useEffect(() => {
    if (user?.theme) {
      const stored = localStorage.getItem('theme')
      if (stored !== user.theme) {
        localStorage.setItem('theme', user.theme)
        const event = new Event('theme-change')
        window.dispatchEvent(event)
        // next-themes reads on mount; force re-eval
        document.documentElement.classList.remove('light', 'dark')
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const effective = user.theme === 'system' ? (prefersDark ? 'dark' : 'light') : user.theme
        document.documentElement.classList.add(effective)
      }
    }
  }, [user?.theme])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground glow-primary">
            <span className="font-serif text-2xl font-semibold leading-none">ح</span>
            <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/30" />
          </div>
          <p className="font-serif text-sm text-muted-foreground">Loading your life…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LandingPage />
  }

  // Guard: cycle surface only renders when the feature is enabled
  const effectiveView =
    view === 'cycle' && !user.enableMenstrual ? 'task' : view

  return (
    <AppShell>
      {effectiveView === 'dashboard' && <DashboardPage />}
      {effectiveView === 'task' && <TaskPage />}
      {effectiveView === 'finance' && <FinancePage />}
      {effectiveView === 'cycle' && <CyclePage />}
      {effectiveView === 'stats' && <StatsPage />}
      {effectiveView === 'settings' && <SettingsPage />}
    </AppShell>
  )
}
