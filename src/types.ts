export type Service = {
  id: string
  name: string
  durationMin: number
  price: number
  color: string
  description: string
  active: boolean
}

export type Client = {
  id: string
  name: string
  phone: string
  email: string
  notes: string
  createdAt: string
}

export type AppointmentStatus = 'pendiente' | 'confirmada' | 'completada' | 'cancelada'

export type Appointment = {
  id: string
  clientId: string
  serviceId: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  durationMin: number
  price: number
  status: AppointmentStatus
  notes: string
  // Fotos de los datos al momento de agendar, para que el historial
  // se mantenga aunque luego se borre el cliente o el trabajo.
  clientName: string
  clientPhone: string
  serviceName: string
  createdAt: string
}

export type Settings = {
  businessName: string
  ownerName: string
  openTime: string
  closeTime: string
  slotIntervalMin: number
  currency: string
}

export type DB = {
  version: number
  services: Service[]
  clients: Client[]
  appointments: Appointment[]
  settings: Settings
}
