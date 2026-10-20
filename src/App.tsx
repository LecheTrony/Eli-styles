import { useEffect, useState } from 'react'
import { useStore } from './store'
import type { Appointment } from './types'
import { capitalize, formatDayLong, todayISO } from './lib/date'
import Today from './pages/Today'
import Calendar from './pages/Calendar'
import Services from './pages/Services'
import Clients from './pages/Clients'
import Settings from './pages/Settings'
import AppointmentForm from './components/AppointmentForm'
import {
  IconCalendar,
  IconClock,
  IconGear,
  IconHeart,
  IconPlus,
  IconScissors,
  IconUsers,
} from './components/icons'

type Tab = 'hoy' | 'calendario' | 'servicios' | 'clientes' | 'ajustes'

const TAB_SUBTITLE: Record<Tab, string> = {
  hoy: '',
  calendario: 'Calendario',
  servicios: 'Tipos de trabajo',
  clientes: 'Clientes',
  ajustes: 'Ajustes',
}

type FormState = {
  open: boolean
  appointment: Appointment | null
  date: string
  clientId?: string
}

export default function App() {
  const { db } = useStore()
  const [tab, setTab] = useState<Tab>('hoy')
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [form, setForm] = useState<FormState>({
    open: false,
    appointment: null,
    date: todayISO(),
  })

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [tab])

  const openNew = (date: string = todayISO(), clientId?: string) =>
    setForm({ open: true, appointment: null, date, clientId })

  const openEdit = (appointment: Appointment) =>
    setForm({ open: true, appointment, date: appointment.date, clientId: appointment.clientId })

  const closeForm = () => setForm((current) => ({ ...current, open: false }))

  const subtitle =
    tab === 'hoy' ? capitalize(formatDayLong(todayISO())) : TAB_SUBTITLE[tab]

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-badge">
            <IconHeart size={18} />
          </span>
          <div className="brand-text">
            <span className="brand-name">{db.settings.businessName || 'Eli-Styles'}</span>
            <span className="brand-sub">{subtitle}</span>
          </div>
        </div>
        {tab !== 'ajustes' && (
          <button
            type="button"
            className="icon-btn light"
            onClick={() => setTab('ajustes')}
            aria-label="Ajustes"
          >
            <IconGear size={21} />
          </button>
        )}
      </header>

      <main key={tab} className="content">
        {tab === 'hoy' && <Today onNew={openNew} onEdit={openEdit} />}
        {tab === 'calendario' && (
          <Calendar
            selected={selectedDate}
            onSelect={setSelectedDate}
            onNew={openNew}
            onEdit={openEdit}
          />
        )}
        {tab === 'servicios' && <Services />}
        {tab === 'clientes' && (
          <Clients onNewAppointment={(clientId) => openNew(todayISO(), clientId)} onEditAppointment={openEdit} />
        )}
        {tab === 'ajustes' && <Settings />}
      </main>

      <nav className="tabbar">
        <button
          type="button"
          className={`tab${tab === 'hoy' ? ' active' : ''}`}
          onClick={() => setTab('hoy')}
        >
          <IconClock size={22} />
          <span>Hoy</span>
        </button>
        <button
          type="button"
          className={`tab${tab === 'calendario' ? ' active' : ''}`}
          onClick={() => setTab('calendario')}
        >
          <IconCalendar size={22} />
          <span>Calendario</span>
        </button>
        <div className="tab-spacer">
          <button
            type="button"
            className="fab"
            aria-label="Nueva cita"
            onClick={() => openNew(tab === 'calendario' ? selectedDate : todayISO())}
          >
            <IconPlus size={27} />
          </button>
        </div>
        <button
          type="button"
          className={`tab${tab === 'servicios' ? ' active' : ''}`}
          onClick={() => setTab('servicios')}
        >
          <IconScissors size={22} />
          <span>Servicios</span>
        </button>
        <button
          type="button"
          className={`tab${tab === 'clientes' ? ' active' : ''}`}
          onClick={() => setTab('clientes')}
        >
          <IconUsers size={22} />
          <span>Clientes</span>
        </button>
      </nav>

      <AppointmentForm
        open={form.open}
        appointment={form.appointment}
        defaultDate={form.date}
        presetClientId={form.clientId}
        onClose={closeForm}
      />
    </div>
  )
}
