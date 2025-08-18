import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Member {
  id: string
  name: string
  email: string
  phone: string
  activity?: 'basketball' | 'volleyball' | 'karate' | 'gym' | 'socio' // 'socio' para miembros sin actividad específica
  status: 'active' | 'inactive'
  paymentStatus: 'paid' | 'pending' | 'overdue'
  registrationDate: string
  lastPaymentDate?: string
  nextPaymentDate?: string
  membershipType: 'socio' | 'jugador' // Nuevo campo para distinguir tipo de membresía
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
  sidebarCollapsed: boolean
  currentPage: string
  
  // Datos de miembros
  members: Member[]
  selectedMembers: string[]
  isLoading: boolean
  error: string | null
  
  // Estado de pagos
  paymentReminders: PaymentReminder[]
  remindersEnabled: boolean
  
  // Acciones
  toggleSidebar: () => void
  setCurrentPage: (page: string) => void
  setMembers: (members: Member[]) => void
  addMember: (member: Omit<Member, 'id'>) => void
  updateMember: (id: string, updates: Partial<Member>) => void
  deleteMember: (id: string) => void
  selectMember: (id: string) => void
  deselectMember: (id: string) => void
  selectAllMembers: () => void
  deselectAllMembers: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  toggleReminders: () => void
  addPaymentReminder: (reminder: Omit<PaymentReminder, 'id'>) => void
  markReminderSent: (id: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      sidebarCollapsed: false,
      currentPage: 'dashboard',
      members: [],
      selectedMembers: [],
      isLoading: false,
      error: null,
      paymentReminders: [],
      remindersEnabled: false,

      // Acciones
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      
      setCurrentPage: (page: string) => set({ currentPage: page }),
      
      setMembers: (members) => set({ members }),
      
      addMember: (member) => set((state) => ({
        members: [...state.members, { ...member, id: Date.now().toString() }]
      })),
      
      updateMember: (id, updates) => set((state) => ({
        members: state.members.map(member => 
          member.id === id ? { ...member, ...updates } : member
        )
      })),
      
      deleteMember: (id) => set((state) => ({
        members: state.members.filter(member => member.id !== id),
        selectedMembers: state.selectedMembers.filter(memberId => memberId !== id)
      })),
      
      selectMember: (id) => set((state) => ({
        selectedMembers: [...state.selectedMembers, id]
      })),
      
      deselectMember: (id) => set((state) => ({
        selectedMembers: state.selectedMembers.filter(memberId => memberId !== id)
      })),
      
      selectAllMembers: () => set((state) => ({
        selectedMembers: state.members.map(member => member.id)
      })),
      
      deselectAllMembers: () => set({ selectedMembers: [] }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      toggleReminders: () => set((state) => ({
        remindersEnabled: !state.remindersEnabled
      })),
      
      addPaymentReminder: (reminder) => set((state) => ({
        paymentReminders: [...state.paymentReminders, { ...reminder, id: Date.now().toString() }]
      })),
      
      markReminderSent: (id) => set((state) => ({
        paymentReminders: state.paymentReminders.map(reminder => 
          reminder.id === id 
            ? { ...reminder, sent: true, sentDate: new Date().toISOString() }
            : reminder
        )
      })),
    }),
    {
      name: 'cce-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        currentPage: state.currentPage,
        remindersEnabled: state.remindersEnabled,
      }),
    }
  )
)
