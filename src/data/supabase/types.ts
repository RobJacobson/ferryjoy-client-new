export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  public: {
    Tables: {
      vessel_location_current: {
        Row: {
          arv_term_abrv: string | null;
          arv_term_id: number | null;
          at_dock: boolean;
          dep_term_abrv: string;
          dep_term_id: number;
          eta: string | null;
          heading: number;
          in_service: boolean;
          lat: number;
          left_dock: string | null;
          lon: number;
          op_route_abrv: string | null;
          sched_dep: string | null;
          speed: number;
          timestamp: string;
          vessel_abrv: string | null;
          vessel_id: number;
          vessel_name: string;
          vessel_pos_num: number | null;
        };
        Insert: {
          arv_term_abrv?: string | null;
          arv_term_id?: number | null;
          at_dock: boolean;
          dep_term_abrv: string;
          dep_term_id: number;
          eta?: string | null;
          heading: number;
          in_service: boolean;
          lat: number;
          left_dock?: string | null;
          lon: number;
          op_route_abrv?: string | null;
          sched_dep?: string | null;
          speed: number;
          timestamp: string;
          vessel_abrv?: string | null;
          vessel_id: number;
          vessel_name: string;
          vessel_pos_num?: number | null;
        };
        Update: {
          arv_term_abrv?: string | null;
          arv_term_id?: number | null;
          at_dock?: boolean;
          dep_term_abrv?: string;
          dep_term_id?: number;
          eta?: string | null;
          heading?: number;
          in_service?: boolean;
          lat?: number;
          left_dock?: string | null;
          lon?: number;
          op_route_abrv?: string | null;
          sched_dep?: string | null;
          speed?: number;
          timestamp?: string;
          vessel_abrv?: string | null;
          vessel_id?: number;
          vessel_name?: string;
          vessel_pos_num?: number | null;
        };
        Relationships: [];
      };
      vessel_location_minute: {
        Row: {
          arv_term_id: number | null;
          at_dock: boolean;
          dep_term_id: number;
          heading: number;
          id: number;
          in_service: boolean;
          lat: number;
          lon: number;
          speed: number;
          timestamp: string;
          trip_id: number | null;
          vessel_id: number;
        };
        Insert: {
          arv_term_id?: number | null;
          at_dock: boolean;
          dep_term_id: number;
          heading: number;
          id?: never;
          in_service: boolean;
          lat: number;
          lon: number;
          speed: number;
          timestamp: string;
          trip_id?: number | null;
          vessel_id: number;
        };
        Update: {
          arv_term_id?: number | null;
          at_dock?: boolean;
          dep_term_id?: number;
          heading?: number;
          id?: never;
          in_service?: boolean;
          lat?: number;
          lon?: number;
          speed?: number;
          timestamp?: string;
          trip_id?: number | null;
          vessel_id?: number;
        };
        Relationships: [];
      };
      vessel_location_second: {
        Row: {
          arv_term_abrv: string | null;
          arv_term_id: number | null;
          at_dock: boolean;
          created_at: string;
          dep_term_abrv: string;
          dep_term_id: number;
          eta: string | null;
          heading: number;
          id: number;
          in_service: boolean;
          lat: number;
          left_dock: string | null;
          lon: number;
          op_route_abrv: string | null;
          sched_dep: string | null;
          speed: number;
          timestamp: string;
          vessel_abrv: string | null;
          vessel_id: number;
          vessel_name: string;
          vessel_pos_num: number | null;
        };
        Insert: {
          arv_term_abrv?: string | null;
          arv_term_id?: number | null;
          at_dock: boolean;
          created_at?: string;
          dep_term_abrv: string;
          dep_term_id: number;
          eta?: string | null;
          heading: number;
          id?: never;
          in_service: boolean;
          lat: number;
          left_dock?: string | null;
          lon: number;
          op_route_abrv?: string | null;
          sched_dep?: string | null;
          speed: number;
          timestamp: string;
          vessel_abrv?: string | null;
          vessel_id: number;
          vessel_name: string;
          vessel_pos_num?: number | null;
        };
        Update: {
          arv_term_abrv?: string | null;
          arv_term_id?: number | null;
          at_dock?: boolean;
          created_at?: string;
          dep_term_abrv?: string;
          dep_term_id?: number;
          eta?: string | null;
          heading?: number;
          id?: never;
          in_service?: boolean;
          lat?: number;
          left_dock?: string | null;
          lon?: number;
          op_route_abrv?: string | null;
          sched_dep?: string | null;
          speed?: number;
          timestamp?: string;
          vessel_abrv?: string | null;
          vessel_id?: number;
          vessel_name?: string;
          vessel_pos_num?: number | null;
        };
        Relationships: [];
      };
      vessel_trip: {
        Row: {
          arv_term_abrv: string | null;
          arv_term_id: number | null;
          at_dock: boolean;
          created_at: string;
          dep_term_abrv: string;
          dep_term_id: number;
          end_at: string | null;
          eta: string | null;
          id: number;
          in_service: boolean;
          left_dock: string | null;
          op_route_abrv: string | null;
          sched_dep: string | null;
          start_at: string | null;
          updated_at: string;
          vessel_abrv: string;
          vessel_id: number;
          vessel_name: string;
          vessel_pos_num: number | null;
        };
        Insert: {
          arv_term_abrv?: string | null;
          arv_term_id?: number | null;
          at_dock: boolean;
          created_at?: string;
          dep_term_abrv: string;
          dep_term_id: number;
          end_at?: string | null;
          eta?: string | null;
          id?: never;
          in_service: boolean;
          left_dock?: string | null;
          op_route_abrv?: string | null;
          sched_dep?: string | null;
          start_at?: string | null;
          updated_at: string;
          vessel_abrv: string;
          vessel_id: number;
          vessel_name: string;
          vessel_pos_num?: number | null;
        };
        Update: {
          arv_term_abrv?: string | null;
          arv_term_id?: number | null;
          at_dock?: boolean;
          created_at?: string;
          dep_term_abrv?: string;
          dep_term_id?: number;
          end_at?: string | null;
          eta?: string | null;
          id?: never;
          in_service?: boolean;
          left_dock?: string | null;
          op_route_abrv?: string | null;
          sched_dep?: string | null;
          start_at?: string | null;
          updated_at?: string;
          vessel_abrv?: string;
          vessel_id?: number;
          vessel_name?: string;
          vessel_pos_num?: number | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_lerp: {
        Args: {
          prev_value: number;
          next_value: number;
          prev_time: string;
          next_time: string;
        };
        Returns: number;
      };
      cleanup_old_data: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      convert_unix_timestamp: {
        Args: { unix_string: string };
        Returns: string;
      };
      create_vessel_location: {
        Args: { data: Json };
        Returns: Database["public"]["CompositeTypes"]["vessel_location_type"];
      };
      fetch_vessel_locations: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      get_vessel_abbreviation: {
        Args: { full_vessel_name: string };
        Returns: string;
      };
      insert_new_trip: {
        Args: {
          vl: Database["public"]["CompositeTypes"]["vessel_location_type"];
          start_time: string;
        };
        Returns: undefined;
      };
      insert_vessel_location_current: {
        Args: {
          vl: Database["public"]["CompositeTypes"]["vessel_location_type"];
        };
        Returns: undefined;
      };
      insert_vessel_location_minute: {
        Args: {
          vl: Database["public"]["CompositeTypes"]["vessel_location_type"];
        };
        Returns: undefined;
      };
      insert_vessel_location_second: {
        Args: {
          vl: Database["public"]["CompositeTypes"]["vessel_location_type"];
        };
        Returns: undefined;
      };
      insert_vessel_trip: {
        Args: {
          vl: Database["public"]["CompositeTypes"]["vessel_location_type"];
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      vessel_location_type: {
        vesselid: number | null;
        vesselname: string | null;
        vesselabrv: string | null;
        departingterminalid: number | null;
        departingterminalname: string | null;
        departingterminalabbrev: string | null;
        arrivingterminalid: number | null;
        arrivingterminalname: string | null;
        arrivingterminalabbrev: string | null;
        latitude: number | null;
        longitude: number | null;
        speed: number | null;
        heading: number | null;
        inservice: boolean | null;
        atdock: boolean | null;
        leftdock: string | null;
        eta: string | null;
        scheduleddeparture: string | null;
        oprouteabbrev: string | null;
        vesselpositionnum: number | null;
        timestamp: string | null;
      };
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
