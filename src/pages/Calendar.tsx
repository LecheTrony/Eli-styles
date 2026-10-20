import { useMemo, useState } from 'react'
import { useStore } from '../store'
import type { Appointment } from '../types'
import {
  formatDayLong,
  formatMonthTitle,
  fromISODate,
  isToday,
  monthCells,
  todayISO,
  WEEKDAYS_SHORT,
} from '../lib/date'
import AppointmentRow from '../components/AppointmentRow'
import AppointmentDetail from '../components/AppointmentDetail'
import { Empty } from '../components/ui'
import { IconCalendar, IconChevronLeft, IconChevronRight, IconPlus } from '../components/icons'

type Props = {
  selected: string
  onSelect: (iso: string) => void
  onNew: (date: string) => void
  onEdit: (appointment: Appointment) => void
}

export default function Calendar({ selected, onSelect, onNew, onEdit }: Props) {
  const { db } = useStore()
  const [detailId, setDetailId] = useState<string | null>(null)
  const [cursor, setCursor] = useState(() => {
    const date = fromISODate(selected)
    return { year: date.getFullYear(), month: date.getMonth() }
  })

  const colorOf = (id: string) =>
    db.services.find((service) => service.id === id)?.color ?? '#c9b6be'

  const byDate = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    for (const appointment of db.appointments) {
      const bucket = map.get(appointment.date)
      if (bucket) bucket.push(appointment)
      else map.set(appointment.date, [appointment])
    }
    for (const bucket of map.values()) {
      bucket.sort((a, b) => a.time.localeCompare(b.time))
    }
    return map
  }, [db.appointments])

  const cells = useMemo(() => monthCells(cursor.year, cursor.month), [cursor])
  const dayList = byDate.get(selected) ?? []

  function move(delta: number) {
    setCursor((current) => {
      const date = new Date(current.year, current.month + delta, 1)
      return { year: date.getFullYear(), month: date.getMonth() }
    })
  }

  function goToday() {
    const date = fromISODate(todayISO())
    setCursor({ year: date.getFullYear(), month: date.getMonth() })
    onSelect(todayISO())
  }

  function pick(iso: string, inMonth: boolean) {
    onSelect(iso)
    if (!inMonth) {
      const date = fromISODate(iso)
      setCursor({ year: date.getFullYear(), month: date.getMonth() })
    }
  }

  return (
    <div className="page">
      <div className="cal-head">
        <div className="cal-title">{formatMonthTitle(cursor.year, cursor.month)}</div>
        <div className="cal-nav">
          <button type="button" className="icon-btn soft" onClick={() => move(-1)} aria-label="Mes anterior">
            <IconChevronLeft size={20} />
          </button>
          <button type="button" className="pill" onClick={goToday}>
            Hoy
          </button>
          <button type="button" className="icon-btn soft" onClick={() => move(1)} aria-label="Mes siguiente">
            <IconChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="cal-weekdays">
        {WEEKDAYS_SHORT.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="cal-grid">
        {cells.map((cell) => {
          const dayAppointments = byDate.get(cell.iso) ?? []
          const visible = dayAppointments.filter((appointment) => appointment.status !== 'cancelada')
          const colors = Array.from(new Set(visible.map((appointment) => colorOf(appointment.serviceId))))
          return (
            <button
              key={cell.iso}
              type="button"
              className={[
                'cal-cell',
                cell.inMonth ? '' : 'other',
                isToday(cell.iso) ? 'today' : '',
                cell.iso === selected ? 'selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => pick(cell.iso, cell.inMonth)}
            >
              <span className="cal-num">{Number(cell.iso.slice(-2))}</span>
              <span className="cal-dots">
                {colors.slice(0, 3).map((color) => (
                  <span key={color} className="cal-dot" style={{ background: color }} />
                ))}
              </span>
            </button>
          )
        })}
      </div>

      <div className="day-panel">
        <div className="day-panel-head">
          <h2>{formatDayLong(selected)}</h2>
          <span className="day-count">
            {
              dayList.filter((appointment) => appointment.status !== 'cancelada').length === 1
                ? '1 cita'
                : `${dayList.filter((appointment) => appointment.status !== 'cancelada').length} citas`
            }
          </span>
        </div>

        {dayList.length === 0 ? (
          <Empty
            icon={<IconCalendar size={30} />}
            title="Día libre"
            hint="No hay citas agendadas para este día."
          />
        ) : (
          <div className="appt-list">
            {dayList.map((appointment) => (
              <AppointmentRow
                key={appointment.id}
                appointment={appointment}
                color={colorOf(appointment.serviceId)}
                currency={db.settings.currency}
                onClick={() => setDetailId(appointment.id)}
              />
            ))}
          </div>
        )}

        <button type="button" className="btn ghost block" onClick={() => onNew(selected)}>
          <IconPlus size={18} /> Añadir cita este día
        </button>
      </div>

      <AppointmentDetail
        appointmentId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={(appointment) => {
          setDetailId(null)
          onEdit(appointment)
        }}
      />
    </div>
  )
}
