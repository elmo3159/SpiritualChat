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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          fortune_teller_id: string
          id: string
          is_divination_request: boolean | null
          sender_type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          fortune_teller_id: string
          id?: string
          is_divination_request?: boolean | null
          sender_type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          fortune_teller_id?: string
          id?: string
          is_divination_request?: boolean | null
          sender_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_fortune_teller_id_fkey"
            columns: ["fortune_teller_id"]
            isOneToOne: false
            referencedRelation: "fortune_tellers"
            referencedColumns: ["id"]
          },
        ]
      }
      divination_results: {
        Row: {
          after_text: string
          chat_message_id: string | null
          created_at: string | null
          fortune_teller_id: string
          greeting_text: string
          id: string
          is_unlocked: boolean | null
          points_cost: number | null
          result_text: string
          status: string | null
          unlocked_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          after_text: string
          chat_message_id?: string | null
          created_at?: string | null
          fortune_teller_id: string
          greeting_text: string
          id?: string
          is_unlocked?: boolean | null
          points_cost?: number | null
          result_text: string
          status?: string | null
          unlocked_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          after_text?: string
          chat_message_id?: string | null
          created_at?: string | null
          fortune_teller_id?: string
          greeting_text?: string
          id?: string
          is_unlocked?: boolean | null
          points_cost?: number | null
          result_text?: string
          status?: string | null
          unlocked_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "divination_results_chat_message_id_fkey"
            columns: ["chat_message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "divination_results_fortune_teller_id_fkey"
            columns: ["fortune_teller_id"]
            isOneToOne: false
            referencedRelation: "fortune_tellers"
            referencedColumns: ["id"]
          },
        ]
      }
      fortune_tellers: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string
          experience_years: number | null
          greeting_message: string
          id: string
          is_active: boolean | null
          name: string
          rating: number | null
          specialties: string[]
          system_prompt: string
          title: string
          total_readings: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description: string
          experience_years?: number | null
          greeting_message: string
          id?: string
          is_active?: boolean | null
          name: string
          rating?: number | null
          specialties: string[]
          system_prompt: string
          title: string
          total_readings?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string
          experience_years?: number | null
          greeting_message?: string
          id?: string
          is_active?: boolean | null
          name?: string
          rating?: number | null
          specialties?: string[]
          system_prompt?: string
          title?: string
          total_readings?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      points_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          divination_result_id: string | null
          id: string
          metadata: Json | null
          stripe_payment_intent_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          divination_result_id?: string | null
          id?: string
          metadata?: Json | null
          stripe_payment_intent_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          divination_result_id?: string | null
          id?: string
          metadata?: Json | null
          stripe_payment_intent_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_transactions_divination_result_id_fkey"
            columns: ["divination_result_id"]
            isOneToOne: false
            referencedRelation: "divination_results"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          birth_date: string
          birth_place: string | null
          birth_time: string | null
          created_at: string | null
          gender: string | null
          id: string
          nickname: string
          updated_at: string | null
        }
        Insert: {
          birth_date: string
          birth_place?: string | null
          birth_time?: string | null
          created_at?: string | null
          gender?: string | null
          id: string
          nickname: string
          updated_at?: string | null
        }
        Update: {
          birth_date?: string
          birth_place?: string | null
          birth_time?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          nickname?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_points: {
        Row: {
          balance: number | null
          created_at: string | null
          total_earned: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
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
