# Ashram Management - Design System

## Philosophy
Clean, warm, professional. Inspired by modern SaaS dashboards with an ashram's spiritual warmth. Every element should feel purposeful — no visual noise, generous whitespace, and subtle motion that guides the eye.

---

## Color Palette

### Primary — Deep Maroon
The spiritual anchor. Used for key actions, sidebar, and brand moments.
- `--ashram-900`: #3c0212 (darkest, sidebar bg, primary buttons)
- `--ashram-800`: #5a0a20
- `--ashram-700`: #7a1232
- `--ashram-600`: #9a1a44
- `--ashram-500`: #b82256 (accent hover, links)
- `--ashram-100`: #fde8ef (light pink tint for badges/alerts)
- `--ashram-50`:  #fef5f8 (subtle background tint)

### Neutrals — Warm Grays
Soft, warm grays instead of cold blue-grays. Used for backgrounds, text, borders.
- `--gray-950`: #0f0d0e (headings)
- `--gray-700`: #44403c (body text)
- `--gray-500`: #78716c (secondary text)
- `--gray-300`: #d6d3d1 (borders)
- `--gray-200`: #e7e5e4 (dividers)
- `--gray-100`: #f5f5f4 (card backgrounds, table stripes)
- `--gray-50`:  #fafaf9 (page background)

### Semantics
- **Success**: #16a34a (green-600) / bg: #f0fdf4
- **Warning**: #ca8a04 (yellow-600) / bg: #fefce8
- **Error**: #dc2626 (red-600) / bg: #fef2f2
- **Info**: #2563eb (blue-600) / bg: #eff6ff

### Chart Colors
Five harmonious colors for data visualization:
1. #b82256 (maroon/rose — primary)
2. #0891b2 (cyan)
3. #8b5cf6 (violet)
4. #f59e0b (amber)
5. #10b981 (emerald)

---

## Typography

### Font Stack
- **Headings**: Inter (system), weight 600-700
- **Body**: Inter/system-ui, weight 400-500
- **Accent/Logo**: PT Serif, italic for special moments

### Scale
| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| display | 2.25rem (36px) | 700 | Page titles |
| heading | 1.5rem (24px) | 600 | Section headings |
| subheading | 1.125rem (18px) | 600 | Card titles |
| body | 0.875rem (14px) | 400 | Body text, table cells |
| caption | 0.75rem (12px) | 500 | Labels, badges, metadata |
| tiny | 0.6875rem (11px) | 500 | Helper text |

### Line Heights
- Headings: 1.2
- Body: 1.5
- UI (buttons, badges): 1

---

## Spacing

Based on a 4px grid. Use Tailwind spacing scale.
- **xs**: 4px (p-1)
- **sm**: 8px (p-2)
- **md**: 12px (p-3)
- **base**: 16px (p-4)
- **lg**: 20px (p-5)
- **xl**: 24px (p-6)
- **2xl**: 32px (p-8)
- **3xl**: 48px (p-12)

### Page Layout
- Page padding: `px-6 py-6` (mobile) / `px-8 py-8` (desktop)
- Section gap: `space-y-6`
- Card grid gap: `gap-4` (mobile) / `gap-6` (desktop)

---

## Border Radius

Generous rounding for a modern, friendly feel:
- `--radius`: 0.75rem (12px) — default for cards, inputs
- `--radius-sm`: 0.5rem (8px) — badges, small elements
- `--radius-lg`: 1rem (16px) — modals, sheets
- `--radius-full`: 9999px — pills, avatars

---

## Shadows

Layered soft shadows instead of borders where possible:
- **xs**: `0 1px 2px rgba(0,0,0,0.04)` — inputs, badges
- **sm**: `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` — cards at rest
- **md**: `0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)` — cards on hover
- **lg**: `0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)` — dropdowns, sheets
- **glow**: `0 0 0 3px rgba(184,34,86,0.1)` — focus ring (maroon tint)

---

## Animation

All transitions use a snappy spring-inspired curve:
- **Default duration**: 200ms
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (quick out, smooth settle)
- **Slow**: 300ms (page transitions, modals)
- **Fast**: 150ms (hover states, toggles)

### Standard Transitions
```css
transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
```

### Micro-interactions
- **Card hover**: translateY(-2px) + shadow-md
- **Button press**: scale(0.97)
- **Row hover**: background fade to gray-50
- **Badge pulse**: subtle scale for status updates
- **Page enter**: fadeIn + translateY(8px) over 400ms
- **Stat counter**: countUp animation on mount
- **Sidebar item**: indent + color shift on active

---

## Components

### Card
- Background: white, border: 1px gray-200, radius: 12px, shadow-sm
- Hover: shadow-md, translateY(-2px)
- Stat cards: icon in a soft-colored circle bg, large number, small label below

### Button
- Primary: bg-ashram-900, text-white, hover darker, active scale(0.97)
- Secondary: bg-gray-100, text-gray-700, hover bg-gray-200
- Ghost: transparent, hover bg-gray-100
- Outline: border-gray-300, hover bg-gray-50
- Destructive: bg-red-600, text-white
- All: radius 8px, height 36px (default), font-weight 500
- Icon buttons: 36x36px square, ghost or outline variant

### Input
- Height: 40px, padding 12px, radius 8px
- Border: 1px gray-300, bg: white
- Focus: border-ashram-500, ring-glow (maroon tint)
- Placeholder: gray-400

### Badge
- Pill shape (radius-full), padding 2px 10px
- Soft variants: colored bg (10% opacity) + colored text
- Status: green for active/success, amber for pending, red for error, blue for info

### Table / DataTable
- No outer border. Clean flat look.
- Header: bg-gray-50, text-gray-500, uppercase text-xs, font-medium
- Rows: border-b gray-100, hover bg-gray-50/80
- Cells: py-3 px-4, text-sm
- Pagination: rounded pill buttons

### Sidebar
- Width: 260px, bg: ashram-900 gradient (top-to-bottom, slight lighter at bottom)
- Items: 40px height, rounded-lg (8px), padding-left 12px
- Active: bg-white/15, font-medium, left 3px accent bar
- Hover: bg-white/10
- Section labels: uppercase, text-xs, tracking-wide, text-white/50
- Collapsible: smooth 200ms height animation

### Sheet (Side Panel)
- Width: 420px (desktop), full (mobile)
- Header: sticky, border-b, close button
- Content: scroll, padding 24px
- Overlay: bg-black/40 with backdrop-blur(4px)

---

## Page Patterns

### Overview/Dashboard Pages
```
[Page Title + Description]
[4-column stat cards with icons and mini-trends]
[Navigation cards grid (2-3 columns)]
```

### CRUD List Pages
```
[Page Title + Description] ............... [+ Add Button]
[Filter bar: search input + filter dropdowns]
[Data table with actions column]
[Pagination]
```

### Form Sheets
```
[Sheet Title]
[Form fields — 1 or 2 column grid]
[Save button — full width, primary]
```

---

## Iconography
- Library: Lucide React
- Size: 16px in buttons/badges, 20px in navigation, 24px in stat cards
- Style: Stroke width 1.75 (default), consistent across all uses
- Stat card icons: placed inside 40x40 rounded-lg container with soft color bg

---

## Dark Mode
- Follows system preference or manual toggle
- Sidebar: slightly darker shade, same maroon family
- Cards: bg-gray-900, border-gray-800
- Text: white/gray-100 for headings, gray-400 for secondary
