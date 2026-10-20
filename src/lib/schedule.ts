import { minutesToTime, timeToMinutes } from './date'

export type Slot = { time: string; free: boolean }

type BusyAppointment = { time: string; durationMin: number }

type Options = {
  date: string
  durationMin: number
  openTime: string
  closeTime: string
  intervalMin: number
  busy: BusyAppointment[]
}

/**
 * Genera las horas disponibles para un día: todas las que caben en el
 * horario del local y que no se solapan con citas ya ocupadas.
 */
export function buildSlots(opts: Options): Slot[] {
  const { durationMin, openTime, closeTime, intervalMin, busy } = opts
  const start = timeToMinutes(openTime)
  const end = timeToMinutes(closeTime)
  const step = Math.max(5, intervalMin || 30)
  const duration = Math.max(5, durationMin || 30)

  const slots: Slot[] = []
  for (let t = start; t + duration <= end; t += step) {
    const free = !busy.some((b) => {
      const bStart = timeToMinutes(b.time)
      const bEnd = bStart + b.durationMin
      return t < bEnd && bStart < t + duration
    })
    slots.push({ time: minutesToTime(t), free })
  }
  return slots
}

export function firstFreeSlot(slots: Slot[]): string {
  return slots.find((s) => s.free)?.time ?? slots[0]?.time ?? ''
}
