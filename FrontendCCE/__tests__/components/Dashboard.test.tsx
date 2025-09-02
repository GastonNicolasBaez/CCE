/**
 * Tests for Dashboard Component
 */

import { render, screen, waitFor } from '@testing-library/react'
import Dashboard from '@/components/dashboard/Dashboard'
import { useAppStore } from '@/lib/store'

// Mock the store
jest.mock('@/lib/store', () => ({
  useAppStore: jest.fn(),
}))

// Mock the hooks
jest.mock('@/lib/hooks', () => ({
  useLoadMembers: jest.fn(() => ({
    isLoading: false,
    error: null,
  })),
}))

const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Default store state
    mockUseAppStore.mockReturnValue({
      members: [
        global.testUtils.createMockMember({ status: 'active', paymentStatus: 'paid' }),
        global.testUtils.createMockMember({ 
          id: '2', 
          name: 'María García',
          status: 'active', 
          paymentStatus: 'pending' 
        }),
        global.testUtils.createMockMember({ 
          id: '3', 
          name: 'Carlos López',
          status: 'inactive', 
          paymentStatus: 'overdue' 
        }),
      ],
      // Add other required store properties
      sidebarCollapsed: false,
      currentPage: 'dashboard',
      darkMode: false,
      globalSearchQuery: '',
      globalSearchResults: [],
      isSearching: false,
      selectedMembers: [],
      isLoading: false,
      error: null,
      paymentReminders: [],
      remindersEnabled: false,
      // Add all required methods as mocks
      toggleSidebar: jest.fn(),
      setCurrentPage: jest.fn(),
      toggleDarkMode: jest.fn(),
      setGlobalSearchQuery: jest.fn(),
      performGlobalSearch: jest.fn(),
      clearSearch: jest.fn(),
      setMembers: jest.fn(),
      addMember: jest.fn(),
      updateMember: jest.fn(),
      deleteMember: jest.fn(),
      selectMember: jest.fn(),
      deselectMember: jest.fn(),
      selectAllMembers: jest.fn(),
      deselectAllMembers: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      toggleReminders: jest.fn(),
      addPaymentReminder: jest.fn(),
      markReminderSent: jest.fn(),
    })
  })

  it('renders dashboard title and subtitle', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Club Comandante Espora')).toBeInTheDocument()
    expect(screen.getByText('Panel de Control - Vista general del club')).toBeInTheDocument()
  })

  it('displays metric cards with correct values', () => {
    render(<Dashboard />)
    
    // Should show total members (3)
    expect(screen.getByText('Total de Socios')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    
    // Should show active members (2)
    expect(screen.getByText('Socios Activos')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    
    // Should show pending payments (1)
    expect(screen.getByText('Cuotas Pendientes')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    
    // Should show overdue payments (1)
    expect(screen.getByText('Cuotas Vencidas')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('displays nueva inscripción button', () => {
    render(<Dashboard />)
    
    const newRegistrationButton = screen.getByRole('link', { name: /nueva inscripción/i })
    expect(newRegistrationButton).toBeInTheDocument()
    expect(newRegistrationButton).toHaveAttribute('href', '/registration')
  })

  it('handles empty members array', () => {
    mockUseAppStore.mockReturnValue({
      ...mockUseAppStore(),
      members: [],
    })
    
    render(<Dashboard />)
    
    // All metrics should be 0
    expect(screen.getAllByText('0')).toHaveLength(4) // 4 metric cards with 0 value
  })

  it('displays loading state correctly', () => {
    // Mock useLoadMembers to return loading state
    const { useLoadMembers } = require('@/lib/hooks')
    useLoadMembers.mockReturnValue({
      isLoading: true,
      error: null,
    })
    
    render(<Dashboard />)
    
    expect(screen.getByRole('status')).toBeInTheDocument() // Loading spinner
  })

  it('displays error state correctly', () => {
    // Mock useLoadMembers to return error state
    const { useLoadMembers } = require('@/lib/hooks')
    useLoadMembers.mockReturnValue({
      isLoading: false,
      error: 'Failed to load data',
    })
    
    render(<Dashboard />)
    
    expect(screen.getByText('Error al cargar los datos: Failed to load data')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
  })

  it('handles non-array members gracefully', () => {
    mockUseAppStore.mockReturnValue({
      ...mockUseAppStore(),
      members: null, // Invalid data
    })
    
    render(<Dashboard />)
    
    // Should not crash and should show 0 for all metrics
    expect(screen.getAllByText('0')).toHaveLength(4)
  })

  it('renders chart components', () => {
    render(<Dashboard />)
    
    // PaymentChart should be rendered
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('applies correct CSS classes for responsive design', () => {
    const { container } = render(<Dashboard />)
    
    // Check for responsive grid classes
    const metricsGrid = container.querySelector('.grid.grid-cols-2.lg\\:grid-cols-4')
    expect(metricsGrid).toBeInTheDocument()
    
    // Check for layout classes
    const mainContainer = container.querySelector('.h-full.flex.flex-col')
    expect(mainContainer).toBeInTheDocument()
  })

  it('calculates metrics correctly with mixed payment statuses', () => {
    const mixedMembers = [
      global.testUtils.createMockMember({ status: 'active', paymentStatus: 'paid' }),
      global.testUtils.createMockMember({ status: 'active', paymentStatus: 'pending' }),
      global.testUtils.createMockMember({ status: 'active', paymentStatus: 'overdue' }),
      global.testUtils.createMockMember({ status: 'inactive', paymentStatus: 'paid' }),
    ]
    
    mockUseAppStore.mockReturnValue({
      ...mockUseAppStore(),
      members: mixedMembers,
    })
    
    render(<Dashboard />)
    
    // Total members: 4
    expect(screen.getByText('4')).toBeInTheDocument()
    // Active members: 3 (only active status)
    expect(screen.getByText('3')).toBeInTheDocument()
    // Pending payments: 1
    expect(screen.getByText('1')).toBeInTheDocument()
    // Overdue payments: 1  
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})