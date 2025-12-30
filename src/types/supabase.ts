export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      assets: {
        Row: {
          cash_balance: number;
          id: string;
          investment_balance: number;
          return_rate: number;
          user_id: string;
        };
        Insert: {
          cash_balance: number;
          id?: string;
          investment_balance: number;
          return_rate?: number;
          user_id: string;
        };
        Update: {
          cash_balance?: number;
          id?: string;
          investment_balance?: number;
          return_rate?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      children: {
        Row: {
          birth_year_month: string | null;
          due_year_month: string | null;
          id: string;
          label: string;
          note: string | null;
          user_id: string;
        };
        Insert: {
          birth_year_month?: string | null;
          due_year_month?: string | null;
          id?: string;
          label: string;
          note?: string | null;
          user_id: string;
        };
        Update: {
          birth_year_month?: string | null;
          due_year_month?: string | null;
          id?: string;
          label?: string;
          note?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          amount_monthly: number;
          category: string;
          end_year_month: string | null;
          id: string;
          inflation_rate: number;
          label: string;
          start_year_month: string;
          user_id: string;
        };
        Insert: {
          amount_monthly: number;
          category: string;
          end_year_month?: string | null;
          id?: string;
          inflation_rate?: number;
          label: string;
          start_year_month: string;
          user_id: string;
        };
        Update: {
          amount_monthly?: number;
          category?: string;
          end_year_month?: string | null;
          id?: string;
          inflation_rate?: number;
          label?: string;
          start_year_month?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      income_streams: {
        Row: {
          bonus_amount: number;
          bonus_amount_after: number | null;
          bonus_months: number[];
          change_year_month: string | null;
          end_year_month: string | null;
          id: string;
          label: string;
          raise_rate: number;
          start_year_month: string;
          take_home_monthly: number;
          user_id: string;
        };
        Insert: {
          bonus_amount: number;
          bonus_amount_after?: number | null;
          bonus_months?: number[];
          change_year_month?: string | null;
          end_year_month?: string | null;
          id?: string;
          label: string;
          raise_rate?: number;
          start_year_month: string;
          take_home_monthly: number;
          user_id: string;
        };
        Update: {
          bonus_amount?: number;
          bonus_amount_after?: number | null;
          bonus_months?: number[];
          change_year_month?: string | null;
          end_year_month?: string | null;
          id?: string;
          label?: string;
          raise_rate?: number;
          start_year_month?: string;
          take_home_monthly?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      life_events: {
        Row: {
          amount: number;
          auto_toggle_key: string | null;
          building_price: number | null;
          category: string;
          down_payment: number | null;
          id: string;
          label: string;
          land_price: number | null;
          repeat_interval_years: number | null;
          stop_after_occurrences: number | null;
          user_id: string;
          year_month: string;
        };
        Insert: {
          amount: number;
          auto_toggle_key?: string | null;
          building_price?: number | null;
          category: string;
          down_payment?: number | null;
          id?: string;
          label: string;
          land_price?: number | null;
          repeat_interval_years?: number | null;
          stop_after_occurrences?: number | null;
          user_id: string;
          year_month: string;
        };
        Update: {
          amount?: number;
          auto_toggle_key?: string | null;
          building_price?: number | null;
          category?: string;
          down_payment?: number | null;
          id?: string;
          label?: string;
          land_price?: number | null;
          repeat_interval_years?: number | null;
          stop_after_occurrences?: number | null;
          user_id?: string;
          year_month?: string;
        };
        Relationships: [];
      };
      mortgages: {
        Row: {
          annual_rate: number;
          building_price: number;
          down_payment: number;
          id: string;
          land_price: number;
          principal: number;
          start_year_month: string;
          user_id: string;
          years: number;
        };
        Insert: {
          annual_rate?: number;
          building_price: number;
          down_payment: number;
          id?: string;
          land_price: number;
          principal: number;
          start_year_month: string;
          user_id: string;
          years: number;
        };
        Update: {
          annual_rate?: number;
          building_price?: number;
          down_payment?: number;
          id?: string;
          land_price?: number;
          principal?: number;
          start_year_month?: string;
          user_id?: string;
          years?: number;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          birth_month: number | null;
          birth_year: number | null;
          created_at: string;
          pension_start_age: number;
          spouse_birth_month: number | null;
          spouse_birth_year: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          birth_month?: number | null;
          birth_year?: number | null;
          created_at?: string;
          pension_start_age?: number;
          spouse_birth_month?: number | null;
          spouse_birth_year?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          birth_month?: number | null;
          birth_year?: number | null;
          created_at?: string;
          pension_start_age?: number;
          spouse_birth_month?: number | null;
          spouse_birth_year?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      rentals: {
        Row: {
          end_year_month: string | null;
          id: string;
          rent_monthly: number;
          start_year_month: string;
          user_id: string;
        };
        Insert: {
          end_year_month?: string | null;
          id?: string;
          rent_monthly: number;
          start_year_month: string;
          user_id: string;
        };
        Update: {
          end_year_month?: string | null;
          id?: string;
          rent_monthly?: number;
          start_year_month?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      simulation_settings: {
        Row: {
          created_at: string;
          end_age: number;
          id: string;
          mortgage_transaction_cost_rate: number;
          pension_amount_single: number;
          pension_amount_spouse: number;
          real_estate_evaluation_rate: number;
          real_estate_tax_rate: number;
          start_offset_months: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          end_age?: number;
          id?: string;
          mortgage_transaction_cost_rate?: number;
          pension_amount_single?: number;
          pension_amount_spouse?: number;
          real_estate_evaluation_rate?: number;
          real_estate_tax_rate?: number;
          start_offset_months?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          end_age?: number;
          id?: string;
          mortgage_transaction_cost_rate?: number;
          pension_amount_single?: number;
          pension_amount_spouse?: number;
          real_estate_evaluation_rate?: number;
          real_estate_tax_rate?: number;
          start_offset_months?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
