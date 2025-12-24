"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  BookOpen,
  FileSpreadsheet,
  Calculator,
  Building2,
  Users,
  Receipt,
  FileText,
  DollarSign,
  TrendingUp,
  Scale,
  Banknote,
  Wallet,
  ArrowRight
} from "lucide-react"

export default function AccountingPage() {
  const accountingModules = [
    {
      title: "Donations",
      description: "Track and manage temple donations",
      icon: Banknote,
      href: "/dashboard/donations",
      color: "text-green-600"
    },
    {
      title: "Chart of Accounts",
      description: "Manage your accounting account structure",
      icon: BookOpen,
      href: "/dashboard/accounting/chart-of-accounts",
      color: "text-blue-600"
    },
    {
      title: "General Ledger",
      description: "View all accounting transactions",
      icon: FileSpreadsheet,
      href: "/dashboard/accounting/general-ledger",
      color: "text-purple-600"
    },
    {
      title: "Journal Entries",
      description: "Create manual accounting entries",
      icon: Calculator,
      href: "/dashboard/accounting/journal-entries",
      color: "text-orange-600"
    },
    {
      title: "Bank Accounts",
      description: "Manage bank accounts and reconciliation",
      icon: Building2,
      href: "/dashboard/accounting/bank-accounts",
      color: "text-indigo-600"
    },
    {
      title: "Vendors",
      description: "Manage vendor and supplier information",
      icon: Users,
      href: "/dashboard/accounting/vendors",
      color: "text-teal-600"
    },
    {
      title: "Bills (Payable)",
      description: "Track vendor bills and payments",
      icon: Receipt,
      href: "/dashboard/accounting/bills",
      color: "text-red-600"
    },
    {
      title: "Invoices (Receivable)",
      description: "Manage customer invoices and payments",
      icon: FileText,
      href: "/dashboard/accounting/invoices",
      color: "text-pink-600"
    },
    {
      title: "Expenses",
      description: "Track and manage expenses with GST",
      icon: DollarSign,
      href: "/dashboard/accounting/expenses",
      color: "text-yellow-600"
    },
    {
      title: "Budgets",
      description: "Set and track budgets",
      icon: TrendingUp,
      href: "/dashboard/accounting/budgets",
      color: "text-cyan-600"
    },
    {
      title: "GST Management",
      description: "Manage GST returns and filing",
      icon: Receipt,
      href: "/dashboard/accounting/gst",
      color: "text-amber-600"
    },
    {
      title: "Financial Reports",
      description: "Generate financial statements and reports",
      icon: Scale,
      href: "/dashboard/accounting/reports",
      color: "text-emerald-600"
    },
  ]

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div>
        <h2 className="text-3xl font-medium tracking-tight">Accounting & Finance</h2>
        <p className="text-muted-foreground">
          Complete accounting and financial management system for your ashram.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accountingModules.map((module) => (
          <Card key={module.href} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <module.icon className={`h-8 w-8 ${module.color}`} />
                <div className="flex-1">
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription className="mt-1">{module.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full" style={{ borderColor: "#3c0212" }}>
                <Link href={module.href} className="flex items-center justify-between">
                  <span>Open</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

