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
  
  // Estado de pagos
  paymentReminders: PaymentReminder[]
  remindersEnabled: boolean
  
  // Acciones
  toggleSidebar: () => void
  setCurrentPage: (page: string) => void
  addMember: (member: Omit<Member, 'id'>) => void
  updateMember: (id: string, updates: Partial<Member>) => void
  deleteMember: (id: string) => void
  selectMember: (id: string) => void
  deselectMember: (id: string) => void
  selectAllMembers: () => void
  deselectAllMembers: () => void
  toggleReminders: () => void
  addPaymentReminder: (reminder: Omit<PaymentReminder, 'id'>) => void
  markReminderSent: (id: string) => void
}

export const useAppStore = create<AppState>()((set, get) => ({
      // Estado inicial
      sidebarCollapsed: false,
      currentPage: 'dashboard',
      members: [
        // Básquet - 8 miembros
        {
          id: '1',
          name: 'Juan Pérez',
          email: 'juan.perez@email.com',
          phone: '+54 11 1234-5678',
          activity: 'basketball',
          status: 'active',
          paymentStatus: 'paid',
          registrationDate: '2024-01-15',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'jugador'
        },
        {
          id: '2',
          name: 'María González',
          email: 'maria.gonzalez@email.com',
          phone: '+54 11 2345-6789',
          activity: 'basketball',
          status: 'active',
          paymentStatus: 'paid',
          registrationDate: '2024-01-10',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'jugador'
        },
        {
          id: '3',
          name: 'Carlos Rodríguez',
          email: 'carlos.rodriguez@email.com',
          phone: '+54 11 3456-7890',
          activity: 'basketball',
          status: 'active',
          paymentStatus: 'pending',
          registrationDate: '2024-01-20',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'jugador'
        },
        {
          id: '4',
          name: 'Ana López',
          email: 'ana.lopez@email.com',
          phone: '+54 11 4567-8901',
          activity: 'basketball',
          status: 'active',
          paymentStatus: 'paid',
          registrationDate: '2024-01-05',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'jugador'
        },
        {
          id: '5',
          name: 'Luis Martínez',
          email: 'luis.martinez@email.com',
          phone: '+54 11 5678-9012',
          activity: 'basketball',
          status: 'active',
          paymentStatus: 'overdue',
          registrationDate: '2023-12-20',
          lastPaymentDate: '2023-12-01',
          nextPaymentDate: '2024-01-01',
          membershipType: 'jugador'
        },
        {
          id: '6',
          name: 'Sofía Herrera',
          email: 'sofia.herrera@email.com',
          phone: '+54 11 6789-0123',
          activity: 'basketball',
          status: 'active',
          paymentStatus: 'paid',
          registrationDate: '2023-12-15',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'jugador'
        },
        {
          id: '7',
          name: 'Diego Silva',
          email: 'diego.silva@email.com',
          phone: '+54 11 7890-1234',
          activity: 'basketball',
          status: 'inactive',
          paymentStatus: 'overdue',
          registrationDate: '2023-11-10',
          lastPaymentDate: '2023-11-01',
          nextPaymentDate: '2023-12-01',
          membershipType: 'jugador'
        },
        {
          id: '8',
          name: 'Valentina Castro',
          email: 'valentina.castro@email.com',
          phone: '+54 11 8901-2345',
          activity: 'basketball',
          status: 'active',
          paymentStatus: 'pending',
          registrationDate: '2024-01-25',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'jugador'
        },

        // Vóley - 6 miembros
        {
          id: '9',
          name: 'Roberto Fernández',
          email: 'roberto.fernandez@email.com',
          phone: '+54 11 9012-3456',
          activity: 'volleyball',
          status: 'active',
          paymentStatus: 'paid',
          registrationDate: '2024-01-12',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'jugador'
        },
        {
          id: '10',
          name: 'Carmen Ruiz',
          email: 'carmen.ruiz@email.com',
          phone: '+54 11 0123-4567',
          activity: 'volleyball',
          status: 'active',
          paymentStatus: 'overdue',
          registrationDate: '2023-12-05',
          lastPaymentDate: '2023-12-01',
          nextPaymentDate: '2024-01-01',
          membershipType: 'jugador'
        },
        {
          id: '11',
          name: 'Miguel Torres',
          email: 'miguel.torres@email.com',
          phone: '+54 11 1234-5678',
          activity: 'volleyball',
          status: 'active',
          paymentStatus: 'pending',
          registrationDate: '2024-01-18',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'jugador'
        },
        {
          id: '12',
          name: 'Isabella Morales',
          email: 'isabella.morales@email.com',
          phone: '+54 11 2345-6789',
          activity: 'volleyball',
          status: 'active',
          paymentStatus: 'overdue',
          registrationDate: '2023-11-25',
          lastPaymentDate: '2023-11-01',
          nextPaymentDate: '2023-12-01',
          membershipType: 'jugador'
        },
        {
          id: '13',
          name: 'Andrés Jiménez',
          email: 'andres.jimenez@email.com',
          phone: '+54 11 3456-7890',
          activity: 'volleyball',
          status: 'inactive',
          paymentStatus: 'overdue',
          registrationDate: '2023-10-15',
          lastPaymentDate: '2023-10-01',
          nextPaymentDate: '2023-11-01',
          membershipType: 'jugador'
        },
        {
          id: '14',
          name: 'Camila Vega',
          email: 'camila.vega@email.com',
          phone: '+54 11 4567-8901',
          activity: 'volleyball',
          status: 'active',
          paymentStatus: 'paid',
          registrationDate: '2024-01-08',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'jugador'
        },

        // Karate - 7 miembros
        {
          id: '15',
          name: 'Alejandro Mendoza',
          email: 'alejandro.mendoza@email.com',
          phone: '+54 11 5678-9012',
          activity: 'karate',
          status: 'active',
          paymentStatus: 'paid',
          registrationDate: '2024-01-14',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'jugador'
        },
        {
          id: '16',
          name: 'Lucía Navarro',
          email: 'lucia.navarro@email.com',
          phone: '+54 11 6789-0123',
          activity: 'karate',
          status: 'active',
          paymentStatus: 'pending',
          registrationDate: '2024-01-22',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'jugador'
        },
        {
          id: '17',
          name: 'Fernando Ríos',
          email: 'fernando.rios@email.com',
          phone: '+54 11 7890-1234',
          activity: 'karate',
          status: 'active',
          paymentStatus: 'overdue',
          registrationDate: '2023-12-12',
          lastPaymentDate: '2023-12-01',
          nextPaymentDate: '2024-01-01',
          membershipType: 'jugador'
        },
        {
          id: '18',
          name: 'Gabriela Paredes',
          email: 'gabriela.paredes@email.com',
          phone: '+54 11 8901-2345',
          activity: 'karate',
          status: 'active',
          paymentStatus: 'paid',
          registrationDate: '2024-01-03',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'jugador'
        },
        {
          id: '19',
          name: 'Ricardo Soto',
          email: 'ricardo.soto@email.com',
          phone: '+54 11 9012-3456',
          activity: 'karate',
          status: 'active',
          paymentStatus: 'pending',
          registrationDate: '2024-01-28',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'jugador'
        },
        {
          id: '20',
          name: 'Daniela Campos',
          email: 'daniela.campos@email.com',
          phone: '+54 11 0123-4567',
          activity: 'karate',
          status: 'inactive',
          paymentStatus: 'overdue',
          registrationDate: '2023-11-20',
          lastPaymentDate: '2023-11-01',
          nextPaymentDate: '2023-12-01',
          membershipType: 'jugador'
        },
        {
          id: '21',
          name: 'Hugo Espinoza',
          email: 'hugo.espinoza@email.com',
          phone: '+54 11 1234-5678',
          activity: 'karate',
          status: 'active',
          paymentStatus: 'paid',
          registrationDate: '2024-01-16',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'jugador'
        },

        // Gimnasio - 5 miembros
        {
          id: '22',
          name: 'Patricia Acosta',
          email: 'patricia.acosta@email.com',
          phone: '+54 11 2345-6789',
          activity: 'gym',
          status: 'active',
          paymentStatus: 'paid',
          registrationDate: '2024-01-11',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'jugador'
        },
        {
          id: '23',
          name: 'Eduardo Miranda',
          email: 'eduardo.miranda@email.com',
          phone: '+54 11 3456-7890',
          activity: 'gym',
          status: 'active',
          paymentStatus: 'overdue',
          registrationDate: '2023-12-18',
          lastPaymentDate: '2023-12-01',
          nextPaymentDate: '2024-01-01',
          membershipType: 'jugador'
        },
        {
          id: '24',
          name: 'Natalia Fuentes',
          email: 'natalia.fuentes@email.com',
          phone: '+54 11 4567-8901',
          activity: 'gym',
          status: 'active',
          paymentStatus: 'pending',
          registrationDate: '2024-01-24',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'jugador'
        },
        {
          id: '25',
          name: 'Oscar Valenzuela',
          email: 'oscar.valenzuela@email.com',
          phone: '+54 11 5678-9012',
          activity: 'gym',
          status: 'inactive',
          paymentStatus: 'overdue',
          registrationDate: '2023-10-30',
          lastPaymentDate: '2023-10-01',
          nextPaymentDate: '2023-11-01',
          membershipType: 'jugador'
        },
        {
          id: '26',
          name: 'Renata Sepúlveda',
          email: 'renata.sepulveda@email.com',
          phone: '+54 11 6789-0123',
          activity: 'gym',
          status: 'active',
          paymentStatus: 'paid',
          registrationDate: '2024-01-07',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'jugador'
        },

        // Socios sin actividad específica - 4 miembros
        {
          id: '27',
          name: 'Roberto Díaz',
          email: 'roberto.diaz@email.com',
          phone: '+54 11 7890-1234',
          status: 'active',
          paymentStatus: 'paid',
          registrationDate: '2024-01-10',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'socio'
        },
        {
          id: '28',
          name: 'María Elena Vargas',
          email: 'maria.vargas@email.com',
          phone: '+54 11 8901-2345',
          status: 'active',
          paymentStatus: 'pending',
          registrationDate: '2024-01-15',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'socio'
        },
        {
          id: '29',
          name: 'Carlos Alberto Morales',
          email: 'carlos.morales@email.com',
          phone: '+54 11 9012-3456',
          status: 'inactive',
          paymentStatus: 'overdue',
          registrationDate: '2023-11-15',
          lastPaymentDate: '2023-11-01',
          nextPaymentDate: '2023-12-01',
          membershipType: 'socio'
        },
        {
          id: '30',
          name: 'Ana Sofía Rojas',
          email: 'ana.rojas@email.com',
          phone: '+54 11 0123-4567',
          status: 'active',
          paymentStatus: 'paid',
          registrationDate: '2024-01-05',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          membershipType: 'socio'
        }
      ],
      selectedMembers: [],
      paymentReminders: [],
      remindersEnabled: false,

      // Acciones
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      
      setCurrentPage: (page: string) => set({ currentPage: page }),
      
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
    }
  )
)
