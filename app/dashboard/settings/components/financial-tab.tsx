"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { financialSchema, FinancialValues } from "@/lib/settings/schema"
import { AshramSettings } from "@/lib/settings/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Loader2 } from "lucide-react"

const CURRENCIES = [
  { value: "INR", label: "₹ INR – Indian Rupee" },
  { value: "USD", label: "$ USD – US Dollar" },
  { value: "GBP", label: "£ GBP – British Pound" },
  { value: "EUR", label: "€ EUR – Euro" },
  { value: "AUD", label: "A$ AUD – Australian Dollar" },
  { value: "SGD", label: "S$ SGD – Singapore Dollar" },
  { value: "CAD", label: "C$ CAD – Canadian Dollar" },
  { value: "MYR", label: "RM MYR – Malaysian Ringgit" },
]

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" },   { value: 4, label: "April" },
  { value: 5, label: "May" },     { value: 6, label: "June" },
  { value: 7, label: "July" },    { value: 8, label: "August" },
  { value: 9, label: "September"},{ value: 10, label: "October" },
  { value: 11, label: "November"},{ value: 12, label: "December" },
]

interface Props {
  settings: AshramSettings
  onSave: (updates: Partial<AshramSettings>) => Promise<void>
}

export function FinancialTab({ settings, onSave }: Props) {
  const [saving, setSaving] = useState(false)

  const form = useForm<FinancialValues>({
    resolver: zodResolver(financialSchema),
    defaultValues: {
      default_currency:           settings.default_currency,
      receipt_prefix_donation:    settings.receipt_prefix_donation,
      receipt_prefix_inkind:      settings.receipt_prefix_inkind,
      receipt_prefix_booking:     settings.receipt_prefix_booking,
      gst_number:                 settings.gst_number ?? "",
      pan_number:                 settings.pan_number ?? "",
      bank_name:                  settings.bank_name ?? "",
      bank_account_number:        settings.bank_account_number ?? "",
      bank_ifsc:                  settings.bank_ifsc ?? "",
      upi_id:                     settings.upi_id ?? "",
      financial_year_start_month: settings.financial_year_start_month,
    },
  })

  async function onSubmit(data: FinancialValues) {
    setSaving(true)
    await onSave(data)
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Financial Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Currency, receipt numbering, bank details, and fiscal year configuration.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Currency & Fiscal Year */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Currency & Fiscal Year</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="default_currency" render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Currency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {CURRENCIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormDescription>Used as default in all donation, booking, and expense forms.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="financial_year_start_month" render={({ field }) => (
                <FormItem>
                  <FormLabel>Financial Year Start Month</FormLabel>
                  <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {MONTHS.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormDescription>In India, the financial year starts in April.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Receipt Numbering */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Receipt Number Prefixes</CardTitle>
              <CardDescription>Auto-generated receipt numbers use these prefixes.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField control={form.control} name="receipt_prefix_donation" render={({ field }) => (
                <FormItem>
                  <FormLabel>Donations</FormLabel>
                  <FormControl><Input placeholder="DON-" {...field} /></FormControl>
                  <FormDescription className="text-[10px]">e.g. DON-2026-0001</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="receipt_prefix_inkind" render={({ field }) => (
                <FormItem>
                  <FormLabel>In-Kind</FormLabel>
                  <FormControl><Input placeholder="IKD-" {...field} /></FormControl>
                  <FormDescription className="text-[10px]">e.g. IKD-2026-0001</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="receipt_prefix_booking" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bookings</FormLabel>
                  <FormControl><Input placeholder="BKG-" {...field} /></FormControl>
                  <FormDescription className="text-[10px]">e.g. BKG-2026-0001</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Tax Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tax & Registration</CardTitle>
              <CardDescription>Printed on receipts and invoices.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="gst_number" render={({ field }) => (
                <FormItem>
                  <FormLabel>GST Number</FormLabel>
                  <FormControl><Input placeholder="22AAAAA0000A1Z5" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="pan_number" render={({ field }) => (
                <FormItem>
                  <FormLabel>PAN Number</FormLabel>
                  <FormControl><Input placeholder="AAAAA0000A" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Bank & Payment Details</CardTitle>
              <CardDescription>Shown on donation receipts for NEFT/IMPS transfers and UPI payments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="bank_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl><Input placeholder="State Bank of India" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bank_ifsc" render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFSC Code</FormLabel>
                    <FormControl><Input placeholder="SBIN0001234" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="bank_account_number" render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl><Input placeholder="XXXXXXXXXXXX" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="upi_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>UPI ID</FormLabel>
                  <FormControl><Input placeholder="ashram@upi" {...field} /></FormControl>
                  <FormDescription>Shown as QR code on digital receipts.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Financial Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
