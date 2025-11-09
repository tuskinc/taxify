export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      business_finances: {
        Row: {
          annual_revenue: number | null
          business_expenses: number | null
          business_name: string
          business_type: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          annual_revenue?: number | null
          business_expenses?: number | null
          business_name: string
          business_type: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          annual_revenue?: number | null
          business_expenses?: number | null
          business_name?: string
          business_type?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_finances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_finances: {
        Row: {
          annual_income: number | null
          created_at: string | null
          credits: number | null
          deductions: number | null
          id: string
          other_income: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          annual_income?: number | null
          created_at?: string | null
          credits?: number | null
          deductions?: number | null
          id?: string
          other_income?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          annual_income?: number | null
          created_at?: string | null
          credits?: number | null
          deductions?: number | null
          id?: string
          other_income?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_finances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_calendar: {
        Row: {
          country: Database["public"]["Enums"]["country_code"]
          created_at: string | null
          deadline_date: string
          deadline_type: string
          description: string | null
          id: string
          is_recurring: boolean | null
        }
        Insert: {
          country: Database["public"]["Enums"]["country_code"]
          created_at?: string | null
          deadline_date: string
          deadline_type: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
        }
        Update: {
          country?: Database["public"]["Enums"]["country_code"]
          created_at?: string | null
          deadline_date?: string
          deadline_type?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
        }
        Relationships: []
      }
      tax_data: {
        Row: {
          country: Database["public"]["Enums"]["country_code"]
          created_at: string | null
          credits: Json
          deductions: Json
          id: string
          tax_brackets: Json
          tax_year: number
          updated_at: string | null
        }
        Insert: {
          country: Database["public"]["Enums"]["country_code"]
          created_at?: string | null
          credits: Json
          deductions: Json
          id?: string
          tax_brackets: Json
          tax_year: number
          updated_at?: string | null
        }
        Update: {
          country?: Database["public"]["Enums"]["country_code"]
          created_at?: string | null
          credits?: Json
          deductions?: Json
          id?: string
          tax_brackets?: Json
          tax_year?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          birth_date: string
          country: Database["public"]["Enums"]["country_code"]
          created_at: string | null
          dependents: number | null
          email: string
          filing_status: Database["public"]["Enums"]["filing_status"]
          id: string
          spouse_income: number | null
          tax_scenarios: string[] | null
          updated_at: string | null
        }
        Insert: {
          birth_date: string
          country: Database["public"]["Enums"]["country_code"]
          created_at?: string | null
          dependents?: number | null
          email: string
          filing_status: Database["public"]["Enums"]["filing_status"]
          id: string
          spouse_income?: number | null
          tax_scenarios?: string[] | null
          updated_at?: string | null
        }
        Update: {
          birth_date?: string
          country?: Database["public"]["Enums"]["country_code"]
          created_at?: string | null
          dependents?: number | null
          email?: string
          filing_status?: Database["public"]["Enums"]["filing_status"]
          id?: string
          spouse_income?: number | null
          tax_scenarios?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category: string
          amount: number
          spent: number
          type: string
          month: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          amount: number
          spent: number
          type: string
          month: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          amount?: number
          spent?: number
          type?: string
          month?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      investments: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          amount: number
          current_value: number
          purchase_date: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          amount: number
          current_value: number
          purchase_date: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          amount?: number
          current_value?: number
          purchase_date?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      document_uploads: {
        Row: {
          id: string
          user_id: string
          filename: string | null
          status: string | null
          file_size: number | null
          file_type: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          filename?: string | null
          status?: string | null
          file_size?: number | null
          file_type?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string | null
          status?: string | null
          file_size?: number | null
          file_type?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      businesses: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comprehensive_analyses: {
        Row: {
          id: string
          user_id: string
          analysis_data: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          analysis_data?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          analysis_data?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      country_code:
        | "US"
        | "CA"
        | "GB"
        | "AU"
        | "DE"
        | "FR"
        | "IT"
        | "ES"
        | "NL"
        | "SE"
        | "NO"
        | "DK"
        | "FI"
        | "CH"
        | "AT"
        | "BE"
        | "IE"
        | "LU"
        | "PT"
        | "GR"
        | "CY"
        | "MT"
        | "SI"
        | "SK"
        | "CZ"
        | "HU"
        | "PL"
        | "EE"
        | "LV"
        | "LT"
        | "BG"
        | "RO"
        | "HR"
        | "JP"
        | "KR"
        | "SG"
        | "HK"
        | "NZ"
        | "BR"
        | "MX"
        | "AR"
        | "CL"
        | "CO"
        | "PE"
        | "UY"
        | "ZA"
        | "NG"
        | "KE"
        | "EG"
        | "MA"
        | "TN"
        | "DZ"
        | "IN"
        | "PK"
        | "BD"
        | "LK"
        | "TH"
        | "VN"
        | "ID"
        | "MY"
        | "PH"
        | "TW"
        | "CN"
        | "RU"
        | "UA"
        | "BY"
        | "KZ"
        | "UZ"
        | "KG"
        | "TJ"
        | "TM"
        | "AF"
        | "IR"
        | "IQ"
        | "SY"
        | "LB"
        | "JO"
        | "IL"
        | "PS"
        | "SA"
        | "AE"
        | "QA"
        | "KW"
        | "BH"
        | "OM"
        | "YE"
        | "TR"
        | "GE"
        | "AM"
        | "AZ"
        | "MD"
        | "RS"
        | "ME"
        | "BA"
        | "MK"
        | "AL"
        | "XK"
      filing_status:
        | "single"
        | "married_filing_jointly"
        | "married_filing_separately"
        | "head_of_household"
        | "qualifying_widow"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (Omit<Database, "__InternalSupabase">["public"]["Tables"] & Omit<Database, "__InternalSupabase">["public"]["Views"])
    | { schema: keyof Omit<Database, "__InternalSupabase"> },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Omit<Database, "__InternalSupabase"> }
    ? keyof (Omit<Database, "__InternalSupabase">[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Omit<Database, "__InternalSupabase">[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Omit<Database, "__InternalSupabase"> }
  ? (Omit<Database, "__InternalSupabase">[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Omit<Database, "__InternalSupabase">[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer R }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (Omit<Database, "__InternalSupabase">["public"]["Tables"] & Omit<Database, "__InternalSupabase">["public"]["Views"])
    ? (Omit<Database, "__InternalSupabase">["public"]["Tables"] & Omit<Database, "__InternalSupabase">["public"]["Views"])[DefaultSchemaTableNameOrOptions] extends { Row: infer R }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof Omit<Database, "__InternalSupabase">["public"]["Tables"]
    | { schema: keyof Omit<Database, "__InternalSupabase"> },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Omit<Database, "__InternalSupabase"> }
    ? keyof Omit<Database, "__InternalSupabase">[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Omit<Database, "__InternalSupabase"> }
  ? Omit<Database, "__InternalSupabase">[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer I }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof Omit<Database, "__InternalSupabase">["public"]["Tables"]
    ? Omit<Database, "__InternalSupabase">["public"]["Tables"][TableName] extends { Insert: infer I }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof Omit<Database, "__InternalSupabase">["public"]["Tables"]
    | { schema: keyof Omit<Database, "__InternalSupabase"> },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Omit<Database, "__InternalSupabase"> }
    ? keyof Omit<Database, "__InternalSupabase">[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Omit<Database, "__InternalSupabase"> }
  ? Omit<Database, "__InternalSupabase">[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Update: infer U }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof Omit<Database, "__InternalSupabase">["public"]["Tables"]
    ? Omit<Database, "__InternalSupabase">["public"]["Tables"][TableName] extends { Update: infer U }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof Omit<Database, "__InternalSupabase">["public"]["Enums"]
    | { schema: keyof Omit<Database, "__InternalSupabase"> },
  EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof Omit<Database, "__InternalSupabase"> }
    ? keyof Omit<Database, "__InternalSupabase">[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Omit<Database, "__InternalSupabase"> }
  ? Omit<Database, "__InternalSupabase">[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof Omit<Database, "__InternalSupabase">["public"]["Enums"]
    ? Omit<Database, "__InternalSupabase">["public"]["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof Omit<Database, "__InternalSupabase">["public"]["CompositeTypes"]
    | { schema: keyof Omit<Database, "__InternalSupabase"> },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { schema: keyof Omit<Database, "__InternalSupabase"> }
    ? keyof Omit<Database, "__InternalSupabase">[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Omit<Database, "__InternalSupabase"> }
  ? Omit<Database, "__InternalSupabase">[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof Omit<Database, "__InternalSupabase">["public"]["CompositeTypes"]
    ? Omit<Database, "__InternalSupabase">["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      country_code: [
        "US","CA","GB","AU","DE","FR","IT","ES","NL","SE","NO","DK","FI","CH","AT","BE","IE","LU","PT","GR","CY","MT","SI","SK","CZ","HU","PL","EE","LV","LT","BG","RO","HR","JP","KR","SG","HK","NZ","BR","MX","AR","CL","CO","PE","UY","ZA","NG","KE","EG","MA","TN","DZ","IN","PK","BD","LK","TH","VN","ID","MY","PH","TW","CN","RU","UA","BY","KZ","UZ","KG","TJ","TM","AF","IR","IQ","SY","LB","JO","IL","PS","SA","AE","QA","KW","BH","OM","YE","TR","GE","AM","AZ","MD","RS","ME","BA","MK","AL","XK",
      ],
      filing_status: [
        "single","married_filing_jointly","married_filing_separately","head_of_household","qualifying_widow",
      ],
    },
  },
} as const
