# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14 dashboard application for Club Comandante Espora, a sports club management system. The application manages member registrations, payments, and various sporting activities (basketball, volleyball, karate, gym).

## Development Commands

```bash
# Install dependencies
cd FrontendCCE && npm install

# Development server
cd FrontendCCE && npm run dev

# Build for production
cd FrontendCCE && npm run build

# Start production server
cd FrontendCCE && npm start

# Linting
cd FrontendCCE && npm run lint
```

## Architecture Overview

### Framework & Tech Stack
- **Next.js 14** with App Router and React Server Components
- **TypeScript** for type safety
- **Tailwind CSS** with custom neumorphism/glassmorphism styling
- **Zustand** for state management (lib/store.ts)
- **Framer Motion** for animations
- **React Hook Form + Zod** for form validation
- **TanStack Table** for data tables
- **Recharts** for data visualization

### Core Design Patterns

1. **State Management**: Centralized Zustand store with persistence middleware
2. **Styling**: Glassmorphism/Neumorphism design with Tailwind CSS custom classes
3. **Component Structure**: Modular components organized by feature (dashboard, members, payments, registration)
4. **Type Safety**: Comprehensive TypeScript interfaces for Member, PaymentReminder types

### Key Data Models

**Member Interface** (lib/store.ts:4-16):
```typescript
interface Member {
  id: string
  name: string
  email: string
  phone: string
  activity?: 'basketball' | 'volleyball' | 'karate' | 'gym' | 'socio'
  status: 'active' | 'inactive'
  paymentStatus: 'paid' | 'pending' | 'overdue'
  membershipType: 'socio' | 'jugador'
  // ... date fields
}
```

### Directory Structure

- `app/` - Next.js 14 App Router pages
- `components/` - React components organized by feature:
  - `dashboard/` - Dashboard widgets and charts
  - `members/` - Member management table and forms
  - `payments/` - Payment management interface
  - `registration/` - Multi-step registration form
  - `ui/` - Reusable UI components (Sidebar, Header, etc.)
- `lib/` - Utilities and Zustand store

### Styling Guidelines

The project uses a custom design system with:
- Primary color: `#002C6F` (Club blue)
- Accent color: `#FFA500` (Orange)
- Glass morphism effects with backdrop-blur
- Custom shadow utilities for neumorphism
- Responsive design with mobile-first approach

### State Management

Central Zustand store manages:
- UI state (sidebar, current page)
- Members data with CRUD operations
- Payment reminders system
- Member selection for bulk operations

All state mutations go through store actions - avoid direct state modification.