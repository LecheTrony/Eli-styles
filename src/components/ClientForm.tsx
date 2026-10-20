import { useEffect, useState } from 'react'
import { useStore } from '../store'
import type { Client } from '../types'
import { uid } from '../lib/id'
import Sheet from './Sheet'
import Confirm from './Confirm'
import { Field } from './ui'

type Props = {
  open: boolean
  client: Client | null
  onClose: () => void
}

export default function ClientForm({ open, client, onClose }: Props) {
  const { saveClient, deleteClient } = useStore()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(client?.name ?? '')
    setPhone(client?.phone ?? '')
    setEmail(client?.email ?? '')
    setNotes(client?.notes ?? '')
    setError('')
    setConfirmDelete(false)
  }, [open, client])

  function save() {
    if (!name.trim()) {
      setError('Pon el nombre del cliente.')
      return
    }
    if (!phone.trim()) {
      setError('Pon el teléfono del cliente.')
      return
    }
    saveClient({
      id: client?.id ?? uid(),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim(),
      createdAt: client?.createdAt ?? new Date().toISOString(),
    })
    onClose()
  }

  return (
    <Sheet
      open={open}
      title={client ? 'Editar cliente' : 'Nuevo cliente'}
      onClose={onClose}
      footer={
        <div className="sheet-actions">
          {client && (
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

      <Field label="Nombre y apellidos *">
        <input
          className="input"
          placeholder="Ej. María López"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>

      <Field label="Teléfono / WhatsApp *">
        <input
          className="input"
          inputMode="tel"
          placeholder="Ej. 600 123 456"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </Field>

      <Field label="Email" hint="Opcional">
        <input
          className="input"
          type="email"
          inputMode="email"
          placeholder="cliente@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>

      <Field label="Notas" hint="Alergias, preferencias, cómo llegó, etc.">
        <textarea
          className="input"
          rows={3}
          placeholder="Ej. Prefiere tonos fríos"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </Field>

      <Confirm
        open={confirmDelete}
        title="¿Eliminar este cliente?"
        message="Sus citas seguirán apareciendo en la agenda."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (client) deleteClient(client.id)
          setConfirmDelete(false)
          onClose()
        }}
      />
    </Sheet>
  )
}
