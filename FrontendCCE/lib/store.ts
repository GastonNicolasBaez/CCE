import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Tenant } from './auth'
import { auth as authService } from './auth'

export interface Member {
  id: string
  name: string
  email: string
  phone: string
  activity?: 'basketball' | 'volleyball' | 'karate' | 'gym' | 'solo-socio' // DEPRECATED: Use activities instead
  activities?: string[] // Array de nombres de actividades (ej: ["Básquet", "Gimnasio"])
  status: 'active' | 'inactive' | 'suspended' // Estados consistentes con backend
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'cancelled' // Estados de cuotas consistentes
  registrationDate: string
  lastPaymentDate?: string
  nextPaymentDate?: string
  membershipType: 'socio' | 'jugador' // Tipo de membresía
}

export interface PaymentReminder {
  id: string
  memberId: string
  memberName: string
  activity: string
  dueDate: string
  amount: number
  sent: boolean
  sentDate?: string
}

interface AppState {
  // Estado de la aplicación
  currentPage: string
  sidebarCollapsed: boolean
  darkMode: boolean

  // Autenticación
  user: User | null
  tenant: Tenant | null
  isAuthenticated: boolean

  // Miembros
  members: Member[]
  selectedMembers: string[]
  isLoading: boolean
  error: string | null

  // Recordatorios de pago
  paymentReminders: PaymentReminder[]

  // Acciones
  setCurrentPage: (page: string) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleDarkMode: () => void

  // Acciones de autenticación
  setAuth: (user: User, tenant: Tenant) => void
  clearAuth: () => void
  initAuth: () => void

  // Acciones de miembros
  setMembers: (members: Member[]) => void
  addMember: (member: Omit<Member, 'id'>) => void
  updateMember: (id: string, updates: Partial<Member>) => void
  removeMember: (id: string) => void
  toggleMemberSelection: (id: string) => void
  clearSelectedMembers: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Acciones de recordatorios
  addPaymentReminder: (reminder: Omit<PaymentReminder, 'id'>) => void
  markReminderAsSent: (id: string) => void
  removePaymentReminder: (id: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Estado inicial
      currentPage: 'dashboard',
      sidebarCollapsed: false,
      darkMode: false,
      user: null,
      tenant: null,
      isAuthenticated: false,
      members: [],
      selectedMembers: [],
      isLoading: false,
      error: null,
      paymentReminders: [],

      // Acciones de la aplicación
      setCurrentPage: (page) => set({ currentPage: page }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      // Acciones de autenticación
      setAuth: (user, tenant) => set({ user, tenant, isAuthenticated: true }),
      clearAuth: () => set({ user: null, tenant: null, isAuthenticated: false }),
      initAuth: () => {
        // Initialize auth from localStorage on app start
        const user = authService.getUser()
        const tenant = authService.getTenant()
        const isAuthenticated = authService.isAuthenticated()

        set({ user, tenant, isAuthenticated })
      },
      
      // Acciones de miembros
      setMembers: (members) => set({ members }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      addMember: (memberData) => {
        const member: Member = {
          id: crypto.randomUUID(),
          ...memberData,
        }
        set((state) => ({
          members: [...state.members, member],
        }))
      },
      
      updateMember: (id, updates) => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === id ? { ...member, ...updates } : member
          ),
        }))
      },
      
      removeMember: (id) => {
        set((state) => ({
          members: state.members.filter((member) => member.id !== id),
          selectedMembers: state.selectedMembers.filter((memberId) => memberId !== id),
        }))
      },
      
      toggleMemberSelection: (id) => {
        set((state) => ({
          selectedMembers: state.selectedMembers.includes(id)
            ? state.selectedMembers.filter((memberId) => memberId !== id)
            : [...state.selectedMembers, id],
        }))
      },
      
      clearSelectedMembers: () => set({ selectedMembers: [] }),
      
      // Acciones de recordatorios
      addPaymentReminder: (reminderData) => {
        const reminder: PaymentReminder = {
          id: crypto.randomUUID(),
          ...reminderData,
        }
        set((state) => ({
          paymentReminders: [...state.paymentReminders, reminder],
        }))
      },
      
      markReminderAsSent: (id) => {
        set((state) => ({
          paymentReminders: state.paymentReminders.map((reminder) =>
            reminder.id === id
              ? { ...reminder, sent: true, sentDate: new Date().toISOString() }
              : reminder
          ),
        }))
      },
      
      removePaymentReminder: (id) => {
        set((state) => ({
          paymentReminders: state.paymentReminders.filter(
            (reminder) => reminder.id !== id
          ),
        }))
      },
    }),
    {
      name: 'club-espora-storage',
    }
  )
)