import { useState } from 'react'
import { useStore } from '../store'
import type { Appointment } from '../types'
import { formatPrice, getGreeting, todayISO } from '../lib/date'
import AppointmentRow from '../components/AppointmentRow'
import AppointmentDetail from '../components/AppointmentDetail'
import { Empty } from '../components/ui'
import { IconClock, IconPlus } from '../components/icons'

type Props = {
  onNew: (date: string) => void
  onEdit: (appointment: Appointment) => void
}

export default function Today({ onNew, onEdit }: Props) {
  const { db } = useStore()
  const [detailId, setDetailId] = useState<string | null>(null)
  const today = todayISO()
  const colorOf = (id: string) =>
    db.services.find((service) => service.id === id)?.color ?? '#c9b6be'

  const list = db.appointments
    .filter((appointment) => appointment.date === today)
    .sort((a, b) => a.time.localeCompare(b.time))

  const activeList = list.filter((appointment) => appointment.status !== 'cancelada')
  const pendingCount = list.filter((appointment) => appointment.status === 'pendiente').length
  const collected = activeList
    .filter((appointment) => appointment.status === 'completada')
    .reduce((sum, appointment) => sum + appointment.price, 0)
  const next = activeList.find((appointment) => appointment.status !== 'completada')

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-text">
          <p className="hero-hi">
            {getGreeting()}
            {db.settings.ownerName ? `, ${db.settings.ownerName}` : ''} 👋
          </p>
          <p className="hero-sub">
            {next
              ? `Siguiente cita a las ${next.time} · ${next.clientName}`
              : activeList.length > 0
                ? 'Todas las citas del día están atendidas'
                : 'Aún no tienes citas para hoy'}
          </p>
        </div>
        <button type="button" className="btn primary" onClick={() => onNew(today)}>
          <IconPlus size={18} /> Cita
        </button>
      </section>

      <div className="stats">
        <div className="stat">
          <span>Citas</span>
          <strong>{activeList.length}</strong>
        </div>
        <div className="stat">
          <span>Pendientes</span>
          <strong>{pendingCount}</strong>
        </div>
        <div className="stat">
          <span>Cobrado</span>
          <strong>{formatPrice(collected, db.settings.currency)}</strong>
        </div>
      </div>

      {list.length === 0 ? (
        <Empty
          icon={<IconClock size={30} />}
          title="No hay citas para hoy"
          hint="Cuando agendes una cita aparecerá aquí, ordenada por hora."
          action={
            <button type="button" className="btn primary" onClick={() => onNew(today)}>
              <IconPlus size={18} /> Agendar cita
            </button>
          }
        />
      ) : (
        <>
          <h2 className="sec-title">Agenda de hoy</h2>
          <div className="appt-list">
            {list.map((appointment) => (
              <AppointmentRow
                key={appointment.id}
                appointment={appointment}
                color={colorOf(appointment.serviceId)}
                currency={db.settings.currency}
                onClick={() => setDetailId(appointment.id)}
              />
            ))}
          </div>
        </>
      )}

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
