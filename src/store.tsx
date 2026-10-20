import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Appointment, AppointmentStatus, Client, DB, Service, Settings } from './types'
import { freshDB, loadDB, saveDB } from './lib/db'

type StoreValue = {
  db: DB
  saveService: (service: Service) => void
  deleteService: (id: string) => void
  saveClient: (client: Client) => void
  deleteClient: (id: string) => void
  saveAppointment: (appointment: Appointment) => void
  deleteAppointment: (id: string) => void
  setAppointmentStatus: (id: string, status: AppointmentStatus) => void
  updateSettings: (patch: Partial<Settings>) => void
  replaceDB: (next: DB) => void
  resetDB: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const index = list.findIndex((entry) => entry.id === item.id)
  if (index === -1) return [...list, item]
  const copy = [...list]
  copy[index] = item
  return copy
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(() => loadDB())

  useEffect(() => {
    saveDB(db)
  }, [db])

  const value = useMemo<StoreValue>(
    () => ({
      db,
      saveService: (service) =>
        setDb((current) => ({ ...current, services: upsert(current.services, service) })),
      deleteService: (id) =>
        setDb((current) => ({
          ...current,
          services: current.services.filter((service) => service.id !== id),
        })),
      saveClient: (client) =>
        setDb((current) => ({ ...current, clients: upsert(current.clients, client) })),
      deleteClient: (id) =>
        setDb((current) => ({
          ...current,
          clients: current.clients.filter((client) => client.id !== id),
        })),
      saveAppointment: (appointment) =>
        setDb((current) => ({
          ...current,
          appointments: upsert(current.appointments, appointment),
        })),
      deleteAppointment: (id) =>
        setDb((current) => ({
          ...current,
          appointments: current.appointments.filter((appointment) => appointment.id !== id),
        })),
      setAppointmentStatus: (id, status) =>
        setDb((current) => ({
          ...current,
          appointments: current.appointments.map((appointment) =>
            appointment.id === id ? { ...appointment, status } : appointment
          ),
        })),
      updateSettings: (patch) =>
        setDb((current) => ({ ...current, settings: { ...current.settings, ...patch } })),
      replaceDB: (next) => setDb(next),
      resetDB: () => setDb(freshDB()),
    }),
    [db]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore debe usarse dentro de StoreProvider')
  return context
}
