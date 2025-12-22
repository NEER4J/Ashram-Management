export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            devotees: {
                Row: {
                    id: string
                    devotee_code: string | null
                    first_name: string
                    middle_name: string | null
                    last_name: string | null
                    email: string | null
                    mobile_number: string
                    whatsapp_number: string | null
                    gender: "Male" | "Female" | "Other" | null
                    date_of_birth: string | null
                    address_line_1: string | null
                    address_line_2: string | null
                    city: string | null
                    state: string | null
                    country: string | null
                    pincode: string | null
                    gotra: string | null
                    nakshatra: string | null
                    rashi: string | null
                    membership_type: string | null
                    membership_status: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    devotee_code?: string | null
                    first_name: string
                    middle_name?: string | null
                    last_name?: string | null
                    email?: string | null
                    mobile_number: string
                    whatsapp_number?: string | null
                    gender?: "Male" | "Female" | "Other" | null
                    date_of_birth?: string | null
                    address_line_1?: string | null
                    address_line_2?: string | null
                    city?: string | null
                    state?: string | null
                    country?: string | null
                    pincode?: string | null
                    gotra?: string | null
                    nakshatra?: string | null
                    rashi?: string | null
                    membership_type?: string | null
                    membership_status?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    devotee_code?: string | null
                    first_name?: string
                    middle_name?: string | null
                    last_name?: string | null
                    email?: string | null
                    mobile_number?: string
                    whatsapp_number?: string | null
                    gender?: "Male" | "Female" | "Other" | null
                    date_of_birth?: string | null
                    address_line_1?: string | null
                    address_line_2?: string | null
                    city?: string | null
                    state?: string | null
                    country?: string | null
                    pincode?: string | null
                    gotra?: string | null
                    nakshatra?: string | null
                    rashi?: string | null
                    membership_type?: string | null
                    membership_status?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            master_nakshatras: {
                Row: {
                    id: string
                    name: string
                }
                Insert: {
                    id?: string
                    name: string
                }
                Update: {
                    id?: string
                    name?: string
                }
            }
            master_rashis: {
                Row: {
                    id: string
                    name: string
                }
                Insert: {
                    id?: string
                    name: string
                }
                Update: {
                    id?: string
                    name?: string
                }
            }
            master_gotras: {
                Row: {
                    id: string
                    name: string
                }
                Insert: {
                    id?: string
                    name: string
                }
                Update: {
                    id?: string
                    name?: string
                }
            }
            master_donation_categories: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    is_80g_eligible: boolean
                    is_active: boolean
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    is_80g_eligible?: boolean
                    is_active?: boolean
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    is_80g_eligible?: boolean
                    is_active?: boolean
                }
            }
            donations: {
                Row: {
                    id: string
                    donation_code: string | null
                    devotee_id: string | null
                    donation_date: string
                    amount: number
                    category_id: string | null
                    purpose: string | null
                    payment_mode: string
                    transaction_ref: string | null
                    payment_status: string | null
                    receipt_generated: boolean | null
                    created_at: string
                    created_by: string | null
                }
                Insert: {
                    id?: string
                    donation_code?: string | null
                    devotee_id?: string | null
                    donation_date?: string
                    amount: number
                    category_id?: string | null
                    purpose?: string | null
                    payment_mode: string
                    transaction_ref?: string | null
                    payment_status?: string | null
                    receipt_generated?: boolean | null
                    created_at?: string
                    created_by?: string | null
                }
                Update: {
                    id?: string
                    donation_code?: string | null
                    devotee_id?: string | null
                    donation_date?: string
                    amount?: number
                    category_id?: string | null
                    purpose?: string | null
                    payment_mode?: string
                    transaction_ref?: string | null
                    payment_status?: string | null
                    receipt_generated?: boolean | null
                    created_at?: string
                    created_by?: string | null
                }
            }
            // Add other tables as needed based on usage, keeping it minimal for now to save tokens
        }
    }
}
