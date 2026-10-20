import { useState } from 'react'
import { useStore } from '../store'
import type { Service } from '../types'
import { formatDuration, formatPrice } from '../lib/date'
import ServiceForm from '../components/ServiceForm'
import Confirm from '../components/Confirm'
import { Empty } from '../components/ui'
import { IconEdit, IconPlus, IconScissors, IconTrash } from '../components/icons'

export default function Services() {
  const { db, saveService, deleteService } = useStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [toDelete, setToDelete] = useState<Service | null>(null)

  const services = db.services

  function openNew() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(service: Service) {
    setEditing(service)
    setFormOpen(true)
  }

  return (
    <div className="page">
      <p className="lead">
        Define los trabajos que haces. Al agendar una cita solo tendrás que elegir uno de esta
        lista.
      </p>

      {services.length === 0 ? (
        <Empty
          icon={<IconScissors size={30} />}
          title="Aún no hay trabajos"
          hint="Añade tus servicios con su duración y precio para agendar más rápido."
          action={
            <button type="button" className="btn primary" onClick={openNew}>
              <IconPlus size={18} /> Nuevo trabajo
            </button>
          }
        />
      ) : (
        <div className="card-list">
          {services.map((service) => (
            <div key={service.id} className={`service-card${service.active ? '' : ' off'}`}>
              <span className="service-bar" style={{ background: service.color }} />
              <div className="service-info">
                <div className="service-top">
                  <strong>{service.name}</strong>
                  <span className="service-meta">
                    {formatDuration(service.durationMin)} ·{' '}
                    {formatPrice(service.price, db.settings.currency)}
                  </span>
                </div>
                {service.description && <p className="service-desc">{service.description}</p>}
                <button
                  type="button"
                  className={`tag${service.active ? ' on' : ''}`}
                  onClick={() => saveService({ ...service, active: !service.active })}
                >
                  {service.active ? 'Disponible' : 'Oculto'}
                </button>
              </div>
              <div className="service-actions">
                <button
                  type="button"
                  className="icon-btn soft"
                  onClick={() => openEdit(service)}
                  aria-label="Editar"
                >
                  <IconEdit size={18} />
                </button>
                <button
                  type="button"
                  className="icon-btn soft danger"
                  onClick={() => setToDelete(service)}
                  aria-label="Eliminar"
                >
                  <IconTrash size={18} />
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="btn ghost block" onClick={openNew}>
            <IconPlus size={18} /> Nuevo trabajo
          </button>
        </div>
      )}

      <ServiceForm open={formOpen} service={editing} onClose={() => setFormOpen(false)} />

      <Confirm
        open={toDelete !== null}
        title="¿Eliminar este trabajo?"
        message="Las citas ya agendadas conservarán su historial."
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteService(toDelete.id)
          setToDelete(null)
        }}
      />
    </div>
  )
}
