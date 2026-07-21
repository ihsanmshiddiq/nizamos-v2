// Static color class maps — Tailwind JIT needs full literal class strings.
// Each entry returns complete class names so they're detectable at build time.

export type AccentColor =
  | 'emerald'
  | 'amber'
  | 'teal'
  | 'rose'
  | 'lime'
  | 'pink'
  | 'sky'
  | 'violet'
  | 'orange'
  | 'cyan'

interface ColorSet {
  /** soft tinted background for filled cells */
  fillBg: string
  /** text color on filled cells */
  fillText: string
  /** solid dot / swatch */
  dot: string
  /** large stat number color */
  stat: string
  /** ring for today cell */
  ring: string
  /** hex for inline styles */
  hex: string
}

export const colorMap: Record<AccentColor, ColorSet> = {
  emerald: {
    fillBg: 'bg-emerald-500/20',
    fillText: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    stat: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/40',
    hex: '#10b981',
  },
  amber: {
    fillBg: 'bg-amber-500/20',
    fillText: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
    stat: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/40',
    hex: '#f59e0b',
  },
  teal: {
    fillBg: 'bg-teal-500/20',
    fillText: 'text-teal-700 dark:text-teal-300',
    dot: 'bg-teal-500',
    stat: 'text-teal-600 dark:text-teal-400',
    ring: 'ring-teal-500/40',
    hex: '#14b8a6',
  },
  rose: {
    fillBg: 'bg-rose-500/20',
    fillText: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
    stat: 'text-rose-600 dark:text-rose-400',
    ring: 'ring-rose-500/40',
    hex: '#f43f5e',
  },
  lime: {
    fillBg: 'bg-lime-500/20',
    fillText: 'text-lime-700 dark:text-lime-300',
    dot: 'bg-lime-500',
    stat: 'text-lime-600 dark:text-lime-400',
    ring: 'ring-lime-500/40',
    hex: '#84cc16',
  },
  pink: {
    fillBg: 'bg-pink-500/20',
    fillText: 'text-pink-700 dark:text-pink-300',
    dot: 'bg-pink-500',
    stat: 'text-pink-600 dark:text-pink-400',
    ring: 'ring-pink-500/40',
    hex: '#ec4899',
  },
  sky: {
    fillBg: 'bg-sky-500/20',
    fillText: 'text-sky-700 dark:text-sky-300',
    dot: 'bg-sky-500',
    stat: 'text-sky-600 dark:text-sky-400',
    ring: 'ring-sky-500/40',
    hex: '#0ea5e9',
  },
  violet: {
    fillBg: 'bg-violet-500/20',
    fillText: 'text-violet-700 dark:text-violet-300',
    dot: 'bg-violet-500',
    stat: 'text-violet-600 dark:text-violet-400',
    ring: 'ring-violet-500/40',
    hex: '#8b5cf6',
  },
  orange: {
    fillBg: 'bg-orange-500/20',
    fillText: 'text-orange-700 dark:text-orange-300',
    dot: 'bg-orange-500',
    stat: 'text-orange-600 dark:text-orange-400',
    ring: 'ring-orange-500/40',
    hex: '#f97316',
  },
  cyan: {
    fillBg: 'bg-cyan-500/20',
    fillText: 'text-cyan-700 dark:text-cyan-300',
    dot: 'bg-cyan-500',
    stat: 'text-cyan-600 dark:text-cyan-400',
    ring: 'ring-cyan-500/40',
    hex: '#06b6d4',
  },
}

export function getColor(name: string | null | undefined): ColorSet {
  return (colorMap as Record<string, ColorSet>)[name || 'emerald'] || colorMap.emerald
}
