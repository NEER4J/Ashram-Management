# Ashram Management — Project Scan Report

Generated from a full repository scan: application routes, dashboard navigation, API handlers, Supabase migrations, shared libraries, and UI components. Use this as a high-level map of what exists in the codebase today.

---

## 1. Product & stack

| Item | Detail |
|------|--------|
| **App name** | Ashram Management (see `app/manifest.ts`: short name “Ashram”, PWA-oriented manifest) |
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS, tailwindcss-animate |
| **UI** | Radix UI primitives, shadcn-style components under `components/ui/` |
| **Backend / data** | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) — PostgreSQL, Auth, Storage |
| **Forms & validation** | react-hook-form, Zod, `@hookform/resolvers` |
| **Tables & charts** | TanStack Table, Recharts |
| **Other** | date-fns, next-themes, lucide-react icons, qrcode.react, sonner toasts |

---

## 2. Public & marketing pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page: feature highlights, steps, pricing section (`components/pricing-section.tsx`), header/footer |
| `/events` | Public events listing |
| `/events/[slug]` | Public event detail / registration (dynamic events with slugs) |
| `/gurukul` | Public Gurukul area |
| `/gurukul/materials` | Study materials browsing |
| `/gurukul/materials/[id]` | Single material |
| `/gurukul/courses/[id]` | Public course view |
| `/book-stay` | Public accommodation booking flow |

---

## 3. Authentication

| Route | Purpose |
|-------|---------|
| `/auth/login` | Login (`components/login-form.tsx`) |
| `/auth/sign-up` | Sign up (`components/sign-up-form.tsx`) |
| `/auth/sign-up-success` | Post–sign-up confirmation |
| `/auth/forgot-password` | Password reset request |
| `/auth/update-password` | Set new password |
| `/auth/error` | Auth error display |
| `/auth/callback` | OAuth / session callback (`route.ts`) |
| `/auth/confirm` | Email confirmation handler (`route.ts`) |

---

## 4. Dashboard (`/dashboard/*`)

Protected by Supabase session. **`app/dashboard/layout.tsx`** loads `user_profiles.role` and enforces:

- **`admin`**: full access to all dashboard routes in the sidebar.
- **`user`** (non-admin): redirected away from admin modules to **`/dashboard/my-learning`** (except **`/dashboard/profile`** and **`/dashboard/settings`**).

### 4.1 Core operations (sidebar: “Core Operations”)

| Route | Module |
|-------|--------|
| `/dashboard` | Home dashboard |
| `/dashboard/devotees` | Devotee registry |
| `/dashboard/devotees/[id]` | Devotee detail |
| `/dashboard/visitors` | Visitor registration / tracking |
| `/dashboard/pujas` | Puja booking |

### 4.2 Management

| Route | Module |
|-------|--------|
| `/dashboard/events` | Temple events |
| `/dashboard/events/[id]/analytics` | Per-event analytics |
| `/dashboard/staff` | Staff & priests |
| `/dashboard/seva` | Seva & volunteers |
| `/dashboard/inventory` | Inventory |
| `/dashboard/kitchen` | Kitchen & Prasad |
| `/dashboard/medical` | Medical camps / wellness (UI) |

### 4.3 Accommodation

| Route | Module |
|-------|--------|
| `/dashboard/accommodation` | Overview |
| `/dashboard/accommodation/properties` | Properties (multi-property / “hotel-style”) |
| `/dashboard/accommodation/rooms` | Rooms |
| `/dashboard/accommodation/bookings` | Bookings |
| `/dashboard/accommodation/waitlist` | Waitlist |

### 4.4 Accounting & finance (collapsible nav)

Includes **Donations** as the first entry under this group.

| Route | Module |
|-------|--------|
| `/dashboard/donations` | Donations (cash; receipt generation hooks into API) |
| `/dashboard/donations/in-kind` | In-kind donations |
| `/dashboard/accounting/chart-of-accounts` | Chart of accounts |
| `/dashboard/accounting/general-ledger` | General ledger |
| `/dashboard/accounting/journal-entries` | Journal entries |
| `/dashboard/accounting/bank-accounts` | Bank accounts |
| `/dashboard/accounting/bank-accounts/reconciliation` | Reconciliation |
| `/dashboard/accounting/vendors` | Vendors |
| `/dashboard/accounting/bills` | Bills (payable) |
| `/dashboard/accounting/invoices` | Invoices (receivable) |
| `/dashboard/accounting/expenses` | Expenses |
| `/dashboard/accounting/budgets` | Budgets |
| `/dashboard/accounting/gst` | GST returns |
| `/dashboard/accounting/reports` | Financial reports hub |
| `/dashboard/accounting/reports/trial-balance` | Trial balance |
| `/dashboard/accounting/reports/profit-loss` | P&L |
| `/dashboard/accounting/reports/balance-sheet` | Balance sheet |
| `/dashboard/accounting/reports/cash-flow` | Cash flow |
| `/dashboard/accounting/reports/gst-reports` | GST reports |

### 4.5 Gurukul (admin)

| Route | Module |
|-------|--------|
| `/dashboard/gurukul/study-materials` | Study materials admin |
| `/dashboard/gurukul/courses` | Courses list |
| `/dashboard/gurukul/courses/new` | New course |
| `/dashboard/gurukul/courses/[id]` | Course admin |
| `/dashboard/gurukul/courses/lessons/new` | New lesson |
| `/dashboard/gurukul/courses/lessons/[id]` | Lesson editor |
| `/dashboard/gurukul/orders` | Study material orders |

### 4.6 Student / learner area

| Route | Module |
|-------|--------|
| `/dashboard/my-learning` | Enrolled learning home |
| `/dashboard/my-learning/courses/[id]` | Course player / progress |
| `/dashboard/my-learning/materials/[id]` | Material view |

### 4.7 Other dashboard

| Route | Module |
|-------|--------|
| `/dashboard/reports` | Hub linking to devotees, donations, events, accommodation, seva, accounting reports |
| `/dashboard/profile` | User profile |
| `/dashboard/settings` | Settings |

---

## 5. HTTP API routes (`app/api/*`)

Server routes (Next.js Route Handlers):

| Method / path | Purpose |
|---------------|---------|
| `POST` `/api/accommodation/book` | Create accommodation booking (public/book-stay flow) |
| `POST` `/api/donations/[id]/generate-receipt` | Generate donation receipt (PDF/storage) |
| `POST` `/api/visitors/check-in` | Visitor check-in |
| `POST` `/api/visitors/check-out` | Visitor check-out |
| `POST` `/api/events/[eventId]/register` | Event registration |
| `POST` `/api/events/[eventId]/track-scan` | QR / attendance scan tracking |

---

## 6. Data layer (Supabase / PostgreSQL)

Migrations live under `supabase/migrations/`. Below is a **logical grouping** of tables and concepts (some tables appear in phased migrations or gap-fill scripts; production schema is the applied migration chain).

### 6.1 Core ashram (initial schema)

- **Masters**: `master_nakshatras`, `master_rashis`, `master_gotras`, `master_donation_categories`, `master_pujas`, `master_events`
- **Devotees**: `devotees`, `devotee_family_members`
- **Staff**: `staff` (incl. priest skills)
- **Donations**: `donations`
- **Puja**: `puja_bookings`
- **Events**: `temple_events`, `event_registrations`
- **Inventory**: `inventory_items`, `inventory_transactions`

Later migrations add **dynamic events** (e.g. `slug`, `is_published`, city/state, custom fields), **event images**, and **registration analytics** tied to `event_id`.

### 6.2 User profiles & Gurukul

- `user_profiles` (roles: admin vs user; RLS)
- **Gurukul**: `master_material_categories`, `study_materials`, `course_modules`, `course_enrollments`, `module_progress`, `study_material_orders`, `order_items` (and related lesson/course structure migrations)

### 6.3 Accounting module

- `financial_periods`, `chart_of_accounts`, `general_ledger`
- `journal_entries`, `journal_entry_lines`
- `bank_accounts`, `bank_transactions`
- `vendors`, `bills`, `bill_payments`
- `invoices`, `invoice_payments`
- `expenses`, `budgets`, `gst_returns`

### 6.4 Phase enhancements (devotees, visitors, storage)

- Devotee extensions: tags, KYC documents, milestones, communications, notes (enums for doc types, channels, etc.)
- **Visitors**: `visitor_registrations` (check-in/out, pass codes, QR, VIP, feedback)
- **Storage buckets** (see §7)

### 6.5 Accommodation

- `accommodations` (properties — multi-building model)
- `rooms`, `beds`, `room_maintenance`
- `accommodation_bookings`, `booking_waitlist`, `guest_feedback`

### 6.6 Events (extended)

- `venues`, `event_materials`, `event_registration_waitlist`, `event_volunteer_assignments`
- Links to existing `temple_events` / registrations

### 6.7 Donations (extended)

- `recurring_donations`, `donation_pledges`, `in_kind_donations`
- Receipt storage bucket integration

### 6.8 Seva & volunteers

- `volunteers`, `seva_opportunities`, `seva_shifts`, `seva_assignments`, `volunteer_badges`

### 6.9 Kitchen & Prasad

- `meal_menus`, `meal_tokens`, `prasad_bookings`, `annadaan_donations`, `kitchen_inventory`

### 6.10 Inventory & assets (extended)

- `inventory_locations`, `purchase_orders`, `inventory_transfers` (references `inventory_items`)
- `fixed_assets`, `religious_items`

### 6.11 Medical

- `medical_camps`, `medical_camp_registrations`, `emergency_contacts`, `wellness_consultations`

### 6.12 Communication

- `message_templates`, `communication_logs`

### 6.13 Roles & audit

- `roles`, `permissions`, `role_permissions`, `audit_logs`

Row Level Security (RLS) is enabled on many tables; policies evolve per migration (authenticated vs anon for specific reads, e.g. active accommodations for public booking).

---

## 7. Supabase Storage buckets

| Bucket | Typical use |
|--------|-------------|
| `gurukul-files` | Course/material PDFs, video, audio, covers |
| `event-images` | Event hero / promotional images |
| `devotee-documents` | Private KYC uploads |
| `devotee-photos` | Public profile photos |
| `donation-receipts` | Generated donation receipts (private) |

---

## 8. Shared libraries (`lib/`)

| Path | Role |
|------|------|
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/supabase/server.ts` | Server / RSC Supabase client |
| `lib/supabase/proxy.ts` | Request proxy helpers (if used for cookies/session) |
| `lib/utils.ts` | `cn()` and shared utilities |
| `lib/utils/video-embed.ts` | Video URL/embed helpers |
| `lib/data/indian-states-cities.ts` | Location data for forms |
| `lib/auth/role-check.ts` | Role checking helpers |

---

## 9. UI components (`components/`)

- **Layout / chrome**: `header.tsx`, `footer.tsx`, `theme-switcher.tsx`
- **Marketing**: `feature-section.tsx`, `pricing-section.tsx`
- **Auth forms**: `login-form.tsx`, `sign-up-form.tsx`, `forgot-password-form.tsx`, `update-password-form.tsx`, `logout-button.tsx`, `auth/user-role-check.tsx`
- **Gurukul**: `gurukul/*` — course builder, lesson player, materials, uploads, dialogs, etc.
- **Primitives**: full shadcn-style set under `components/ui/` (button, card, dialog, form, table, sidebar, chart, calendar, etc.)

---

## 10. Feature summary (what the app is “for”)

1. **Devotee CRM** — profiles, family, extended metadata, documents, communications.  
2. **Visitors** — registration, check-in/out, passes/QR (API-backed).  
3. **Pujas & events** — bookings, temple events, public pages by slug, registrations, analytics.  
4. **Donations** — cash and in-kind, categories, receipts.  
5. **Accommodation** — multi-property rooms, bookings, waitlist, public booking.  
6. **Accounting** — full modular accounting + GST + financial reports.  
7. **Gurukul** — materials, courses, orders, student “my learning” portal.  
8. **Operations** — staff, inventory, kitchen/prasad, seva/volunteers, medical, cross-module reports hub.

---

## 11. Files not covered in detail

- **ESLint** — `eslint.config` / Next ESLint config  
- **Environment** — `.env.local` for Supabase URL/keys (not committed)  
- **Tests** — no dedicated test suite surfaced in this scan  
- **Middleware** — no `middleware.ts` present at repo root in this scan (auth gating is largely client/layout + Supabase)

---

*This document describes the repository structure as of the scan date. For exact column-level schema, refer to the SQL files in `supabase/migrations/` in chronological order.*
