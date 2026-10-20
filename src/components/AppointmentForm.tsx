import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store'
import type { Appointment, AppointmentStatus, Client, Service } from '../types'
import { uid } from '../lib/id'
import {
  addDaysISO,
  formatDuration,
  initials,
  minutesToTime,
  timeToMinutes,
  todayISO,
} from '../lib/date'
import { buildSlots, firstFreeSlot } from '../lib/schedule'
import Sheet from './Sheet'
import Confirm from './Confirm'
import { Field, STATUS_LABELS, STATUS_ORDER } from './ui'
import { IconPlus, IconSearch } from './icons'

type Props = {
  open: boolean
  appointment: Appointment | null
  defaultDate: string
  presetClientId?: string
  onClose: () => void
}

export default function AppointmentForm({
  open,
  appointment,
  defaultDate,
  presetClientId,
  onClose,
}: Props) {
  const { db, saveAppointment, saveClient, deleteAppointment } = useStore()
  const { settings } = db

  const [clientId, setClientId] = useState('')
  const [clientQuery, setClientQuery] = useState('')
  const [quickAdd, setQuickAdd] = useState(false)
  const [quickName, setQuickName] = useState('')
  const [quickPhone, setQuickPhone] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(30)
  const [price, setPrice] = useState(0)
  const [status, setStatus] = useState<AppointmentStatus>('pendiente')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Al abrir, se rellena el formulario según la cita (o desde cero).
  useEffect(() => {
    if (!open) return
    const editingService = appointment
      ? db.services.find((service) => service.id === appointment.serviceId)
      : undefined
    const fallbackService = db.services.find((service) => service.active)
    const chosenService = editingService ?? fallbackService
    const initialDuration = appointment?.durationMin ?? chosenService?.durationMin ?? 30
    const initialDate = appointment?.date ?? defaultDate
    const initialTime = appointment?.time ?? ''

    setClientId(appointment?.clientId ?? presetClientId ?? '')
    setClientQuery('')
    setQuickAdd(false)
    setQuickName('')
    setQuickPhone('')
    setServiceId(chosenService?.id ?? '')
    setDate(initialDate)
    setDuration(initialDuration)
    setPrice(appointment?.price ?? chosenService?.price ?? 0)
    setStatus(appointment?.status ?? 'pendiente')
    setNotes(appointment?.notes ?? '')
    setError('')
    setConfirmDelete(false)

    if (initialTime) {
      setTime(initialTime)
    } else {
      const busy = db.appointments
        .filter((item) => item.date === initialDate && item.status !== 'cancelada')
        .map((item) => ({ time: item.time, durationMin: item.durationMin }))
      setTime(
        firstFreeSlot(
          buildSlots({
            date: initialDate,
            durationMin: initialDuration,
            openTime: settings.openTime,
            closeTime: settings.closeTime,
            intervalMin: settings.slotIntervalMin,
            busy,
          })
        )
      )
    }
    // Solo al abrir el formulario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const busy = useMemo(
    () =>
      db.appointments
        .filter(
          (item) =>
            item.date === date && item.id !== appointment?.id && item.status !== 'cancelada'
        )
        .map((item) => ({ time: item.time, durationMin: item.durationMin })),
    [db.appointments, date, appointment]
  )

  const slots = useMemo(
    () =>
      buildSlots({
        date,
        durationMin: duration,
        openTime: settings.openTime,
        closeTime: settings.closeTime,
        intervalMin: settings.slotIntervalMin,
        busy,
      }),
    [date, duration, settings.openTime, settings.closeTime, settings.slotIntervalMin, busy]
  )

  const slotList = useMemo(() => {
    if (time && !slots.some((slot) => slot.time === time)) {
      return [...slots, { time, free: true }].sort(
        (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
      )
    }
    return slots
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, time])

  const selectedClient = db.clients.find((client) => client.id === clientId)
  const snapshotName =
    appointment && appointment.clientId === clientId ? appointment.clientName : ''
  const pickedName = selectedClient?.name ?? snapshotName
  const pickedPhone = selectedClient?.phone ?? (snapshotName ? appointment?.clientPhone : '') ?? ''

  const serviceOptions = useMemo(() => {
    const actives = db.services.filter((service) => service.active)
    const editing = appointment
      ? db.services.find((service) => service.id === appointment.serviceId)
      : undefined
    if (editing && !editing.active && !actives.some((service) => service.id === editing.id)) {
      return [editing, ...actives]
    }
    return actives
  }, [db.services, appointment])

  const query = clientQuery.trim().toLowerCase()
  const results = query
    ? db.clients.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.phone.replace(/\s/g, '').includes(query.replace(/\s/g, ''))
      )
    : db.clients.slice(0, 8)

  function nextTime(nextDate: string, nextDuration: number, currentTime: string): string {
    const busyNext = db.appointments
      .filter(
        (item) =>
          item.date === nextDate && item.id !== appointment?.id && item.status !== 'cancelada'
      )
      .map((item) => ({ time: item.time, durationMin: item.durationMin }))
    const nextSlots = buildSlots({
      date: nextDate,
      durationMin: nextDuration,
      openTime: settings.openTime,
      closeTime: settings.closeTime,
      intervalMin: settings.slotIntervalMin,
      busy: busyNext,
    })
    if (!currentTime) return firstFreeSlot(nextSlots)
    const start = timeToMinutes(currentTime)
    const endsInTime = start + nextDuration <= timeToMinutes(settings.closeTime)
    const conflict = busyNext.some((item) => {
      const itemStart = timeToMinutes(item.time)
      const itemEnd = itemStart + item.durationMin
      return start < itemEnd && itemStart < start + nextDuration
    })
    if (endsInTime && !conflict) return currentTime
    return firstFreeSlot(nextSlots)
  }

  function changeDate(nextDate: string) {
    setDate(nextDate)
    setTime((current) => nextTime(nextDate, duration, current))
  }

  function chooseService(service: Service) {
    setServiceId(service.id)
    setDuration(service.durationMin)
    setPrice(service.price)
    setTime((current) => nextTime(date, service.durationMin, current))
  }

  function changeDuration(value: number) {
    const next = Number.isFinite(value) ? Math.max(5, value) : 5
    setDuration(next)
    setTime((current) => nextTime(date, next, current))
  }

  function createClient() {
    if (!quickName.trim() || !quickPhone.trim()) {
      setError('Pon el nombre y el teléfono del cliente.')
      return
    }
    const client: Client = {
      id: uid(),
      name: quickName.trim(),
      phone: quickPhone.trim(),
      email: '',
      notes: '',
      createdAt: new Date().toISOString(),
    }
    saveClient(client)
    setClientId(client.id)
    setQuickAdd(false)
    setQuickName('')
    setQuickPhone('')
    setError('')
  }

  function save() {
    if (!clientId || !pickedName) {
      setError('Elige un cliente o crea uno nuevo.')
      return
    }
    if (!serviceId) {
      setError('Elige el tipo de trabajo.')
      return
    }
    if (!date) {
      setError('Elige la fecha de la cita.')
      return
    }
    if (!time) {
      setError('Elige la hora de la cita.')
      return
    }
    const service = db.services.find((item) => item.id === serviceId)
    const client = db.clients.find((item) => item.id === clientId)
    const data: Appointment = {
      id: appointment?.id ?? uid(),
      clientId,
      serviceId,
      date,
      time,
      durationMin: duration,
      price,
      status,
      notes: notes.trim(),
      clientName: client?.name ?? pickedName,
      clientPhone: client?.phone ?? pickedPhone,
      serviceName: service?.name ?? appointment?.serviceName ?? '',
      createdAt: appointment?.createdAt ?? new Date().toISOString(),
    }
    saveAppointment(data)
    onClose()
  }

  return (
    <Sheet
      open={open}
      title={appointment ? 'Editar cita' : 'Nueva cita'}
      onClose={onClose}
      footer={
        <div className="sheet-actions">
          {appointment && (
            <button
              type="button"
              className="btn danger-ghost"
              onClick={() => setConfirmDelete(true)}
            >
              Eliminar
            </button>
          )}
          <button type="button" className="btn primary block" onClick={save}>
            Guardar cita
          </button>
        </div>
      }
    >
      {error && <p className="alert">{error}</p>}

      <section className="form-block">
        <h3 className="form-title">Cliente</h3>
        {clientId && pickedName ? (
          <div className="client-picked">
            <span className="avatar">{initials(pickedName)}</span>
            <div className="client-picked-info">
              <strong>{pickedName}</strong>
              <span>{pickedPhone || 'Sin teléfono'}</span>
            </div>
            <button type="button" className="btn ghost sm" onClick={() => setClientId('')}>
              Cambiar
            </button>
          </div>
        ) : (
          <>
            <div className="search">
              <IconSearch size={18} />
              <input
                className="input"
                placeholder="Buscar por nombre o teléfono"
                value={clientQuery}
                onChange={(event) => setClientQuery(event.target.value)}
              />
            </div>
            {results.length > 0 && (
              <div className="pick-list">
                {results.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    className="pick-item"
                    onClick={() => {
                      setClientId(client.id)
                      setClientQuery('')
                      setError('')
                    }}
                  >
                    <span className="avatar sm">{initials(client.name)}</span>
                    <span className="pick-text">
                      <strong>{client.name}</strong>
                      <span>{client.phone}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            {query && results.length === 0 && (
              <p className="muted small">No hay clientes que coincidan.</p>
            )}
            {quickAdd ? (
              <div className="quick-add">
                <input
                  className="input"
                  placeholder="Nombre y apellidos *"
                  value={quickName}
                  onChange={(event) => setQuickName(event.target.value)}
                />
                <input
                  className="input"
                  placeholder="Teléfono *"
                  inputMode="tel"
                  value={quickPhone}
                  onChange={(event) => setQuickPhone(event.target.value)}
                />
                <div className="row">
                  <button type="button" className="btn ghost" onClick={() => setQuickAdd(false)}>
                    Cancelar
                  </button>
                  <button type="button" className="btn primary" onClick={createClient}>
                    Crear y elegir
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="btn ghost block"
                onClick={() => setQuickAdd(true)}
              >
                <IconPlus size={18} /> Cliente nuevo
              </button>
            )}
          </>
        )}
      </section>

      <section className="form-block">
        <h3 className="form-title">Tipo de trabajo</h3>
        {serviceOptions.length === 0 ? (
          <p className="muted small">
            No tienes trabajos activos. Añádelos en la pestaña «Servicios».
          </p>
        ) : (
          <div className="chips">
            {serviceOptions.map((service) => (
              <button
                key={service.id}
                type="button"
                className={`chip${service.id === serviceId ? ' active' : ''}`}
                onClick={() => chooseService(service)}
              >
                <span className="dot" style={{ background: service.color }} />
                {service.name}
              </button>
            ))}
          </div>
        )}
        <div className="grid-2">
          <Field label="Duración (min)">
            <input
              className="input"
              type="number"
              inputMode="numeric"
              min={5}
              step={5}
              value={duration}
              onChange={(event) => changeDuration(Number(event.target.value))}
            />
          </Field>
          <Field label={`Precio (${settings.currency})`}>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              min={0}
              step={10}
              value={price}
              onChange={(event) => setPrice(Number(event.target.value) || 0)}
            />
          </Field>
        </div>
      </section>

      <section className="form-block">
        <h3 className="form-title">Fecha y hora</h3>
        <input
          className="input"
          type="date"
          value={date}
          onChange={(event) => changeDate(event.target.value)}
        />
        <div className="quick-row">
          <button
            type="button"
            className={`pill${date === todayISO() ? ' active' : ''}`}
            onClick={() => changeDate(todayISO())}
          >
            Hoy
          </button>
          <button
            type="button"
            className={`pill${date === addDaysISO(todayISO(), 1) ? ' active' : ''}`}
            onClick={() => changeDate(addDaysISO(todayISO(), 1))}
          >
            Mañana
          </button>
        </div>
        <div className="field">
          <span className="field-label">
            Hora · {formatDuration(duration)} · cierra {settings.closeTime}
          </span>
          <div className="slots">
            {slotList.map((slot) => (
              <button
                key={slot.time}
                type="button"
                className={`slot${slot.time === time ? ' active' : ''}`}
                disabled={!slot.free && slot.time !== time}
                onClick={() => setTime(slot.time)}
              >
                {slot.time}
              </button>
            ))}
            {slotList.length === 0 && (
              <p className="muted small">
                No caben citas de {formatDuration(duration)} en tu horario.
              </p>
            )}
          </div>
        </div>
        <Field
          label="Otra hora (manual)"
          hint={
            time
              ? `Termina a las ${minutesToTime(timeToMinutes(time) + duration)}`
              : 'Elige una hora de la lista o escríbela aquí'
          }
        >
          <input
            className="input"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />
        </Field>
      </section>

      <section className="form-block">
        <h3 className="form-title">Estado</h3>
        <div className="seg">
          {STATUS_ORDER.map((option) => (
            <button
              key={option}
              type="button"
              className={status === option ? 'active' : ''}
              onClick={() => setStatus(option)}
            >
              {STATUS_LABELS[option]}
            </button>
          ))}
        </div>
      </section>

      <section className="form-block">
        <h3 className="form-title">Notas</h3>
        <textarea
          className="input"
          rows={3}
          placeholder="Observaciones, preferencias, referencias…"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </section>

      <Confirm
        open={confirmDelete}
        title="¿Eliminar esta cita?"
        message="Esta acción no se puede deshacer."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (appointment) deleteAppointment(appointment.id)
          setConfirmDelete(false)
          onClose()
        }}
      />
    </Sheet>
  )
}
