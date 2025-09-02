/**
 * Tests for Zustand Store
 */

import { useAppStore } from '@/lib/store'
import { act, renderHook } from '@testing-library/react'

describe('App Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      sidebarCollapsed: false,
      currentPage: 'dashboard',
      darkMode: false,
      globalSearchQuery: '',
      globalSearchResults: [],
      isSearching: false,
      members: [],
      selectedMembers: [],
      isLoading: false,
      error: null,
      paymentReminders: [],
      remindersEnabled: false,
    })
  })

  describe('UI State Management', () => {
    it('should toggle sidebar state', () => {
      const { result } = renderHook(() => useAppStore())
      
      expect(result.current.sidebarCollapsed).toBe(false)
      
      act(() => {
        result.current.toggleSidebar()
      })
      
      expect(result.current.sidebarCollapsed).toBe(true)
    })

    it('should set current page', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        result.current.setCurrentPage('members')
      })
      
      expect(result.current.currentPage).toBe('members')
    })

    it('should toggle dark mode', () => {
      const { result } = renderHook(() => useAppStore())
      
      expect(result.current.darkMode).toBe(false)
      
      act(() => {
        result.current.toggleDarkMode()
      })
      
      expect(result.current.darkMode).toBe(true)
    })
  })

  describe('Global Search', () => {
    it('should set search query', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        result.current.setGlobalSearchQuery('test query')
      })
      
      expect(result.current.globalSearchQuery).toBe('test query')
    })

    it('should perform global search in sections', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        result.current.performGlobalSearch('panel')
      })
      
      expect(result.current.globalSearchQuery).toBe('panel')
      expect(result.current.globalSearchResults).toHaveLength(1)
      expect(result.current.globalSearchResults[0].name).toBe('Panel de Control')
    })

    it('should perform global search in members', () => {
      const { result } = renderHook(() => useAppStore())
      
      // Add test members
      act(() => {
        result.current.setMembers([
          global.testUtils.createMockMember({ name: 'Juan Pérez' }),
          global.testUtils.createMockMember({ name: 'María García', activity: 'volleyball' }),
        ])
      })
      
      act(() => {
        result.current.performGlobalSearch('Juan')
      })
      
      expect(result.current.globalSearchResults).toHaveLength(1)
      expect(result.current.globalSearchResults[0].name).toBe('Juan Pérez')
    })

    it('should search by email and activity', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        result.current.setMembers([
          global.testUtils.createMockMember({ 
            email: 'test@example.com', 
            activity: 'basketball' 
          }),
        ])
      })
      
      // Search by email
      act(() => {
        result.current.performGlobalSearch('test@example')
      })
      
      expect(result.current.globalSearchResults).toHaveLength(1)
      
      // Search by activity
      act(() => {
        result.current.performGlobalSearch('basketball')
      })
      
      expect(result.current.globalSearchResults).toHaveLength(1)
    })

    it('should clear search results', () => {
      const { result } = renderHook(() => useAppStore())
      
      // Set some search state
      act(() => {
        result.current.performGlobalSearch('test')
      })
      
      expect(result.current.globalSearchQuery).toBe('test')
      
      // Clear search
      act(() => {
        result.current.clearSearch()
      })
      
      expect(result.current.globalSearchQuery).toBe('')
      expect(result.current.globalSearchResults).toHaveLength(0)
      expect(result.current.isSearching).toBe(false)
    })
  })

  describe('Members Management', () => {
    it('should set members', () => {
      const { result } = renderHook(() => useAppStore())
      const testMembers = [
        global.testUtils.createMockMember(),
        global.testUtils.createMockMember({ id: '2' }),
      ]
      
      act(() => {
        result.current.setMembers(testMembers)
      })
      
      expect(result.current.members).toHaveLength(2)
      expect(result.current.members).toEqual(testMembers)
    })

    it('should add new member', () => {
      const { result } = renderHook(() => useAppStore())
      const newMemberData = {
        name: 'New Member',
        email: 'new@test.com',
        phone: '+54 11 9999-9999',
        activity: 'karate' as const,
        status: 'active' as const,
        paymentStatus: 'pending' as const,
        membershipType: 'jugador' as const,
        registrationDate: '2024-01-01',
        lastPaymentDate: '2024-01-01',
        nextPaymentDate: '2024-02-01',
      }
      
      act(() => {
        result.current.addMember(newMemberData)
      })
      
      expect(result.current.members).toHaveLength(1)
      expect(result.current.members[0]).toMatchObject(newMemberData)
      expect(result.current.members[0].id).toBeDefined()
    })

    it('should update member', () => {
      const { result } = renderHook(() => useAppStore())
      const testMember = global.testUtils.createMockMember()
      
      // Add member first
      act(() => {
        result.current.setMembers([testMember])
      })
      
      // Update member
      act(() => {
        result.current.updateMember(testMember.id, { name: 'Updated Name' })
      })
      
      expect(result.current.members[0].name).toBe('Updated Name')
      expect(result.current.members[0].id).toBe(testMember.id)
    })

    it('should delete member', () => {
      const { result } = renderHook(() => useAppStore())
      const testMember = global.testUtils.createMockMember()
      
      // Add member first
      act(() => {
        result.current.setMembers([testMember])
        result.current.selectMember(testMember.id)
      })
      
      expect(result.current.members).toHaveLength(1)
      expect(result.current.selectedMembers).toContain(testMember.id)
      
      // Delete member
      act(() => {
        result.current.deleteMember(testMember.id)
      })
      
      expect(result.current.members).toHaveLength(0)
      expect(result.current.selectedMembers).not.toContain(testMember.id)
    })
  })

  describe('Member Selection', () => {
    it('should select and deselect members', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        result.current.selectMember('member-1')
      })
      
      expect(result.current.selectedMembers).toContain('member-1')
      
      act(() => {
        result.current.deselectMember('member-1')
      })
      
      expect(result.current.selectedMembers).not.toContain('member-1')
    })

    it('should select all members', () => {
      const { result } = renderHook(() => useAppStore())
      const testMembers = [
        global.testUtils.createMockMember({ id: '1' }),
        global.testUtils.createMockMember({ id: '2' }),
      ]
      
      act(() => {
        result.current.setMembers(testMembers)
        result.current.selectAllMembers()
      })
      
      expect(result.current.selectedMembers).toEqual(['1', '2'])
    })

    it('should deselect all members', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        result.current.selectMember('member-1')
        result.current.selectMember('member-2')
      })
      
      expect(result.current.selectedMembers).toHaveLength(2)
      
      act(() => {
        result.current.deselectAllMembers()
      })
      
      expect(result.current.selectedMembers).toHaveLength(0)
    })
  })

  describe('Loading and Error States', () => {
    it('should manage loading state', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        result.current.setLoading(true)
      })
      
      expect(result.current.isLoading).toBe(true)
      
      act(() => {
        result.current.setLoading(false)
      })
      
      expect(result.current.isLoading).toBe(false)
    })

    it('should manage error state', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        result.current.setError('Test error message')
      })
      
      expect(result.current.error).toBe('Test error message')
      
      act(() => {
        result.current.setError(null)
      })
      
      expect(result.current.error).toBeNull()
    })
  })

  describe('Payment Reminders', () => {
    it('should toggle reminders', () => {
      const { result } = renderHook(() => useAppStore())
      
      expect(result.current.remindersEnabled).toBe(false)
      
      act(() => {
        result.current.toggleReminders()
      })
      
      expect(result.current.remindersEnabled).toBe(true)
    })

    it('should add payment reminder', () => {
      const { result } = renderHook(() => useAppStore())
      const reminderData = {
        memberId: 'member-1',
        memberName: 'John Doe',
        activity: 'basketball',
        dueDate: '2024-02-01',
        amount: 15000,
        sent: false,
      }
      
      act(() => {
        result.current.addPaymentReminder(reminderData)
      })
      
      expect(result.current.paymentReminders).toHaveLength(1)
      expect(result.current.paymentReminders[0]).toMatchObject(reminderData)
      expect(result.current.paymentReminders[0].id).toBeDefined()
    })

    it('should mark reminder as sent', () => {
      const { result } = renderHook(() => useAppStore())
      const reminderData = {
        memberId: 'member-1',
        memberName: 'John Doe',
        activity: 'basketball',
        dueDate: '2024-02-01',
        amount: 15000,
        sent: false,
      }
      
      // Add reminder
      act(() => {
        result.current.addPaymentReminder(reminderData)
      })
      
      const reminderId = result.current.paymentReminders[0].id
      
      // Mark as sent
      act(() => {
        result.current.markReminderSent(reminderId)
      })
      
      expect(result.current.paymentReminders[0].sent).toBe(true)
      expect(result.current.paymentReminders[0].sentDate).toBeDefined()
    })
  })
})