"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { publicPagesSchema, PublicPagesValues } from "@/lib/settings/schema"
import { AshramSettings } from "@/lib/settings/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Loader2, Facebook, Instagram, Youtube, MessageCircle, ExternalLink } from "lucide-react"

interface Props {
  settings: AshramSettings
  onSave: (updates: Partial<AshramSettings>) => Promise<void>
}

export function PublicPagesTab({ settings, onSave }: Props) {
  const [saving, setSaving] = useState(false)

  const form = useForm<PublicPagesValues>({
    resolver: zodResolver(publicPagesSchema),
    defaultValues: {
      public_slug:            settings.public_slug ?? "",
      is_public:              settings.is_public ?? false,
      cover_image_url:        settings.cover_image_url ?? "",
      about_text:             settings.about_text ?? "",
      seo_title:              settings.seo_title ?? "",
      seo_description:        settings.seo_description ?? "",
      social_facebook:        settings.social_facebook ?? "",
      social_instagram:       settings.social_instagram ?? "",
      social_youtube:         settings.social_youtube ?? "",
      social_whatsapp_number: settings.social_whatsapp_number ?? "",
    },
  })

  const seoTitle       = form.watch("seo_title") ?? ""
  const seoDescription = form.watch("seo_description") ?? ""
  const publicSlug     = form.watch("public_slug") ?? ""
  const isPublic       = form.watch("is_public")

  async function onSubmit(data: PublicPagesValues) {
    setSaving(true)
    await onSave(data)
    setSaving(false)
  }

  const publicUrl = publicSlug ? `/a/${publicSlug}` : null

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Public Pages</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your public ashram profile, SEO metadata, and social media links.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Public Profile */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Public Ashram Profile</CardTitle>
              <CardDescription>
                Enable a public profile page for your ashram, accessible at{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">/a/your-slug</code>.
                Visitors can view your events, courses, and book accommodation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Public slug */}
              <FormField control={form.control} name="public_slug" render={({ field }) => (
                <FormItem>
                  <FormLabel>Public URL Slug</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-0">
                      <span className="inline-flex items-center px-3 h-9 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm select-none">
                        /a/
                      </span>
                      <Input
                        className="rounded-l-none"
                        placeholder="ananda-ashram"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                        }
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Only lowercase letters, numbers, and hyphens. This becomes your public URL.
                    {publicUrl && (
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        Preview <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              {/* is_public toggle */}
              <FormField control={form.control} name="is_public" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Make Profile Public</FormLabel>
                    <FormDescription>
                      When enabled, anyone with the URL can view your ashram&apos;s public profile.
                      {!publicSlug && " Set a slug above first."}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!publicSlug}
                    />
                  </FormControl>
                </FormItem>
              )} />

              {isPublic && publicUrl && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                  Your public profile is <strong>live</strong> at{" "}
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="underline font-medium">
                    {publicUrl}
                  </a>
                </div>
              )}

              {/* Cover image */}
              <FormField control={form.control} name="cover_image_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://your-storage.com/cover.jpg" {...field} />
                  </FormControl>
                  <FormDescription>
                    Shown as the hero image on your public profile. Recommended size: 1600×900px.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              {/* About text */}
              <FormField control={form.control} name="about_text" render={({ field }) => (
                <FormItem>
                  <FormLabel>About the Ashram</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of your ashram, its history, and its mission..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Displayed on your public profile page below the cover image.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Search Engine Optimisation</CardTitle>
              <CardDescription>Controls how your ashram appears in search results.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="seo_title" render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Page Title</FormLabel>
                    <span className={`text-xs tabular-nums ${seoTitle.length > 60 ? "text-red-500" : "text-muted-foreground"}`}>
                      {seoTitle.length}/60
                    </span>
                  </div>
                  <FormControl>
                    <Input placeholder="e.g. Shri Ram Ashram — A Sanctuary of Peace" {...field} />
                  </FormControl>
                  <FormDescription>Recommended: 50–60 characters. Shown in browser tabs and search results.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="seo_description" render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Meta Description</FormLabel>
                    <span className={`text-xs tabular-nums ${seoDescription.length > 160 ? "text-red-500" : "text-muted-foreground"}`}>
                      {seoDescription.length}/160
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. A spiritual retreat dedicated to devotion, service, and inner peace. Located in the foothills of the Himalayas."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Recommended: 120–160 characters. Shown beneath the title in search results.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Social Media</CardTitle>
              <CardDescription>Links shown in the footer of public pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="social_facebook" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Facebook className="h-3.5 w-3.5 text-[#1877F2]" />
                    Facebook
                  </FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://facebook.com/your-page" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="social_instagram" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Instagram className="h-3.5 w-3.5 text-[#E1306C]" />
                    Instagram
                  </FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://instagram.com/your-page" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="social_youtube" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Youtube className="h-3.5 w-3.5 text-[#FF0000]" />
                    YouTube
                  </FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://youtube.com/@your-channel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="social_whatsapp_number" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
                    WhatsApp Number
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="+919876543210" {...field} />
                  </FormControl>
                  <FormDescription>Include country code. Used to generate a wa.me link.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Public Page Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
