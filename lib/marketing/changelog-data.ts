export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: {
    type: "new" | "improved" | "fixed";
    text: string;
  }[];
}

export const changelogEntries: ChangelogEntry[] = [
  {
    version: "v2.4",
    date: "April 2026",
    title: "Ashram Settings & Public Pages",
    changes: [
      { type: "new", text: "Ashram Settings page with tabs for General, Financial, Accommodation, Donations, Public Pages, Notifications, Integrations, and Roles & Access" },
      { type: "new", text: "Public ashram profile page (/a/[slug]) for multi-tenant support" },
      { type: "new", text: "Complete marketing site redesign with Red/White/Black theme" },
      { type: "improved", text: "Header mega menu expanded with Solutions and Resources dropdowns" },
      { type: "improved", text: "Footer redesigned as dark mega footer with 5 link columns" },
    ],
  },
  {
    version: "v2.3",
    date: "March 2026",
    title: "Module Enhancements & Medical",
    changes: [
      { type: "new", text: "Medical module: Emergency contacts, Medical camps, Wellness records, First aid log" },
      { type: "new", text: "Visitor analytics with check-in trends and demographics" },
      { type: "new", text: "Seva badges — automatically award achievement badges to volunteers" },
      { type: "improved", text: "Devotee profile now shows donation history, event attendance, and seva contributions" },
      { type: "fixed", text: "GST return filing date was not saving timezone correctly" },
    ],
  },
  {
    version: "v2.2",
    date: "February 2026",
    title: "Accommodation & Inventory",
    changes: [
      { type: "new", text: "Full accommodation module: Properties, rooms, bookings, and waitlist management" },
      { type: "new", text: "Inventory system with items, locations, purchase orders, transfers, and religious items tracking" },
      { type: "new", text: "Kitchen & Prasad module: Meal planning, tokens, Prasad bookings, Annadaan tracking" },
      { type: "improved", text: "Accounting module now supports multi-bank reconciliation" },
      { type: "fixed", text: "In-kind donation receipts were generating with incorrect dates" },
    ],
  },
  {
    version: "v2.1",
    date: "January 2026",
    title: "Staff, Seva & Volunteers",
    changes: [
      { type: "new", text: "Staff & Priests directory with departments and attendance tracking" },
      { type: "new", text: "Seva & Volunteers module: Opportunities, shifts, assignments, and volunteer profiles" },
      { type: "new", text: "Role-based access control: Admin, Accountant, Event Coordinator, Volunteer Coordinator" },
      { type: "improved", text: "Dashboard home redesigned with quick-action shortcuts" },
    ],
  },
  {
    version: "v2.0",
    date: "December 2025",
    title: "Full Accounting & Dynamic Events",
    changes: [
      { type: "new", text: "Complete double-entry accounting: Chart of accounts, General ledger, Journal entries" },
      { type: "new", text: "GST management: GSTR-1, GSTR-3B, and annual GST reports" },
      { type: "new", text: "Dynamic events system: Custom fields, QR check-in, registration management" },
      { type: "new", text: "Financial reports: P&L, Balance Sheet, Cash Flow, Trial Balance" },
      { type: "improved", text: "Donation receipts: 80G tax-exempt receipts with PDF generation" },
    ],
  },
  {
    version: "v1.0",
    date: "January 2025",
    title: "Initial Launch",
    changes: [
      { type: "new", text: "Devotee management: Registry, profiles, family relationships" },
      { type: "new", text: "Donations: Cash and in-kind, donor history" },
      { type: "new", text: "Events: Create, publish, and manage event registrations" },
      { type: "new", text: "Gurukul: Study materials, courses, and student portal" },
      { type: "new", text: "Authentication: Email/password login, role-based access" },
    ],
  },
];
