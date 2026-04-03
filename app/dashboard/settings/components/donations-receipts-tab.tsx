"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { donationsReceiptsSchema, DonationsReceiptsValues } from "@/lib/settings/schema"
import { AshramSettings } from "@/lib/settings/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Loader2, Info } from "lucide-react"

interface Props {
  settings: AshramSettings
  onSave: (updates: Partial<AshramSettings>) => Promise<void>
}

export function DonationsReceiptsTab({ settings, onSave }: Props) {
  const [saving, setSaving] = useState(false)

  const form = useForm<DonationsReceiptsValues>({
    resolver: zodResolver(donationsReceiptsSchema),
    defaultValues: {
      auto_generate_receipts:  settings.auto_generate_receipts,
      receipt_footer_message:  settings.receipt_footer_message ?? "",
      exemption_80g_number:    settings.exemption_80g_number ?? "",
      receipt_email_subject:   settings.receipt_email_subject ?? "",
      receipt_email_body:      settings.receipt_email_body ?? "",
    },
  })

  async function onSubmit(data: DonationsReceiptsValues) {
    setSaving(true)
    await onSave(data)
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Donations & Receipts</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure receipt generation, 80G details, and email templates.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Receipt Generation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Receipt Generation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="auto_generate_receipts" render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">Auto-generate receipts</FormLabel>
                    <FormDescription>Automatically generate a receipt PDF for every new donation</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="exemption_80g_number" render={({ field }) => (
                <FormItem>
                  <FormLabel>80G Exemption Number</FormLabel>
                  <FormControl><Input placeholder="AAAAA0000AA20221" {...field} /></FormControl>
                  <FormDescription>Printed on receipts for income tax exemption claims.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="receipt_footer_message" render={({ field }) => (
                <FormItem>
                  <FormLabel>Receipt Footer Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. This donation is eligible for 80G tax exemption. Thank you for your generous contribution. Jai Shri Ram."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Email Template */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Receipt Email Template</CardTitle>
              <CardDescription>Sent to the donor when a receipt is generated.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs text-blue-800">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>
                  Use these placeholders in subject and body:{" "}
                  <code className="font-mono bg-blue-100 px-1 rounded">{"{{ashram_name}}"}</code>{" "}
                  <code className="font-mono bg-blue-100 px-1 rounded">{"{{donor_name}}"}</code>{" "}
                  <code className="font-mono bg-blue-100 px-1 rounded">{"{{amount}}"}</code>{" "}
                  <code className="font-mono bg-blue-100 px-1 rounded">{"{{receipt_number}}"}</code>{" "}
                  <code className="font-mono bg-blue-100 px-1 rounded">{"{{donation_date}}"}</code>
                </span>
              </div>

              <FormField control={form.control} name="receipt_email_subject" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Your donation receipt from {{ashram_name}}" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="receipt_email_body" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Body</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Dear {{donor_name}},\n\nThank you for your generous donation of {{amount}} on {{donation_date}}.\n\nYour receipt number is {{receipt_number}}.\n\nWith gratitude,\n{{ashram_name}}`}
                      rows={8}
                      className="font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Plain text only. Receipt PDF is attached automatically.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Receipt Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
