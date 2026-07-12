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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      drivers: {
        Row: {
          city: string
          code: string
          created_at: string
          hours_week: number
          id: string
          license: string
          name: string
          phone: string
          photo: string | null
          score: number
          status: string
          trips: number
          updated_at: string
        }
        Insert: {
          city?: string
          code: string
          created_at?: string
          hours_week?: number
          id?: string
          license?: string
          name: string
          phone?: string
          photo?: string | null
          score?: number
          status?: string
          trips?: number
          updated_at?: string
        }
        Update: {
          city?: string
          code?: string
          created_at?: string
          hours_week?: number
          id?: string
          license?: string
          name?: string
          phone?: string
          photo?: string | null
          score?: number
          status?: string
          trips?: number
          updated_at?: string
        }
        Relationships: []
      }
      fleet_alerts: {
        Row: {
          code: string
          created_at: string
          id: string
          severity: string
          time_label: string
          title: string
          vehicle: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          severity?: string
          time_label?: string
          title: string
          vehicle?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          severity?: string
          time_label?: string
          title?: string
          vehicle?: string
        }
        Relationships: []
      }
      fuel_entries: {
        Row: {
          cost: number
          created_at: string
          driver: string
          entry_date: string
          id: string
          litres: number
          station: string
          updated_at: string
          user_id: string | null
          vehicle: string
        }
        Insert: {
          cost?: number
          created_at?: string
          driver?: string
          entry_date?: string
          id?: string
          litres?: number
          station?: string
          updated_at?: string
          user_id?: string | null
          vehicle: string
        }
        Update: {
          cost?: number
          created_at?: string
          driver?: string
          entry_date?: string
          id?: string
          litres?: number
          station?: string
          updated_at?: string
          user_id?: string | null
          vehicle?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      trips: {
        Row: {
          code: string
          created_at: string
          destination: string
          distance: number
          driver: string
          eta: string
          id: string
          origin: string
          status: string
          updated_at: string
          vehicle: string
        }
        Insert: {
          code: string
          created_at?: string
          destination: string
          distance?: number
          driver?: string
          eta?: string
          id?: string
          origin: string
          status?: string
          updated_at?: string
          vehicle?: string
        }
        Update: {
          code?: string
          created_at?: string
          destination?: string
          distance?: number
          driver?: string
          eta?: string
          id?: string
          origin?: string
          status?: string
          updated_at?: string
          vehicle?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          code: string
          created_at: string
          driver: string
          fuel: number
          id: string
          location: string
          mileage: number
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          driver?: string
          fuel?: number
          id?: string
          location?: string
          mileage?: number
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          driver?: string
          fuel?: number
          id?: string
          location?: string
          mileage?: number
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      work_orders: {
        Row: {
          assignee: string
          code: string
          created_at: string
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
          updated_label: string
          vehicle: string
        }
        Insert: {
          assignee?: string
          code: string
          created_at?: string
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          updated_label?: string
          vehicle?: string
        }
        Update: {
          assignee?: string
          code?: string
          created_at?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          updated_label?: string
          vehicle?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "fleet_manager"
        | "safety_officer"
        | "financial_analyst"
        | "driver"
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
    Enums: {
      app_role: [
        "fleet_manager",
        "safety_officer",
        "financial_analyst",
        "driver",
      ],
    },
  },
} as const
