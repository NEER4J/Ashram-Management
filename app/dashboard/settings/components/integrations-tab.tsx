"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { integrationsSchema, IntegrationsValues } from "@/lib/settings/schema"
import { AshramSettings } from "@/lib/settings/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Loader2, ShieldAlert, BarChart3, CreditCard, Mail, MessageCircle } from "lucide-react"

interface Props {
  settings: AshramSettings
  onSave: (updates: Partial<AshramSettings>) => Promise<void>
}

function EnvVarNotice({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
      <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
      <span>
        <strong>{name}</strong> is managed via environment variables and is never stored in the database.
      </span>
    </div>
  )
}

export function IntegrationsTab({ settings, onSave }: Props) {
  const [saving, setSaving] = useState(false)

  const form = useForm<IntegrationsValues>({
    resolver: zodResolver(integrationsSchema),
    defaultValues: {
      google_analytics_id:  settings.google_analytics_id ?? "",
      razorpay_key_id:      settings.razorpay_key_id ?? "",
      smtp_host:            settings.smtp_host ?? "",
      smtp_port:            settings.smtp_port ?? 587,
      smtp_from_email:      settings.smtp_from_email ?? "",
      wa_display_name:      settings.wa_display_name ?? "",
      wa_phone_number_id:   settings.wa_phone_number_id ?? "",
    },
  })

  async function onSubmit(data: IntegrationsValues) {
    setSaving(true)
    await onSave(data)
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Integrations</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Connect third-party services. Secret keys are managed via environment variables and are never stored in the database.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Google Analytics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#F9AB00]" />
                Google Analytics
              </CardTitle>
              <CardDescription>Track page views and visitor behaviour on public pages.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField control={form.control} name="google_analytics_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Measurement ID</FormLabel>
                  <FormControl>
                    <Input placeholder="G-XXXXXXXXXX" {...field} />
                  </FormControl>
                  <FormDescription>Found in GA4 → Admin → Data Streams → your stream.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Razorpay */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#3395FF]" />
                Razorpay
              </CardTitle>
              <CardDescription>Accept online donations and booking payments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="razorpay_key_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Public Key ID</FormLabel>
                  <FormControl>
                    <Input placeholder="rzp_live_XXXXXXXXXXXX" {...field} />
                  </FormControl>
                  <FormDescription>Starts with <code className="font-mono text-xs bg-muted px-1 rounded">rzp_live_</code> (production) or <code className="font-mono text-xs bg-muted px-1 rounded">rzp_test_</code> (sandbox).</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <EnvVarNotice name="RAZORPAY_SECRET" />
            </CardContent>
          </Card>

          {/* SMTP / Email */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#3c0212]" />
                Email (SMTP)
              </CardTitle>
              <CardDescription>Used to send donation receipts and booking confirmations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField control={form.control} name="smtp_host" render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>SMTP Host</FormLabel>
                    <FormControl>
                      <Input placeholder="smtp.gmail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="smtp_port" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="587" {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="smtp_from_email" render={({ field }) => (
                <FormItem>
                  <FormLabel>From Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="noreply@ashram.org" {...field} />
                  </FormControl>
                  <FormDescription>The sender address shown to recipients.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <EnvVarNotice name="SMTP_PASSWORD" />
            </CardContent>
          </Card>

          {/* WhatsApp Business */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                WhatsApp Business API
              </CardTitle>
              <CardDescription>Send automated confirmations via Meta's WhatsApp Business API.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="wa_display_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Shri Ram Ashram" {...field} />
                  </FormControl>
                  <FormDescription>Name shown to message recipients.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="wa_phone_number_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number ID</FormLabel>
                  <FormControl>
                    <Input placeholder="123456789012345" {...field} />
                  </FormControl>
                  <FormDescription>Found in Meta for Developers → WhatsApp → API Setup.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <EnvVarNotice name="WHATSAPP_TOKEN" />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Integration Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
