import { z } from "zod"

const optionalUrl = z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal(""))
const optionalEmail = z.string().email({ message: "Must be a valid email" }).optional().or(z.literal(""))
const optionalText = z.string().optional().or(z.literal(""))
const timeRegex = /^\d{2}:\d{2}$/

export const generalSchema = z.object({
  ashram_name: z.string().min(1, "Ashram name is required"),
  ashram_tagline: optionalText,
  address: optionalText,
  phone: optionalText,
  email: optionalEmail,
  website: optionalUrl,
  timezone: z.string().min(1, "Timezone is required"),
  logo_url: optionalText,
  favicon_url: optionalText,
})
export type GeneralValues = z.infer<typeof generalSchema>

export const financialSchema = z.object({
  default_currency: z.enum(['INR', 'USD', 'GBP', 'EUR', 'AUD', 'SGD', 'CAD', 'MYR']),
  receipt_prefix_donation: z.string().min(1, "Required"),
  receipt_prefix_inkind: z.string().min(1, "Required"),
  receipt_prefix_booking: z.string().min(1, "Required"),
  gst_number: optionalText,
  pan_number: optionalText,
  bank_name: optionalText,
  bank_account_number: optionalText,
  bank_ifsc: optionalText,
  upi_id: optionalText,
  financial_year_start_month: z.coerce.number().int().min(1).max(12),
})
export type FinancialValues = z.infer<typeof financialSchema>

export const donationsReceiptsSchema = z.object({
  auto_generate_receipts: z.boolean(),
  receipt_footer_message: optionalText,
  exemption_80g_number: optionalText,
  receipt_email_subject: optionalText,
  receipt_email_body: optionalText,
})
export type DonationsReceiptsValues = z.infer<typeof donationsReceiptsSchema>

export const accommodationSettingsSchema = z.object({
  default_checkin_time: z.string().regex(timeRegex, "Must be HH:MM format"),
  default_checkout_time: z.string().regex(timeRegex, "Must be HH:MM format"),
  late_checkout_fee: z.coerce.number().min(0, "Must be 0 or more"),
  booking_confirmation_msg: optionalText,
})
export type AccommodationSettingsValues = z.infer<typeof accommodationSettingsSchema>

export const publicPagesSchema = z.object({
  public_slug: z
    .string()
    .max(60, "Slug must be under 60 characters")
    .regex(/^[a-z0-9-]*$/, "Only lowercase letters, numbers, and hyphens allowed")
    .optional()
    .or(z.literal("")),
  is_public: z.boolean(),
  cover_image_url: optionalUrl,
  about_text: optionalText,
  seo_title: z.string().max(60, "SEO title should be under 60 characters").optional().or(z.literal("")),
  seo_description: z.string().max(160, "SEO description should be under 160 characters").optional().or(z.literal("")),
  social_facebook: optionalUrl,
  social_instagram: optionalUrl,
  social_youtube: optionalUrl,
  social_whatsapp_number: optionalText,
})
export type PublicPagesValues = z.infer<typeof publicPagesSchema>

export const integrationsSchema = z.object({
  google_analytics_id: optionalText,
  razorpay_key_id: optionalText,
  smtp_host: optionalText,
  smtp_port: z.coerce.number().int().min(1).max(65535).optional().or(z.literal(0)),
  smtp_from_email: optionalEmail,
  wa_display_name: optionalText,
  wa_phone_number_id: optionalText,
})
export type IntegrationsValues = z.infer<typeof integrationsSchema>
