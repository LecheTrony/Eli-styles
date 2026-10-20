/* Prueba de humo temporal: renderiza cada página en Node para detectar
   errores de ejecución. Se elimina después de verificar. */
import { JSDOM } from 'jsdom'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { StoreProvider } from '../src/store'
import App from '../src/App'
import Today from '../src/pages/Today'
import Calendar from '../src/pages/Calendar'
import Services from '../src/pages/Services'
import Clients from '../src/pages/Clients'
import Settings from '../src/pages/Settings'
import { buildSlots, firstFreeSlot } from '../src/lib/schedule'
import { monthCells, timeToMinutes } from '../src/lib/date'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'https://localhost/',
})
const g = globalThis as unknown as Record<string, unknown>
function setGlobal(key: string, value: unknown) {
  try {
    g[key] = value
  } catch {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true })
  }
}
setGlobal('window', dom.window)
setGlobal('document', dom.window.document)
setGlobal('navigator', dom.window.navigator)
setGlobal('localStorage', dom.window.localStorage)
setGlobal('HTMLElement', dom.window.HTMLElement)
setGlobal('File', dom.window.File)
setGlobal('FileReader', dom.window.FileReader)
setGlobal('Blob', dom.window.Blob)

const now = new Date()
const pad = (n: number) => String(n).padStart(2, '0')
const iso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
const stamp = now.toISOString()

const db = {
  version: 1,
  settings: {
    businessName: 'Eli-Styles',
    ownerName: 'Eli',
    openTime: '09:00',
    closeTime: '19:00',
    slotIntervalMin: 30,
    currency: '$',
  },
  services: [
    { id: 's1', name: 'Corte', durationMin: 45, price: 350, color: '#ff4d94', description: '', active: true },
    { id: 's2', name: 'Manicure', durationMin: 60, price: 400, color: '#14b8a6', description: 'Con esmaltado', active: false },
  ],
  clients: [
    { id: 'c1', name: 'Cliente de prueba', phone: '000 000 000', email: 'prueba@ejemplo.com', notes: 'Nota de ejemplo', createdAt: stamp },
  ],
  appointments: [
    {
      id: 'a1', clientId: 'c1', serviceId: 's1', date: iso, time: '10:00',
      durationMin: 45, price: 350, status: 'confirmada', notes: '',
      clientName: 'Cliente de prueba', clientPhone: '000 000 000', serviceName: 'Corte', createdAt: stamp,
    },
    {
      id: 'a2', clientId: 'c1', serviceId: 's2', date: iso, time: '12:30',
      durationMin: 60, price: 400, status: 'pendiente', notes: '',
      clientName: 'Cliente de prueba', clientPhone: '000 000 000', serviceName: 'Manicure', createdAt: stamp,
    },
  ],
}
dom.window.localStorage.setItem('eli-styles-db-v1', JSON.stringify(db))

let failures = 0

function render(label: string, node: React.ReactElement) {
  try {
    const html = renderToString(React.createElement(StoreProvider, null, node))
    const hasError = /algo salió mal/i.test(html)
    console.log(`${hasError ? '✗' : '✓'} ${label} (${html.length} caracteres)`)
    if (hasError) failures++
  } catch (error) {
    failures++
    console.error(`✗ ${label}`)
    console.error(error)
  }
}

render('App (pestaña Hoy)', React.createElement(App))
render('Hoy', React.createElement(Today, { onNew: () => {}, onEdit: () => {} }))
render(
  'Calendario',
  React.createElement(Calendar, { selected: iso, onSelect: () => {}, onNew: () => {}, onEdit: () => {} })
)
render('Servicios', React.createElement(Services))
render('Clientes', React.createElement(Clients, { onNewAppointment: () => {}, onEditAppointment: () => {} }))
render('Ajustes', React.createElement(Settings))

// --- lógica de horarios: no debe permitir citas solapadas ---
function check(label: string, condition: boolean) {
  console.log(`${condition ? '✓' : '✗'} ${label}`)
  if (!condition) failures++
}

const slots = buildSlots({
  date: iso,
  durationMin: 30,
  openTime: '09:00',
  closeTime: '19:00',
  intervalMin: 30,
  busy: [{ time: '10:00', durationMin: 45 }],
})
const isFree = (t: string) => slots.find((slot) => slot.time === t)?.free

check('09:30 sigue libre (termina justo al empezar la cita)', isFree('09:30') === true)
check('10:00 ocupada por la cita', isFree('10:00') === false)
check('10:30 ocupada (la cita dura hasta 10:45)', isFree('10:30') === false)
check('11:00 vuelve a estar libre', isFree('11:00') === true)
check('primera hora libre es 09:00', firstFreeSlot(slots) === '09:00')
check(
  'ninguna hora termina después del cierre',
  slots.every((slot) => timeToMinutes(slot.time) + 30 <= timeToMinutes('19:00'))
)

const cells = monthCells(2026, 9)
check('el calendario completa semanas enteras', cells.length % 7 === 0)
check('el calendario contiene días del mes', cells.some((cell) => cell.iso === '2026-10-16'))

if (failures > 0) {
  process.exitCode = 1
} else {
  console.log('\nTodas las vistas se renderizaron sin errores.')
}
