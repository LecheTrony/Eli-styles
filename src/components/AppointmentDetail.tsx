import { useState } from 'react'
import { useStore } from '../store'
import type { Appointment } from '../types'
import {
  formatDayLong,
  formatDuration,
  formatPrice,
  initials,
  minutesToTime,
  timeToMinutes,
} from '../lib/date'
import Sheet from './Sheet'
import Confirm from './Confirm'
import { STATUS_LABELS, STATUS_ORDER, StatusBadge } from './ui'
import {
  IconCalendar,
  IconClock,
  IconEdit,
  IconMail,
  IconMessage,
  IconPhone,
  IconScissors,
  IconTrash,
} from './icons'

type Props = {
  appointmentId: string | null
  onClose: () => void
  onEdit: (appointment: Appointment) => void
}

export default function AppointmentDetail({ appointmentId, onClose, onEdit }: Props) {
  const { db, setAppointmentStatus, deleteAppointment } = useStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const appointment = db.appointments.find((item) => item.id === appointmentId) ?? null

  if (!appointment) {
    return <Sheet open={false} title="Cita" onClose={onClose} children={null} />
  }

  const client = db.clients.find((item) => item.id === appointment.clientId)
  const phone = client?.phone ?? appointment.clientPhone
  const email = client?.email ?? ''
  const digits = phone.replace(/\D/g, '')
  const endTime = minutesToTime(timeToMinutes(appointment.time) + appointment.durationMin)
  const whatsappText = encodeURIComponent(
    `Hola ${appointment.clientName}, te escribo de ${db.settings.businessName}. ` +
      `Te recuerdo tu cita el ${formatDayLong(appointment.date)} a las ${appointment.time}. ¡Te espero!`
  )

  return (
    <Sheet
      open
      title="Detalle de la cita"
      onClose={onClose}
      footer={
        <div className="sheet-actions">
          <button
            type="button"
            className="btn danger-ghost"
            onClick={() => setConfirmDelete(true)}
          >
            <IconTrash size={18} /> Eliminar
          </button>
          <button type="button" className="btn primary block" onClick={() => onEdit(appointment)}>
            <IconEdit size={18} /> Editar
          </button>
        </div>
      }
    >
      <div className="detail-head">
        <span className="avatar lg">{initials(appointment.clientName)}</span>
        <div className="detail-head-info">
          <h3>{appointment.clientName}</h3>
          <StatusBadge status={appointment.status} />
        </div>
      </div>

      <div className="detail-rows">
        <div className="detail-row">
          <IconScissors size={18} />
          <span>Trabajo</span>
          <strong>{appointment.serviceName || '—'}</strong>
        </div>
        <div className="detail-row">
          <IconCalendar size={18} />
          <span>Fecha</span>
          <strong>{formatDayLong(appointment.date)}</strong>
        </div>
        <div className="detail-row">
          <IconClock size={18} />
          <span>Hora</span>
          <strong>
            {appointment.time} – {endTime}
          </strong>
        </div>
        <div className="detail-row">
          <span className="detail-symbol">{db.settings.currency}</span>
          <span>Precio</span>
          <strong>{formatPrice(appointment.price, db.settings.currency)}</strong>
        </div>
      </div>

      {appointment.notes && <p className="detail-notes">{appointment.notes}</p>}

      <div className="contact-actions">
        {digits.length >= 8 && (
          <a
            className="btn ghost"
            href={`https://wa.me/${digits}?text=${whatsappText}`}
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
        {email && (
          <a className="btn ghost" href={`mailto:${email}`}>
            <IconMail size={18} /> Email
          </a>
        )}
      </div>

      <h4 className="mini-title">Estado de la cita</h4>
      <div className="seg">
        {STATUS_ORDER.map((status) => (
          <button
            key={status}
            type="button"
            className={appointment.status === status ? 'active' : ''}
            onClick={() => setAppointmentStatus(appointment.id, status)}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      <p className="muted small">Duración: {formatDuration(appointment.durationMin)}</p>

      <Confirm
        open={confirmDelete}
        title="¿Eliminar esta cita?"
        message="Esta acción no se puede deshacer."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteAppointment(appointment.id)
          setConfirmDelete(false)
          onClose()
        }}
      />
    </Sheet>
  )
}
