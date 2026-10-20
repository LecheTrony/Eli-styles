import type { DB, Service, Settings } from '../types'
import { uid } from './id'

const KEY = 'eli-styles-db-v1'

export const SERVICE_COLORS = [
  '#ff4d94',
  '#f472b6',
  '#a855f7',
  '#3f8efc',
  '#14b8a6',
  '#f5a623',
  '#2fb479',
  '#ef476f',
]

export const DEFAULT_SETTINGS: Settings = {
  businessName: 'Eli-Styles',
  ownerName: '',
  openTime: '09:00',
  closeTime: '19:00',
  slotIntervalMin: 30,
  currency: '$',
}

/** Trabajos de ejemplo: la dueña puede editarlos o borrarlos. */
function seedServices(): Service[] {
  const example: Array<[string, number, number, string, string]> = [
    ['Corte de cabello', 45, 350, SERVICE_COLORS[0], 'Corte y lavado'],
    ['Peinado', 30, 250, SERVICE_COLORS[2], 'Brushing o recogido'],
    ['Coloración', 90, 700, SERVICE_COLORS[3], 'Tinte y matización'],
    ['Manicure', 60, 400, SERVICE_COLORS[4], ''],
    ['Tratamiento', 40, 300, SERVICE_COLORS[5], 'Hidratación'],
  ]
  return example.map(([name, durationMin, price, color, description]) => ({
    id: uid(),
    name,
    durationMin,
    price,
    color,
    description,
    active: true,
  }))
}

export function freshDB(): DB {
  return {
    version: 1,
    services: seedServices(),
    clients: [],
    appointments: [],
    settings: { ...DEFAULT_SETTINGS },
  }
}

/** Normaliza cualquier objeto importado o guardado a un DB válido. */
export function normalizeDB(input: unknown): DB | null {
  if (!input || typeof input !== 'object') return null
  const raw = input as Partial<DB>
  if (!Array.isArray(raw.services) || !Array.isArray(raw.clients) || !Array.isArray(raw.appointments)) {
    return null
  }
  return {
    version: 1,
    services: raw.services,
    clients: raw.clients,
    appointments: raw.appointments,
    settings: { ...DEFAULT_SETTINGS, ...(raw.settings ?? {}) },
  }
}

export function loadDB(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = normalizeDB(JSON.parse(raw))
      if (parsed) return parsed
    }
  } catch {
    // datos corruptos: se empieza de cero
  }
  return freshDB()
}

export function saveDB(db: DB): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    // sin espacio: se ignora para no romper la app
  }
}
