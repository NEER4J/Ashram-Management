"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { accommodationSettingsSchema, AccommodationSettingsValues } from "@/lib/settings/schema"
import { AshramSettings } from "@/lib/settings/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Loader2 } from "lucide-react"

interface Props {
  settings: AshramSettings
  onSave: (updates: Partial<AshramSettings>) => Promise<void>
}

// DB returns "HH:MM:SS" — strip seconds for <input type="time">
function toTimeInput(val: string) {
  return val ? val.slice(0, 5) : ""
}

export function AccommodationSettingsTab({ settings, onSave }: Props) {
  const [saving, setSaving] = useState(false)

  const form = useForm<AccommodationSettingsValues>({
    resolver: zodResolver(accommodationSettingsSchema),
    defaultValues: {
      default_checkin_time:    toTimeInput(settings.default_checkin_time),
      default_checkout_time:   toTimeInput(settings.default_checkout_time),
      late_checkout_fee:       settings.late_checkout_fee ?? 0,
      booking_confirmation_msg: settings.booking_confirmation_msg ?? "",
    },
  })

  async function onSubmit(data: AccommodationSettingsValues) {
    setSaving(true)
    // Append ":00" so Postgres time column accepts it
    await onSave({
      ...data,
      default_checkin_time:  data.default_checkin_time + ":00",
      default_checkout_time: data.default_checkout_time + ":00",
    })
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Accommodation Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Default check-in/out times and booking templates applied across all properties.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Check-in / Check-out</CardTitle>
              <CardDescription>These defaults apply when a property doesn't have its own times set.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="default_checkin_time" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Check-in Time</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="default_checkout_time" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Check-out Time</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="late_checkout_fee" render={({ field }) => (
                <FormItem>
                  <FormLabel>Late Check-out Fee (per hour)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                      <Input type="number" min="0" step="0.01" className="pl-7" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>Set to 0 to not charge for late check-outs.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Booking Confirmation Message</CardTitle>
              <CardDescription>Shown to devotees after their booking is confirmed.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField control={form.control} name="booking_confirmation_msg" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Your stay has been confirmed. Please bring a valid photo ID at check-in. Check-in time is 2:00 PM. Jai Hari Om!"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Accommodation Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
