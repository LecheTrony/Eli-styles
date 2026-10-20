export const WEEKDAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y || 2000, (m || 1) - 1, d || 1)
  return Number.isNaN(date.getTime()) ? new Date() : date
}

export function addDaysISO(iso: string, days: number): string {
  const d = fromISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function isToday(iso: string): boolean {
  return iso === todayISO()
}

export function capitalize(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text
}

export function formatDayLong(iso: string): string {
  return capitalize(
    fromISODate(iso).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  )
}

export function formatDayShort(iso: string): string {
  return capitalize(
    fromISODate(iso).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  )
}

export function formatMonthTitle(year: number, month: number): string {
  return capitalize(
    new Date(year, month, 1).toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    })
  )
}

export type MonthCell = { iso: string; inMonth: boolean }

export function monthCells(year: number, month: number): MonthCell[] {
  const first = new Date(year, month, 1)
  const leading = (first.getDay() + 6) % 7 // lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevDays = new Date(year, month, 0).getDate()
  const cells: MonthCell[] = []

  for (let i = leading - 1; i >= 0; i--) {
    const day = prevDays - i
    const d = new Date(year, month - 1, day)
    cells.push({ iso: toISODate(d), inMonth: false })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ iso: `${year}-${pad(month + 1)}-${pad(day)}`, inMonth: true })
  }
  let next = 1
  while (cells.length % 7 !== 0) {
    const d = new Date(year, month + 1, next++)
    cells.push({ iso: toISODate(d), inMonth: false })
  }
  return cells
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function minutesToTime(minutes: number): string {
  const total = Math.max(0, Math.min(24 * 60 - 1, Math.round(minutes)))
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

export function formatPrice(value: number, currency: string): string {
  const symbol = currency || '$'
  const amount = Number.isFinite(value) ? value.toLocaleString('es-ES') : '0'
  const sep = symbol.length <= 2 ? '' : ' '
  return `${symbol}${sep}${amount}`
}

export function getGreeting(hour = new Date().getHours()): string {
  if (hour >= 5 && hour < 14) return 'Buenos días'
  if (hour >= 14 && hour < 21) return 'Buenas tardes'
  return 'Buenas noches'
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}
