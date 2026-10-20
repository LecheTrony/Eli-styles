import type { Appointment } from '../types'
import { formatDuration, formatPrice, formatDayShort, minutesToTime, timeToMinutes } from '../lib/date'
import { IconChevronRight } from './icons'
import { StatusBadge } from './ui'

type Props = {
  appointment: Appointment
  color: string
  currency: string
  showDate?: boolean
  onClick?: () => void
}

export default function AppointmentRow({
  appointment,
  color,
  currency,
  showDate = false,
  onClick,
}: Props) {
  const endTime = minutesToTime(timeToMinutes(appointment.time) + appointment.durationMin)

  return (
    <button
      type="button"
      className={`appt-row${appointment.status === 'cancelada' ? ' cancelled' : ''}`}
      onClick={onClick}
    >
      <div className="appt-time">
        <strong>{appointment.time}</strong>
        <span>{endTime}</span>
      </div>
      <div className="appt-main">
        <div className="appt-name">{appointment.clientName || 'Cliente'}</div>
        <div className="appt-sub">
          <span className="dot" style={{ background: color }} />
          <span className="appt-service">{appointment.serviceName || 'Trabajo'}</span>
          <span className="appt-price">{formatPrice(appointment.price, currency)}</span>
        </div>
        {showDate && <div className="appt-date-line">{formatDayShort(appointment.date)}</div>}
      </div>
      <div className="appt-right">
        <StatusBadge status={appointment.status} />
        <span className="appt-duration">{formatDuration(appointment.durationMin)}</span>
      </div>
      <IconChevronRight size={18} className="appt-chevron" />
    </button>
  )
}
