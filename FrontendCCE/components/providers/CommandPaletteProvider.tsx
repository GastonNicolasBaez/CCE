'use client'

import React, { createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { useCommandPalette, CommandItem } from '@/components/ui'
import {
  LayoutDashboard,
  Users,
  Activity,
  CreditCard,
  Settings,
  BarChart3,
  UserPlus,
  DollarSign,
  FileText,
  Calendar,
  LogOut
} from 'lucide-react'

interface CommandPaletteContextType {
  open: () => void
  close: () => void
  toggle: () => void
}

const CommandPaletteContext = createContext<CommandPaletteContextType | null>(null)

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const commands: CommandItem[] = [
    // Navegación
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      description: 'Ir al panel principal',
      icon: LayoutDashboard,
      keywords: ['inicio', 'home', 'panel'],
      shortcut: '⌘D',
      onSelect: () => router.push('/dashboard')
    },
    {
      id: 'nav-members',
      label: 'Socios',
      description: 'Ver listado de socios',
      icon: Users,
      keywords: ['miembros', 'usuarios', 'list'],
      onSelect: () => router.push('/members')
    },
    {
      id: 'nav-activities',
      label: 'Actividades',
      description: 'Gestionar actividades deportivas',
      icon: Activity,
      keywords: ['deportes', 'sports'],
      onSelect: () => router.push('/actividades')
    },
    {
      id: 'nav-payments',
      label: 'Pagos',
      description: 'Gestión de pagos y cuotas',
      icon: CreditCard,
      keywords: ['cuotas', 'cobros', 'ingresos'],
      onSelect: () => router.push('/payments')
    },
    {
      id: 'nav-stats',
      label: 'Estadísticas',
      description: 'Ver estadísticas y reportes',
      icon: BarChart3,
      keywords: ['reportes', 'análisis', 'datos'],
      onSelect: () => router.push('/estadisticas')
    },
    {
      id: 'nav-config',
      label: 'Configuración',
      description: 'Ajustes del sistema',
      icon: Settings,
      keywords: ['settings', 'ajustes', 'preferencias'],
      shortcut: '⌘,',
      onSelect: () => router.push('/configuracion')
    },

    // Acciones Rápidas
    {
      id: 'action-new-member',
      label: 'Nuevo Socio',
      description: 'Registrar un nuevo socio',
      icon: UserPlus,
      keywords: ['crear', 'agregar', 'inscribir', 'registrar'],
      shortcut: '⌘N',
      onSelect: () => router.push('/members/new')
    },
    {
      id: 'action-new-payment',
      label: 'Registrar Pago',
      description: 'Registrar un pago de cuota',
      icon: DollarSign,
      keywords: ['cobrar', 'cuota', 'ingreso'],
      shortcut: '⌘P',
      onSelect: () => router.push('/payments/new')
    },
    {
      id: 'action-new-activity',
      label: 'Nueva Actividad',
      description: 'Crear una nueva actividad deportiva',
      icon: Activity,
      keywords: ['deporte', 'crear'],
      onSelect: () => router.push('/actividades')
    },
    {
      id: 'action-export',
      label: 'Exportar Datos',
      description: 'Descargar reporte en Excel/CSV',
      icon: FileText,
      keywords: ['descargar', 'excel', 'csv', 'reporte'],
      onSelect: () => {
        // TODO: Implementar export
        console.log('Export triggered from command palette')
      }
    },
    {
      id: 'action-reminders',
      label: 'Enviar Recordatorios',
      description: 'Enviar recordatorios de pago',
      icon: Calendar,
      keywords: ['notificaciones', 'emails', 'avisos'],
      onSelect: () => {
        // TODO: Implementar reminders
        console.log('Reminders triggered from command palette')
      }
    },

    // Sistema
    {
      id: 'system-logout',
      label: 'Cerrar Sesión',
      description: 'Salir del sistema',
      icon: LogOut,
      keywords: ['salir', 'logout', 'exit'],
      onSelect: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      }
    }
  ]

  const { isOpen, open, close, toggle, CommandPaletteComponent } = useCommandPalette(commands)

  return (
    <CommandPaletteContext.Provider value={{ open, close, toggle }}>
      {CommandPaletteComponent}
      {children}
    </CommandPaletteContext.Provider>
  )
}

export function useCommandPaletteContext() {
  const context = useContext(CommandPaletteContext)
  if (!context) {
    throw new Error('useCommandPaletteContext must be used within CommandPaletteProvider')
  }
  return context
}
