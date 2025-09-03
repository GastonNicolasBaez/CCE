import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos para TypeScript
export interface Member {
  id: number
  nombre: string
  apellido: string
  dni: string
  fecha_nacimiento: string
  telefono: string
  email: string
  actividad: 'Basquet' | 'Voley' | 'Karate' | 'Gimnasio' | 'Socio'
  es_jugador: boolean
  estado: 'Activo' | 'Inactivo' | 'Suspendido'
  fecha_ingreso: string
  created_at?: string
  updated_at?: string
}

export interface Cuota {
  id: number
  socio_id: number
  monto: number
  fecha_vencimiento: string
  fecha_pago?: string
  estado: 'Pendiente' | 'Pagada' | 'Vencida' | 'Anulada'
  metodo_pago?: 'Efectivo' | 'Transferencia' | 'MercadoPago' | 'Tarjeta'
  numero_recibo?: string
  mercado_pago_id?: string
  link_pago?: string
  periodo: string
  created_at?: string
  updated_at?: string
}