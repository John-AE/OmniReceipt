export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          total_price: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          amount_paid: number | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          invoice_date: string
          invoice_jpeg_url: string | null
          invoice_number: string
          partial_payment_count: number | null
          payment_date: string | null
          receipt_generated_at: string | null
          receipt_jpeg_url: string | null
          receipt_template_id: number | null
          record_type: string | null
          service_description: string
          status: string
          sub_total: number | null
          tax_rate: number | null
          template_id: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          amount_paid?: number | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          invoice_date?: string
          invoice_jpeg_url?: string | null
          invoice_number?: string
          partial_payment_count?: number | null
          payment_date?: string | null
          receipt_generated_at?: string | null
          receipt_jpeg_url?: string | null
          receipt_template_id?: number | null
          record_type?: string | null
          service_description: string
          status?: string
          sub_total?: number | null
          tax_rate?: number | null
          template_id?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          amount_paid?: number | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          invoice_date?: string
          invoice_jpeg_url?: string | null
          invoice_number?: string
          partial_payment_count?: number | null
          payment_date?: string | null
          receipt_generated_at?: string | null
          receipt_jpeg_url?: string | null
          receipt_template_id?: number | null
          record_type?: string | null
          service_description?: string
          status?: string
          sub_total?: number | null
          tax_rate?: number | null
          template_id?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partial_payments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          invoice_id: string
          payment_amount: number
          payment_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          invoice_id: string
          payment_amount: number
          payment_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          invoice_id?: string
          payment_amount?: number
          payment_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partial_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          payment_response: Json | null
          plan_type: string
          reference: string
          status: string
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          paystack_response?: Json | null
          plan_type: string
          reference: string
          status: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          paystack_response?: Json | null
          plan_type?: string
          reference?: string
          status?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      price_list_items: {
        Row: {
          category: string | null
          created_at: string
          id: string
          item_name: string
          note: string | null
          position: number | null
          price: number
          price_list_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          item_name: string
          note?: string | null
          position?: number | null
          price: number
          price_list_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          item_name?: string
          note?: string | null
          position?: number | null
          price?: number
          price_list_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_list_items_price_list_id_fkey"
            columns: ["price_list_id"]
            isOneToOne: false
            referencedRelation: "price_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      price_lists: {
        Row: {
          accent_color: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          primary_color: string | null
          show_email: boolean | null
          show_phone: boolean | null
          show_whatsapp: boolean | null
          slug: string
          template: string | null
          title: string
          updated_at: string
          user_id: string
          views: number | null
          whatsapp: string | null
        }
        Insert: {
          accent_color?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          show_email?: boolean | null
          show_phone?: boolean | null
          show_whatsapp?: boolean | null
          slug: string
          template?: string | null
          title: string
          updated_at?: string
          user_id: string
          views?: number | null
          whatsapp?: string | null
        }
        Update: {
          accent_color?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          show_email?: boolean | null
          show_phone?: boolean | null
          show_whatsapp?: boolean | null
          slug?: string
          template?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          views?: number | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          artisan_name: string
          business_address: string | null
          business_name: string | null
          created_at: string
          currency: string
          email: string | null
          id: string
          invoice_count: number
          last_payment_date: string | null
          last_payment_reference: string | null
          logo_url: string | null
          passcode_hash: string | null
          payment_verified: boolean | null
          phone: string
          receipt_count: number
          referral_source: string | null
          role: string | null
          subscription_expires: string | null
          subscription_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artisan_name: string
          business_address?: string | null
          business_name?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          id?: string
          invoice_count?: number
          last_payment_date?: string | null
          last_payment_reference?: string | null
          logo_url?: string | null
          passcode_hash?: string | null
          payment_verified?: boolean | null
          phone: string
          receipt_count?: number
          referral_source?: string | null
          role?: string | null
          subscription_expires?: string | null
          subscription_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artisan_name?: string
          business_address?: string | null
          business_name?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          id?: string
          invoice_count?: number
          last_payment_date?: string | null
          last_payment_reference?: string | null
          logo_url?: string | null
          passcode_hash?: string | null
          payment_verified?: boolean | null
          phone?: string
          receipt_count?: number
          referral_source?: string | null
          role?: string | null
          subscription_expires?: string | null
          subscription_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quotation_items: {
        Row: {
          created_at: string
          description: string
          id: string
          quantity: number
          quotation_id: string
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          quantity?: number
          quotation_id: string
          total_price: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          quantity?: number
          quotation_id?: string
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          amount: number
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          quotation_date: string
          quotation_jpeg_url: string | null
          quotation_number: string
          service_description: string
          status: string
          sub_total: number | null
          tax_rate: number | null
          template_id: number | null
          updated_at: string
          user_id: string
          valid_until: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          quotation_date?: string
          quotation_jpeg_url?: string | null
          quotation_number?: string
          service_description: string
          status?: string
          sub_total?: number | null
          tax_rate?: number | null
          template_id?: number | null
          updated_at?: string
          user_id: string
          valid_until?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          quotation_date?: string
          quotation_jpeg_url?: string | null
          quotation_number?: string
          service_description?: string
          status?: string
          sub_total?: number | null
          tax_rate?: number | null
          template_id?: number | null
          updated_at?: string
          user_id?: string
          valid_until?: string
        }
        Relationships: []
      }
      receipt_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          quantity: number
          receipt_id: string | null
          total_price: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          quantity: number
          receipt_id?: string | null
          total_price: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          quantity?: number
          receipt_id?: string | null
          total_price?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipt_items_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          amount: number
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          invoice_id: string | null
          payment_date: string
          receipt_jpeg_url: string | null
          receipt_number: string
          receipt_template_id: number | null
          service_description: string
          sub_total: number | null
          tax_rate: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          invoice_id?: string | null
          payment_date: string
          receipt_jpeg_url?: string | null
          receipt_number?: string
          receipt_template_id?: number | null
          service_description: string
          sub_total?: number | null
          tax_rate?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          invoice_id?: string | null
          payment_date?: string
          receipt_jpeg_url?: string | null
          receipt_number?: string
          receipt_template_id?: number | null
          service_description?: string
          sub_total?: number | null
          tax_rate?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          amount: number
          description: string | null
          duration_days: number
          plan_type: string
        }
        Insert: {
          amount: number
          description?: string | null
          duration_days: number
          plan_type: string
        }
        Update: {
          amount?: number
          description?: string | null
          duration_days?: number
          plan_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_with_phone_passcode: {
        Args: { passcode: string; phone_number: string }
        Returns: {
          profile: Json
          user_id: string
        }[]
      }
      check_expired_subscriptions: { Args: never; Returns: undefined }
      check_usage_limit: {
        Args: { item_type: string; user_uuid: string }
        Returns: boolean
      }
      get_all_profiles_admin: {
        Args: never
        Returns: {
          artisan_name: string
          business_name: string
          created_at: string
          email: string
          id: string
          invoice_count: number
          logo_url: string
          passcode_hash: string
          phone: string
          receipt_count: number
          referral_source: string
          role: string
          subscription_expires: string
          subscription_type: string
          updated_at: string
          user_id: string
        }[]
      }
      get_profile_by_phone: {
        Args: { phone_number: string }
        Returns: {
          email: string
          phone: string
        }[]
      }
      increment_invoice_count: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      increment_price_list_views: {
        Args: { p_slug: string }
        Returns: undefined
      }
      increment_receipt_count: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      set_user_passcode: {
        Args: { passcode: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const


