"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { generalSchema, GeneralValues } from "@/lib/settings/schema"
import { AshramSettings } from "@/lib/settings/types"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Loader2, Upload, X, Globe, Phone, Mail, MapPin } from "lucide-react"
import { toast } from "sonner"

const TIMEZONES = [
  { value: "Asia/Kolkata",    label: "IST – India (Asia/Kolkata)" },
  { value: "UTC",             label: "UTC" },
  { value: "America/New_York",label: "EST – New York" },
  { value: "America/Chicago", label: "CST – Chicago" },
  { value: "America/Los_Angeles","label": "PST – Los Angeles" },
  { value: "Europe/London",   label: "GMT – London" },
  { value: "Europe/Paris",    label: "CET – Paris" },
  { value: "Asia/Dubai",      label: "GST – Dubai" },
  { value: "Asia/Singapore",  label: "SGT – Singapore" },
  { value: "Asia/Kuala_Lumpur","label": "MYT – Kuala Lumpur" },
  { value: "Australia/Sydney","label": "AEDT – Sydney" },
]

interface Props {
  settings: AshramSettings
  onSave: (updates: Partial<AshramSettings>) => Promise<void>
}

export function GeneralTab({ settings, onSave }: Props) {
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const supabase = createClient()

  const form = useForm<GeneralValues>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      ashram_name:    settings.ashram_name,
      ashram_tagline: settings.ashram_tagline ?? "",
      address:        settings.address ?? "",
      phone:          settings.phone ?? "",
      email:          settings.email ?? "",
      website:        settings.website ?? "",
      timezone:       settings.timezone,
      logo_url:       settings.logo_url ?? "",
      favicon_url:    settings.favicon_url ?? "",
    },
  })

  async function uploadImage(file: File, type: "logo" | "favicon") {
    const setter = type === "logo" ? setUploadingLogo : setUploadingFavicon
    setter(true)
    try {
      const ext = file.name.split(".").pop()
      const path = `branding/${type}-${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from("ashram-settings")
        .upload(path, file, { upsert: true })
      if (error) { toast.error(`Failed to upload ${type}`); return }
      const { data } = supabase.storage.from("ashram-settings").getPublicUrl(path)
      form.setValue(type === "logo" ? "logo_url" : "favicon_url", data.publicUrl)
      toast.success(`${type === "logo" ? "Logo" : "Favicon"} uploaded`)
    } finally {
      setter(false)
    }
  }

  async function onSubmit(data: GeneralValues) {
    setSaving(true)
    await onSave(data)
    setSaving(false)
  }

  const logoUrl    = form.watch("logo_url")
  const faviconUrl = form.watch("favicon_url")

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">General Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Basic ashram identity, contact information, and locale.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Identity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ashram Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="ashram_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ashram Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input placeholder="e.g. Shri Ram Ashram" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="ashram_tagline" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tagline</FormLabel>
                  <FormControl><Input placeholder="e.g. Serving humanity through devotion" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Branding</CardTitle>
              <CardDescription>Logo appears on receipts and public pages. Favicon in browser tabs.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Logo */}
              <div className="space-y-2">
                <Label>Logo</Label>
                {logoUrl ? (
                  <div className="relative w-full h-24 rounded-lg border overflow-hidden bg-muted/30">
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                    <button
                      type="button"
                      onClick={() => form.setValue("logo_url", "")}
                      className="absolute top-1 right-1 rounded-full bg-white/90 p-0.5 shadow hover:bg-white"
                    >
                      <X className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                    {uploadingLogo ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (
                      <>
                        <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Upload logo</span>
                      </>
                    )}
                    <input type="file" className="hidden" accept="image/*" disabled={uploadingLogo}
                      onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "logo")} />
                  </label>
                )}
              </div>

              {/* Favicon */}
              <div className="space-y-2">
                <Label>Favicon</Label>
                {faviconUrl ? (
                  <div className="relative w-full h-24 rounded-lg border overflow-hidden bg-muted/30">
                    <img src={faviconUrl} alt="Favicon" className="w-full h-full object-contain p-2" />
                    <button
                      type="button"
                      onClick={() => form.setValue("favicon_url", "")}
                      className="absolute top-1 right-1 rounded-full bg-white/90 p-0.5 shadow hover:bg-white"
                    >
                      <X className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                    {uploadingFavicon ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (
                      <>
                        <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Upload favicon</span>
                        <span className="text-[10px] text-muted-foreground/60">PNG, SVG, ICO</span>
                      </>
                    )}
                    <input type="file" className="hidden" accept="image/x-icon,image/png,image/svg+xml" disabled={uploadingFavicon}
                      onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "favicon")} />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contact Information</CardTitle>
              <CardDescription>Displayed on public pages and donation receipts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Full ashram address" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />Phone</FormLabel>
                    <FormControl><Input placeholder="+91-XXXXXXXXXX" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />Email</FormLabel>
                    <FormControl><Input type="email" placeholder="info@ashram.org" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="website" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" />Website</FormLabel>
                  <FormControl><Input type="url" placeholder="https://www.ashram.org" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Locale */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Locale</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField control={form.control} name="timezone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIMEZONES.map(tz => (
                        <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Used for date/time display and scheduled notifications.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save General Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
