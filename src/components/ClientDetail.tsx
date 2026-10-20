import { useStore } from '../store'
import type { Appointment, Client } from '../types'
import { formatDayShort, initials, todayISO } from '../lib/date'
import Sheet from '../components/Sheet'
import AppointmentRow from '../components/AppointmentRow'
import {
  IconCalendar,
  IconEdit,
  IconMail,
  IconMessage,
  IconPhone,
  IconPlus,
} from '../components/icons'

type Props = {
  clientId: string | null
  onClose: () => void
  onEdit: (client: Client) => void
  onNewAppointment: (clientId: string) => void
  onOpenAppointment: (appointmentId: string) => void
}

export default function ClientDetail({
  clientId,
  onClose,
  onEdit,
  onNewAppointment,
  onOpenAppointment,
}: Props) {
  const { db } = useStore()
  const client = db.clients.find((item) => item.id === clientId) ?? null

  if (!client) {
    return <Sheet open={false} title="Cliente" onClose={onClose}>{null}</Sheet>
  }

  const colorOf = (id: string) =>
    db.services.find((service) => service.id === id)?.color ?? '#c9b6be'

  const appointments = db.appointments
    .filter((appointment) => appointment.clientId === client.id)
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))

  const completed = appointments.filter((appointment) => appointment.status === 'completada')
  const lastVisit = completed[0]
  const upcoming = [...appointments]
    .filter(
      (appointment) =>
        appointment.status !== 'cancelada' && appointment.date >= todayISO()
    )
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0]

  const digits = client.phone.replace(/\D/g, '')

  return (
    <Sheet
      open
      title="Ficha del cliente"
      onClose={onClose}
      footer={
        <div className="sheet-actions">
          <button type="button" className="btn ghost" onClick={() => onEdit(client)}>
            <IconEdit size={18} /> Editar
          </button>
          <button
            type="button"
            className="btn primary block"
            onClick={() => onNewAppointment(client.id)}
          >
            <IconPlus size={18} /> Nueva cita
          </button>
        </div>
      }
    >
      <div className="detail-head">
        <span className="avatar lg">{initials(client.name)}</span>
        <div className="detail-head-info">
          <h3>{client.name}</h3>
          <span className="muted">{client.phone}</span>
        </div>
      </div>

      <div className="contact-actions">
        {digits.length >= 8 && (
          <a
            className="btn ghost"
            href={`https://wa.me/${digits}`}
            target="_blank"
            rel="noreferrer"
          >
            <IconMessage size={18} /> WhatsApp
          </a>
        )}
        {digits.length >= 6 && (
          <a className="btn ghost" href={`tel:${digits}`}>
            <IconPhone size={18} /> Llamar
          </a>
        )}
        {client.email && (
          <a className="btn ghost" href={`mailto:${client.email}`}>
            <IconMail size={18} /> Email
          </a>
        )}
      </div>

      <div className="mini-stats">
        <div className="mini-stat">
          <span>Visitas</span>
          <strong>{completed.length}</strong>
        </div>
        <div className="mini-stat">
          <span>Última visita</span>
          <strong>{lastVisit ? formatDayShort(lastVisit.date) : '—'}</strong>
        </div>
        <div className="mini-stat">
          <span>Próxima cita</span>
          <strong>
            {upcoming ? `${formatDayShort(upcoming.date)} · ${upcoming.time}` : '—'}
          </strong>
        </div>
      </div>

      {client.notes && (
        <div className="notes-box">
          <span className="notes-label">Notas</span>
          <p>{client.notes}</p>
        </div>
      )}

      <h4 className="mini-title">
        <IconCalendar size={16} /> Historial de citas
      </h4>
      {appointments.length === 0 ? (
        <p className="muted small">Todavía no tiene citas registradas.</p>
      ) : (
        <div className="appt-list">
          {appointments.map((appointment: Appointment) => (
            <AppointmentRow
              key={appointment.id}
              appointment={appointment}
              color={colorOf(appointment.serviceId)}
              currency={db.settings.currency}
              showDate
              onClick={() => onOpenAppointment(appointment.id)}
            />
          ))}
        </div>
      )}
    </Sheet>
  )
}
