import { useRef, useState, type ChangeEvent } from 'react'
import { useStore } from '../store'
import { normalizeDB } from '../lib/db'
import { todayISO } from '../lib/date'
import Confirm from '../components/Confirm'
import { Field } from '../components/ui'
import { IconDownload, IconInfo, IconShare, IconTrash, IconUpload } from '../components/icons'

export default function Settings() {
  const { db, updateSettings, replaceDB, resetDB } = useStore()
  const { settings } = db
  const [message, setMessage] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function exportData() {
    const json = JSON.stringify(db, null, 2)
    const fileName = `eli-styles-copia-${todayISO()}.json`
    try {
      const file = new File([json], fileName, { type: 'application/json' })
      if (typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Copia de Eli-Styles' })
        setMessage('Copia lista para guardar.')
        return
      }
    } catch {
      return
    }
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage('Copia descargada.')
  }

  function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = normalizeDB(JSON.parse(String(reader.result)))
        if (!parsed) {
          setMessage('El archivo no parece una copia válida de Eli-Styles.')
          return
        }
        replaceDB(parsed)
        setMessage('Copia importada correctamente ✓')
      } catch {
        setMessage('No se pudo leer el archivo.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="page">
      {message && (
        <p className="notice" onClick={() => setMessage('')}>
          {message}
        </p>
      )}

      <h2 className="sec-title">El local</h2>
      <div className="panel">
        <Field label="Nombre del local">
          <input
            className="input"
            value={settings.businessName}
            onChange={(event) => updateSettings({ businessName: event.target.value })}
          />
        </Field>
        <Field label="Tu nombre" hint="Aparece en el saludo de la pantalla de inicio">
          <input
            className="input"
            placeholder="Ej. Eli"
            value={settings.ownerName}
            onChange={(event) => updateSettings({ ownerName: event.target.value })}
          />
        </Field>
        <Field label="Moneda" hint="Símbolo que se muestra en los precios">
          <input
            className="input"
            value={settings.currency}
            onChange={(event) => updateSettings({ currency: event.target.value })}
          />
        </Field>
      </div>

      <h2 className="sec-title">Horario de atención</h2>
      <div className="panel">
        <div className="grid-2">
          <Field label="Abre">
            <input
              className="input"
              type="time"
              value={settings.openTime}
              onChange={(event) => updateSettings({ openTime: event.target.value })}
            />
          </Field>
          <Field label="Cierra">
            <input
              className="input"
              type="time"
              value={settings.closeTime}
              onChange={(event) => updateSettings({ closeTime: event.target.value })}
            />
          </Field>
        </div>
        <Field label="Cada cuánto se puede agendar" hint="Intervalo entre horas disponibles">
          <select
            className="input"
            value={settings.slotIntervalMin}
            onChange={(event) => updateSettings({ slotIntervalMin: Number(event.target.value) })}
          >
            <option value={15}>Cada 15 minutos</option>
            <option value={20}>Cada 20 minutos</option>
            <option value={30}>Cada 30 minutos</option>
            <option value={45}>Cada 45 minutos</option>
            <option value={60}>Cada 60 minutos</option>
          </select>
        </Field>
      </div>

      <h2 className="sec-title">Copia de seguridad</h2>
      <div className="panel">
        <p className="muted small">
          Los datos se guardan solo en este iPhone. Exporta una copia de vez en cuando para no
          perderlos.
        </p>
        <div className="row">
          <button type="button" className="btn ghost" onClick={exportData}>
            <IconDownload size={18} /> Exportar
          </button>
          <button type="button" className="btn ghost" onClick={() => fileRef.current?.click()}>
            <IconUpload size={18} /> Importar
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={importFile}
        />
        <button type="button" className="btn danger-ghost block" onClick={() => setConfirmReset(true)}>
          <IconTrash size={18} /> Borrar todos los datos
        </button>
      </div>

      <h2 className="sec-title">Instalar en el iPhone</h2>
      <div className="panel">
        <p className="install-step">
          <IconShare size={18} />
          <span>
            1. Abre esta página en <strong>Safari</strong>.
          </span>
        </p>
        <p className="install-step">
          <IconShare size={18} />
          <span>
            2. Toca el botón <strong>Compartir</strong> (el cuadro con la flecha hacia arriba).
          </span>
        </p>
        <p className="install-step">
          <IconShare size={18} />
          <span>
            3. Elige <strong>«Añadir a pantalla de inicio»</strong>.
          </span>
        </p>
        <p className="muted small">
          <IconInfo size={15} /> Así se abre como una app normal, con su propio icono.
        </p>
      </div>

      <p className="foot-note">Eli-Styles · Agenda</p>

      <Confirm
        open={confirmReset}
        title="¿Borrar todos los datos?"
        message="Se eliminarán citas, clientes y trabajos. Exporta antes una copia si la necesitas."
        confirmLabel="Borrar todo"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDB()
          setConfirmReset(false)
          setMessage('Datos borrados.')
        }}
      />
    </div>
  )
}
