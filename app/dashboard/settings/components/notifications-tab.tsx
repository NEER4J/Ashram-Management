"use client"

import { useState } from "react"
import { AshramSettings } from "@/lib/settings/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Mail, MessageCircle, Clock } from "lucide-react"

interface Props {
  settings: AshramSettings
  onSave: (updates: Partial<AshramSettings>) => Promise<void>
}

type BooleanKey = 'notify_email_new_booking' | 'notify_email_new_donation' |
  'notify_email_visitor_checkin' | 'notify_wa_puja_confirmation' |
  'notify_wa_accommodation' | 'notify_daily_digest'

export function NotificationsTab({ settings, onSave }: Props) {
  const [state, setState] = useState({
    notify_email_new_booking:     settings.notify_email_new_booking,
    notify_email_new_donation:    settings.notify_email_new_donation,
    notify_email_visitor_checkin: settings.notify_email_visitor_checkin,
    notify_wa_puja_confirmation:  settings.notify_wa_puja_confirmation,
    notify_wa_accommodation:      settings.notify_wa_accommodation,
    notify_daily_digest:          settings.notify_daily_digest,
  })

  const handleToggle = async (key: BooleanKey, value: boolean) => {
    setState(prev => ({ ...prev, [key]: value }))
    await onSave({ [key]: value })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Notifications</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure which events trigger email or WhatsApp alerts. Changes auto-save.
        </p>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#3c0212]" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Sent to the admin email address configured in General settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationRow
            id="notify_email_new_booking"
            label="New accommodation booking"
            description="When a devotee creates a new accommodation booking"
            checked={state.notify_email_new_booking}
            onCheckedChange={(v) => handleToggle("notify_email_new_booking", v)}
          />
          <Separator />
          <NotificationRow
            id="notify_email_new_donation"
            label="New donation received"
            description="When a new cash or in-kind donation is recorded"
            checked={state.notify_email_new_donation}
            onCheckedChange={(v) => handleToggle("notify_email_new_donation", v)}
          />
          <Separator />
          <NotificationRow
            id="notify_email_visitor_checkin"
            label="Visitor check-in"
            description="When a visitor checks in at the main gate"
            checked={state.notify_email_visitor_checkin}
            onCheckedChange={(v) => handleToggle("notify_email_visitor_checkin", v)}
          />
        </CardContent>
      </Card>

      {/* WhatsApp Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-[#3c0212]" />
            WhatsApp Notifications
          </CardTitle>
          <CardDescription>
            Requires WhatsApp Business API configured in Integrations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationRow
            id="notify_wa_puja_confirmation"
            label="Puja booking confirmation"
            description="Send WhatsApp confirmation when a puja booking is confirmed"
            checked={state.notify_wa_puja_confirmation}
            onCheckedChange={(v) => handleToggle("notify_wa_puja_confirmation", v)}
          />
          <Separator />
          <NotificationRow
            id="notify_wa_accommodation"
            label="Accommodation booking confirmation"
            description="Send WhatsApp confirmation when an accommodation booking is made"
            checked={state.notify_wa_accommodation}
            onCheckedChange={(v) => handleToggle("notify_wa_accommodation", v)}
          />
        </CardContent>
      </Card>

      {/* Daily Digest */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#3c0212]" />
            Daily Digest
          </CardTitle>
          <CardDescription>
            A morning summary email with the day's bookings, donations, and visitor count.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationRow
            id="notify_daily_digest"
            label="Send daily digest email"
            description="Delivered at 7:00 AM IST to the admin email"
            checked={state.notify_daily_digest}
            onCheckedChange={(v) => handleToggle("notify_daily_digest", v)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function NotificationRow({
  id, label, description, checked, onCheckedChange
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
