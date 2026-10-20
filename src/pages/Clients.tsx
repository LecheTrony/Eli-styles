import { useState } from 'react'
import { useStore } from '../store'
import type { Appointment, Client } from '../types'
import { initials } from '../lib/date'
import ClientForm from '../components/ClientForm'
import ClientDetail from '../components/ClientDetail'
import AppointmentDetail from '../components/AppointmentDetail'
import { Empty } from '../components/ui'
import { IconChevronRight, IconPlus, IconSearch, IconUsers } from '../components/icons'

type Props = {
  onNewAppointment: (clientId: string) => void
  onEditAppointment: (appointment: Appointment) => void
}

export default function Clients({ onNewAppointment, onEditAppointment }: Props) {
  const { db } = useStore()
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [appointmentId, setAppointmentId] = useState<string | null>(null)

  const normalized = query.trim().toLowerCase()
  const clients = db.clients
    .filter(
      (client) =>
        !normalized ||
        client.name.toLowerCase().includes(normalized) ||
        client.phone.replace(/\s/g, '').includes(normalized.replace(/\s/g, ''))
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))

  function countFor(clientId: string): number {
    return db.appointments.filter(
      (appointment) => appointment.clientId === clientId && appointment.status !== 'cancelada'
    ).length
  }

  return (
    <div className="page">
      <div className="search">
        <IconSearch size={18} />
        <input
          className="input"
          placeholder="Buscar cliente"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {clients.length === 0 ? (
        <Empty
          icon={<IconUsers size={30} />}
          title={db.clients.length === 0 ? 'Sin clientes todavía' : 'Sin resultados'}
          hint={
            db.clients.length === 0
              ? 'Aquí guardas los datos de tus clientas: nombre, teléfono y notas.'
              : 'Prueba con otro nombre o teléfono.'
          }
          action={
            db.clients.length === 0 ? (
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
              >
                <IconPlus size={18} /> Nuevo cliente
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="card-list">
          {clients.map((client) => (
            <button
              key={client.id}
              type="button"
              className="client-card"
              onClick={() => setDetailId(client.id)}
            >
              <span className="avatar">{initials(client.name)}</span>
              <span className="client-info">
                <strong>{client.name}</strong>
                <span>{client.phone}</span>
              </span>
              <span className="client-visits">
                {countFor(client.id)} {countFor(client.id) === 1 ? 'cita' : 'citas'}
              </span>
              <IconChevronRight size={18} className="appt-chevron" />
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className="btn ghost block"
        onClick={() => {
          setEditing(null)
          setFormOpen(true)
        }}
      >
        <IconPlus size={18} /> Nuevo cliente
      </button>

      <ClientForm open={formOpen} client={editing} onClose={() => setFormOpen(false)} />

      <ClientDetail
        clientId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={(client) => {
          setDetailId(null)
          setEditing(client)
          setFormOpen(true)
        }}
        onNewAppointment={(clientId) => {
          setDetailId(null)
          onNewAppointment(clientId)
        }}
        onOpenAppointment={(id) => setAppointmentId(id)}
      />

      <AppointmentDetail
        appointmentId={appointmentId}
        onClose={() => setAppointmentId(null)}
        onEdit={(appointment) => {
          setAppointmentId(null)
          onEditAppointment(appointment)
        }}
      />
    </div>
  )
}
