import { useEffect, useState } from 'react'
import { useStore } from '../store'
import type { Service } from '../types'
import { uid } from '../lib/id'
import { SERVICE_COLORS } from '../lib/db'
import Sheet from './Sheet'
import Confirm from './Confirm'
import { Field } from './ui'

type Props = {
  open: boolean
  service: Service | null
  onClose: () => void
}

export default function ServiceForm({ open, service, onClose }: Props) {
  const { saveService, deleteService } = useStore()
  const [name, setName] = useState('')
  const [duration, setDuration] = useState(45)
  const [price, setPrice] = useState(300)
  const [color, setColor] = useState(SERVICE_COLORS[0])
  const [description, setDescription] = useState('')
  const [active, setActive] = useState(true)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(service?.name ?? '')
    setDuration(service?.durationMin ?? 45)
    setPrice(service?.price ?? 300)
    setColor(service?.color ?? SERVICE_COLORS[0])
    setDescription(service?.description ?? '')
    setActive(service?.active ?? true)
    setError('')
    setConfirmDelete(false)
  }, [open, service])

  function save() {
    if (!name.trim()) {
      setError('Pon un nombre al trabajo.')
      return
    }
    if (!Number.isFinite(duration) || duration < 5) {
      setError('La duración mínima es de 5 minutos.')
      return
    }
    saveService({
      id: service?.id ?? uid(),
      name: name.trim(),
      durationMin: duration,
      price: Number.isFinite(price) ? price : 0,
      color,
      description: description.trim(),
      active,
    })
    onClose()
  }

  return (
    <Sheet
      open={open}
      title={service ? 'Editar trabajo' : 'Nuevo trabajo'}
      onClose={onClose}
      footer={
        <div className="sheet-actions">
          {service && (
            <button
              type="button"
              className="btn danger-ghost"
              onClick={() => setConfirmDelete(true)}
            >
              Eliminar
            </button>
          )}
          <button type="button" className="btn primary block" onClick={save}>
            Guardar
          </button>
        </div>
      }
    >
      {error && <p className="alert">{error}</p>}

      <Field label="Nombre del trabajo *">
        <input
          className="input"
          placeholder="Corte de cabello, Manicure, Tinte…"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>

      <div className="grid-2">
        <Field label="Duración (min)">
          <input
            className="input"
            type="number"
            inputMode="numeric"
            min={5}
            step={5}
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
          />
        </Field>
        <Field label="Precio">
          <input
            className="input"
            type="number"
            inputMode="decimal"
            min={0}
            step={10}
            value={price}
            onChange={(event) => setPrice(Number(event.target.value))}
          />
        </Field>
      </div>

      <div className="field">
        <span className="field-label">Color</span>
        <div className="swatches">
          {SERVICE_COLORS.map((option) => (
            <button
              key={option}
              type="button"
              className={`swatch${option === color ? ' active' : ''}`}
              style={{ background: option }}
              onClick={() => setColor(option)}
              aria-label={`Color ${option}`}
            />
          ))}
        </div>
      </div>

      <Field label="Descripción" hint="Opcional">
        <input
          className="input"
          placeholder="Detalles del trabajo"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>

      <label className="switch-row">
        <input
          type="checkbox"
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
        />
        <span className="switch" />
        <span>Disponible para agendar</span>
      </label>

      <Confirm
        open={confirmDelete}
        title="¿Eliminar este trabajo?"
        message="Las citas ya agendadas conservarán su historial."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (service) deleteService(service.id)
          setConfirmDelete(false)
          onClose()
        }}
      />
    </Sheet>
  )
}
