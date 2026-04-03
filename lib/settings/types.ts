export interface AshramSettings {
  id: number
  // General
  ashram_name: string
  ashram_tagline: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  timezone: string
  logo_url: string | null
  favicon_url: string | null
  // Financial
  default_currency: 'INR' | 'USD' | 'GBP' | 'EUR' | 'AUD' | 'SGD' | 'CAD' | 'MYR'
  receipt_prefix_donation: string
  receipt_prefix_inkind: string
  receipt_prefix_booking: string
  gst_number: string | null
  pan_number: string | null
  bank_name: string | null
  bank_account_number: string | null
  bank_ifsc: string | null
  upi_id: string | null
  financial_year_start_month: number
  // Donations & Receipts
  auto_generate_receipts: boolean
  receipt_footer_message: string | null
  exemption_80g_number: string | null
  receipt_email_subject: string | null
  receipt_email_body: string | null
  // Accommodation
  default_checkin_time: string
  default_checkout_time: string
  late_checkout_fee: number
  booking_confirmation_msg: string | null
  // Notifications
  notify_email_new_booking: boolean
  notify_email_new_donation: boolean
  notify_email_visitor_checkin: boolean
  notify_wa_puja_confirmation: boolean
  notify_wa_accommodation: boolean
  notify_daily_digest: boolean
  // Public Pages
  public_slug: string | null
  is_public: boolean
  cover_image_url: string | null
  about_text: string | null
  seo_title: string | null
  seo_description: string | null
  social_facebook: string | null
  social_instagram: string | null
  social_youtube: string | null
  social_whatsapp_number: string | null
  // Integrations
  google_analytics_id: string | null
  razorpay_key_id: string | null
  smtp_host: string | null
  smtp_port: number | null
  smtp_from_email: string | null
  wa_display_name: string | null
  wa_phone_number_id: string | null
  updated_at: string
  updated_by: string | null
}

// ---- Roles & Access tab types ----
export interface UserWithRole {
  id: string
  email: string
  role: 'admin' | 'user'
  role_id: string | null
  role_name: string | null
  created_at: string
}

export interface GranularRole {
  id: string
  name: string
  description: string | null
}

export interface Permission {
  id: string
  module: string
  action: 'create' | 'read' | 'update' | 'delete'
}

export interface RolePermission {
  role_id: string
  permission_id: string
}
