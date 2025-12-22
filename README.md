# Ashram Management CRM

A comprehensive Customer Relationship Management system built for managing Ashram operations efficiently.

## Features

- **Authentication**: Secure password-based authentication using Supabase
  - User sign-up and login
  - Password reset functionality
  - Session management with cookies
- **Dashboard**: Clean and intuitive dashboard interface
- **Modern Stack**:
  - [Next.js](https://nextjs.org) with App Router
  - [Supabase](https://supabase.com) for authentication and database
  - [Tailwind CSS](https://tailwindcss.com) for styling
  - [shadcn/ui](https://ui.shadcn.com/) components

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase project (create one at [supabase.com](https://supabase.com))

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sheet-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```
   
   You can find these values in your [Supabase project settings](https://supabase.com/dashboard/project/_/settings/api).

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` - Next.js app router pages and routes
  - `auth/` - Authentication pages (login, sign-up, etc.)
  - `dashboard/` - Main dashboard interface
- `components/` - React components
  - `ui/` - shadcn/ui components
- `lib/` - Utility functions and Supabase clients
- `supabase/` - Database migrations

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Language**: TypeScript

## License

This project is private and proprietary.
