# Club Comandante Espora - Brand Design System
## Dark Swiss Split-Screen Fintech Terminal Aesthetic

**Version:** 1.0
**Last Updated:** 2026-01-12
**Purpose:** Single source of truth for all UI/UX implementations

---

## 🎨 Design Philosophy

This design system combines three core principles:

1. **Dark Fintech Terminal** - Professional, high-contrast, information-dense interface
2. **Swiss Typography** - Clean, bold, hierarchical typography with maximum readability
3. **Split-Screen Productivity** - Master/Detail layout for efficient workflows

### Core Values
- **Clarity over decoration** - Every pixel serves a purpose
- **Speed over beauty** - Fast visual scanning and decision-making
- **Precision over approximation** - Exact numbers, clear states, no ambiguity

---

## 🎯 Layout Architecture

### Split-Screen Master/Detail Pattern

```
┌─────────────────────────────────────────────────────────┐
│  Header (Full Width - 60px fixed)                       │
├──────────────┬──────────────────────────────────────────┤
│              │                                           │
│  Left Panel  │         Right Panel                       │
│  (Master)    │         (Detail/Action Area)              │
│              │                                           │
│  35-40%      │         60-65%                            │
│  Scrollable  │         Scrollable Independently          │
│              │                                           │
│  - Sidebar   │  - Context-specific content               │
│  - Lists     │  - Forms                                  │
│  - Navigation│  - Detailed views                         │
│              │  - Tabbed interfaces                      │
└──────────────┴──────────────────────────────────────────┘
```

### Grid System
- **Container:** `max-w-none` (full viewport)
- **Left Panel:** `w-[35%] min-w-[320px] max-w-[480px]`
- **Right Panel:** `flex-1` (remaining space)
- **Gap:** `gap-0` (no gap between panels, use internal padding)
- **Height:** `h-[calc(100vh-60px)]` (full viewport minus header)

### Z-Index Scale
```css
Header:    z-50
Modals:    z-[100]
Dropdowns: z-[60]
Overlays:  z-[40]
Panels:    z-10
Base:      z-0
```

---

## 🌈 Color Palette

### Background Colors (Dark Foundation)

```css
/* Primary Backgrounds */
--bg-primary:     #121212  /* Deep Obsidian - Main background */
--bg-secondary:   #1A1A1A  /* Charcoal - Slightly lighter for contrast */
--bg-tertiary:    #252525  /* Surface grey - Cards and elevated surfaces */

/* Panel Backgrounds */
--bg-left-panel:  #1A1A1A  /* Left panel background */
--bg-right-panel: #121212  /* Right panel background (slightly darker) */
```

### Surface & Border Colors

```css
/* Surfaces (Cards, Tables, Inputs) */
--surface-default:    #252525  /* Default surface color */
--surface-hover:      #2D2D2D  /* Hover state */
--surface-active:     #333333  /* Active/pressed state */

/* Borders */
--border-default:     #333333  /* Default border (subtle) */
--border-emphasis:    #404040  /* Emphasized border */
--border-focus:       #00FFC2  /* Focus state border */
```

### Text Colors

```css
/* Typography Hierarchy */
--text-primary:       #FFFFFF  /* Headers, critical info */
--text-secondary:     #A0A0A0  /* Labels, descriptions */
--text-tertiary:      #666666  /* Muted text, disabled states */
--text-accent:        #00FFC2  /* Highlighted text, links */
```

### Accent Colors (High Contrast Neon)

```css
/* Primary Action / Positive / Money In */
--accent-primary:        #00FFC2  /* Electric Mint */
--accent-primary-hover:  #00E5B0  /* Hover state */
--accent-primary-glow:   rgba(0, 255, 194, 0.2)  /* Glow effect */

/* Secondary / Info */
--accent-secondary:      #00E5FF  /* Cyan */
--accent-secondary-glow: rgba(0, 229, 255, 0.2)

/* Alert / Danger / Money Out / Debt */
--accent-alert:          #FF4757  /* Neon Coral */
--accent-alert-hover:    #FF3545  /* Hover state */
--accent-alert-glow:     rgba(255, 71, 87, 0.2)

/* Warning */
--accent-warning:        #FFAA00  /* Bright amber */
--accent-warning-glow:   rgba(255, 170, 0, 0.2)

/* Success (Alternative to primary) */
--accent-success:        #00FF88  /* Neon green */
--accent-success-glow:   rgba(0, 255, 136, 0.2)

/* Focus / Highlight */
--accent-focus:          #BB86FC  /* Electric purple */
--accent-focus-glow:     rgba(187, 134, 252, 0.2)
```

### Semantic Color Usage

| Use Case | Color | Token |
|----------|-------|-------|
| Money received/Income | Electric Mint | `--accent-primary` |
| Money owed/Debt | Neon Coral | `--accent-alert` |
| Active members | Electric Mint | `--accent-primary` |
| Overdue payments | Neon Coral | `--accent-alert` |
| Pending actions | Bright Amber | `--accent-warning` |
| Completed actions | Neon Green | `--accent-success` |
| Primary CTA buttons | Electric Mint | `--accent-primary` |
| Destructive actions | Neon Coral | `--accent-alert` |
| Focus/Selection | Electric Purple | `--accent-focus` |

---

## 📝 Typography System

### Font Families

```css
/* Primary Font Stack (Swiss Style) */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace (for numbers, codes, IDs) */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;

/* Display (for marketing/landing) */
--font-display: 'Plus Jakarta Sans', 'Inter', sans-serif;
```

### Type Scale (Swiss Hierarchy)

```css
/* Display (Hero sections, huge emphasis) */
--text-display: 4.5rem     /* 72px - Hero numbers, main KPIs */
--text-display-mobile: 3rem  /* 48px */

/* Headings */
--text-h1: 2.5rem          /* 40px - Page titles */
--text-h2: 2rem            /* 32px - Section headers */
--text-h3: 1.5rem          /* 24px - Subsection headers */
--text-h4: 1.25rem         /* 20px - Card headers */

/* Body */
--text-body-lg: 1.125rem   /* 18px - Large body text */
--text-body: 1rem          /* 16px - Default body */
--text-body-sm: 0.875rem   /* 14px - Small body, labels */

/* Utility */
--text-caption: 0.75rem    /* 12px - Captions, hints */
--text-overline: 0.625rem  /* 10px - Overline labels */
```

### Font Weights

```css
--font-light:      300
--font-regular:    400
--font-medium:     500
--font-semibold:   600
--font-bold:       700
--font-black:      900  /* For large display numbers */
```

### Typography Rules

1. **Headers:** Always bold (700) or black (900), white color
2. **Body Text:** Regular (400) or medium (500), secondary grey
3. **Numbers/Metrics:** Monospace font, display size for key KPIs
4. **Labels:** Uppercase, tracked spacing, caption size, tertiary grey
5. **Links:** Accent primary color, medium weight, no underline (underline on hover)

### Line Heights

```css
--leading-tight:   1.2    /* Headers */
--leading-normal:  1.5    /* Body text */
--leading-relaxed: 1.75   /* Long-form content */
```

### Letter Spacing

```css
--tracking-tighter: -0.05em  /* Large display text */
--tracking-tight:   -0.025em /* Headers */
--tracking-normal:  0        /* Body text */
--tracking-wide:    0.05em   /* Labels */
--tracking-wider:   0.1em    /* Overlines, small caps */
```

---

## 🧱 Component Styles

### Buttons

**Primary Button (Call to Action)**
```css
background: var(--accent-primary);
color: #000000; /* Black text on neon */
font-weight: 600;
border-radius: 2px; /* Almost straight corners */
padding: 12px 24px;
border: none;
box-shadow: 0 0 20px var(--accent-primary-glow);

/* Hover */
background: var(--accent-primary-hover);
box-shadow: 0 0 30px var(--accent-primary-glow);
transform: translateY(-1px);
```

**Secondary Button**
```css
background: transparent;
color: var(--text-primary);
font-weight: 600;
border: 2px solid var(--border-emphasis);
border-radius: 2px;
padding: 10px 24px;

/* Hover */
background: var(--surface-hover);
border-color: var(--accent-primary);
```

**Danger Button**
```css
background: var(--accent-alert);
color: #FFFFFF;
/* Same structure as primary */
```

### Input Fields

```css
background: var(--bg-tertiary);
color: var(--text-primary);
border: 1px solid var(--border-default);
border-radius: 2px;
padding: 12px 16px;
font-size: var(--text-body);

/* Placeholder */
color: var(--text-tertiary);

/* Focus */
border-color: var(--accent-primary);
box-shadow: 0 0 0 3px var(--accent-primary-glow);
outline: none;

/* Error */
border-color: var(--accent-alert);
box-shadow: 0 0 0 3px var(--accent-alert-glow);
```

### Cards

```css
background: var(--surface-default);
border: 1px solid var(--border-default);
border-radius: 2px;
padding: 24px;

/* Note: Cards do NOT have hover effects */
/* Only interactive elements (buttons, rows, nav items) have hovers */
```

### Tables (Floating Row Style)

**Table Container**
```css
background: transparent;
padding: 0;
```

**Table Row (Floating Block)**
```css
background: var(--surface-default);
border: 1px solid var(--border-default);
border-radius: 2px;
padding: 16px;
margin-bottom: 8px; /* Spacing between rows */

/* Hover */
background: var(--surface-hover);
border-color: var(--border-emphasis);

/* Selected */
border-color: var(--accent-primary);
box-shadow: 0 0 0 2px var(--accent-primary-glow);
```

**Table Header**
```css
background: transparent;
color: var(--text-secondary);
font-size: var(--text-caption);
font-weight: 600;
text-transform: uppercase;
letter-spacing: var(--tracking-wide);
padding: 12px 16px;
border: none;
```

**Table Cell**
```css
color: var(--text-primary);
font-size: var(--text-body);
padding: 0; /* Padding handled by row */
border: none;
```

### Badges/Tags

**Status Badge Base**
```css
padding: 4px 12px;
border-radius: 2px;
font-size: var(--text-caption);
font-weight: 600;
text-transform: uppercase;
letter-spacing: var(--tracking-wide);
```

**Status Variants**
- **Active/Paid:** `background: var(--accent-primary-glow); color: var(--accent-primary);`
- **Pending:** `background: var(--accent-warning-glow); color: var(--accent-warning);`
- **Overdue/Alert:** `background: var(--accent-alert-glow); color: var(--accent-alert);`
- **Inactive:** `background: var(--surface-active); color: var(--text-tertiary);`

### Modals/Dialogs

```css
background: var(--bg-secondary);
border: 1px solid var(--border-emphasis);
border-radius: 2px;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
padding: 32px;
max-width: 600px;

/* Backdrop */
background: rgba(0, 0, 0, 0.8);
backdrop-filter: blur(4px);
```

### Sidebar Navigation Items

```css
/* Default */
color: var(--text-secondary);
padding: 12px 16px;
border-radius: 2px;
margin-bottom: 4px;

/* Hover */
background: var(--surface-hover);
color: var(--text-primary);

/* Active */
background: var(--accent-primary);
color: #000000;
font-weight: 600;
box-shadow: 0 0 20px var(--accent-primary-glow);
```

---

## 📊 Data Visualization

### Chart Colors (Recharts)

```javascript
const CHART_COLORS = {
  primary: '#00FFC2',      // Electric Mint
  secondary: '#00E5FF',    // Cyan
  tertiary: '#BB86FC',     // Purple
  alert: '#FF4757',        // Coral
  warning: '#FFAA00',      // Amber
  success: '#00FF88',      // Green

  // Gradients for area charts
  gradientPrimary: ['#00FFC2', 'rgba(0, 255, 194, 0.1)'],
  gradientAlert: ['#FF4757', 'rgba(255, 71, 87, 0.1)']
}
```

### Chart Styling

```css
/* Grid lines */
stroke: var(--border-default);
stroke-dasharray: 4 4;

/* Axis text */
fill: var(--text-secondary);
font-size: var(--text-caption);

/* Tooltip */
background: var(--bg-secondary);
border: 1px solid var(--border-emphasis);
border-radius: 2px;
padding: 12px;
color: var(--text-primary);
```

---

## 🎭 Animations & Interactions

### Transition Durations

```css
--duration-instant:  100ms  /* Hover effects */
--duration-fast:     200ms  /* UI state changes */
--duration-normal:   300ms  /* Modal open/close */
--duration-slow:     500ms  /* Page transitions */
```

### Easing Functions

```css
--ease-default:    cubic-bezier(0.4, 0, 0.2, 1)  /* Material Design */
--ease-in:         cubic-bezier(0.4, 0, 1, 1)
--ease-out:        cubic-bezier(0, 0, 0.2, 1)
--ease-in-out:     cubic-bezier(0.4, 0, 0.2, 1)
--ease-bounce:     cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Hover Effects

- **Buttons:** `transform: translateY(-1px)` + glow increase
- **Floating Rows (Tables):** `background: var(--surface-hover)` + border color change
- **Sidebar Nav Items:** `background: var(--surface-hover)` + text color change
- **Links:** Color change + underline appear
- **Icons:** `scale: 1.1` + color change

**Note:** Cards do NOT have hover effects. Only truly interactive elements have hovers.

### Focus Indicators

All interactive elements must have visible focus state:
```css
outline: 2px solid var(--accent-focus);
outline-offset: 2px;
```

### Custom Scrollbars

```css
/* Webkit (Chrome, Safari, Edge) */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-emphasis);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #505050;
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--border-emphasis) var(--bg-primary);
}
```

---

## 📐 Spacing System

### Base Unit: 4px

```css
--space-1:  4px     /* 0.25rem */
--space-2:  8px     /* 0.5rem */
--space-3:  12px    /* 0.75rem */
--space-4:  16px    /* 1rem */
--space-5:  20px    /* 1.25rem */
--space-6:  24px    /* 1.5rem */
--space-8:  32px    /* 2rem */
--space-10: 40px    /* 2.5rem */
--space-12: 48px    /* 3rem */
--space-16: 64px    /* 4rem */
--space-20: 80px    /* 5rem */
--space-24: 96px    /* 6rem */
```

### Component Spacing Rules

- **Card padding:** `--space-6` (24px)
- **Section spacing:** `--space-8` to `--space-12` (32-48px)
- **Element gap (small):** `--space-2` to `--space-3` (8-12px)
- **Element gap (medium):** `--space-4` (16px)
- **Element gap (large):** `--space-6` (24px)

---

## 🔧 Implementation Guidelines

### Tailwind Config Mapping

Add these to `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#121212',
          secondary: '#1A1A1A',
          tertiary: '#252525',
        },
        surface: {
          DEFAULT: '#252525',
          hover: '#2D2D2D',
          active: '#333333',
        },
        border: {
          DEFAULT: '#333333',
          emphasis: '#404040',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A0A0A0',
          tertiary: '#666666',
        },
        accent: {
          primary: '#00FFC2',
          secondary: '#00E5FF',
          alert: '#FF4757',
          warning: '#FFAA00',
          success: '#00FF88',
          focus: '#BB86FC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1.2', letterSpacing: '-0.05em' }],
        'h1': ['2.5rem', { lineHeight: '1.2' }],
        'h2': ['2rem', { lineHeight: '1.2' }],
        'h3': ['1.5rem', { lineHeight: '1.2' }],
        'h4': ['1.25rem', { lineHeight: '1.2' }],
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(0, 255, 194, 0.2)',
        'glow-alert': '0 0 20px rgba(255, 71, 87, 0.2)',
        'glow-focus': '0 0 0 3px rgba(0, 255, 194, 0.2)',
      }
    }
  }
}
```

### Global CSS Structure

In `globals.css`:

```css
/* 1. CSS Variables */
:root {
  /* All color variables */
}

/* 2. Base resets */
* {
  box-sizing: border-box;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-primary);
}

/* 3. Component classes */
@layer components {
  .btn-primary { /* ... */ }
  .floating-row { /* ... */ }
  /* etc */
}

/* 4. Utility classes */
@layer utilities {
  .text-gradient-primary { /* ... */ }
}
```

### Component Checklist

When refactoring components, ensure:

- [ ] Background colors match dark palette
- [ ] Text hierarchy uses correct weights and sizes
- [ ] Interactive states (hover, focus, active) are implemented
- [ ] Spacing follows 4px base system
- [ ] Borders use subtle colors (#333333)
- [ ] Accent colors are used semantically
- [ ] No drop shadows (use glows for emphasis instead)
- [ ] Typography is bold and clear
- [ ] Numbers use monospace font
- [ ] Status indicators use correct badge styles

---

## 🚫 What NOT to Do

1. **No Pure Black (#000000)** - Always use #121212 or #1A1A1A
2. **No Drop Shadows** - Use border highlights or glows instead
3. **No Gradients on Backgrounds** - Solid colors only for surfaces
4. **No Small Text** - Minimum 12px (0.75rem)
5. **No Low Contrast** - Always test text legibility
6. **No Rounded Corners > 2px** - Keep it almost straight (2px max everywhere)
7. **No Animations > 500ms** - Keep it snappy
8. **No Multiple Accent Colors in One Component** - One accent per context
9. **No Grid Lines in Tables** - Use floating rows
10. **No Glassmorphism/Neumorphism** - Flat design with borders
11. **No Hover Effects on Cards** - Only interactive elements (buttons, rows, nav) have hovers

---

## 📱 Responsive Breakpoints

```css
--screen-sm:  640px   /* Mobile landscape */
--screen-md:  768px   /* Tablet portrait */
--screen-lg:  1024px  /* Tablet landscape / small desktop */
--screen-xl:  1280px  /* Desktop */
--screen-2xl: 1536px  /* Large desktop */
```

### Split-Screen Responsive Behavior

- **< 1024px (lg):** Stack panels vertically, left panel becomes top accordion/drawer
- **≥ 1024px:** Side-by-side split-screen layout

---

## ✅ Accessibility Requirements

1. **Contrast Ratios:**
   - Text on dark: Minimum 4.5:1 (7:1 preferred)
   - Large text: Minimum 3:1

2. **Focus Indicators:**
   - Always visible
   - 2px solid outline with 2px offset
   - Accent focus color (#BB86FC)

3. **Keyboard Navigation:**
   - All interactive elements must be keyboard accessible
   - Tab order must be logical
   - Escape closes modals

4. **Screen Readers:**
   - Meaningful alt text for images
   - ARIA labels for icon buttons
   - Proper heading hierarchy

---

## 🎯 Success Metrics

Your implementation is successful when:

1. ✅ All text is easily readable against dark backgrounds
2. ✅ Monetary values are immediately scannable
3. ✅ User can identify status at a glance (colors + text)
4. ✅ Split-screen layout maintains context while navigating
5. ✅ No horizontal scrolling on desktop (≥ 1024px)
6. ✅ Hover states provide clear feedback in < 100ms
7. ✅ No animation delays frustrate the user
8. ✅ The interface feels "professional" and "precise"

---

## 📚 Reference Examples

Inspiration sources for this design system:
- **Robinhood** - Fintech terminal aesthetic
- **Linear** - Split-screen productivity layout
- **Stripe Dashboard** - Data visualization and tables
- **Vercel** - Swiss typography hierarchy
- **Railway.app** - Dark mode and accent usage

---

**Document Owner:** Development Team
**Approval Required For Changes:** Yes
**Next Review Date:** Q2 2026
