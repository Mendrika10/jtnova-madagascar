export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      contact_messages: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          ip_hash: string | null;
          message: string;
          name: string;
          notes: string | null;
          status: string;
          subject: string | null;
          user_agent: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          ip_hash?: string | null;
          message: string;
          name: string;
          notes?: string | null;
          status?: string;
          subject?: string | null;
          user_agent?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          ip_hash?: string | null;
          message?: string;
          name?: string;
          notes?: string | null;
          status?: string;
          subject?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      faq_items: {
        Row: {
          answer: string;
          id: string;
          published: boolean;
          question: string;
          sort_order: number;
        };
        Insert: {
          answer: string;
          id?: string;
          published?: boolean;
          question: string;
          sort_order?: number;
        };
        Update: {
          answer?: string;
          id?: string;
          published?: boolean;
          question?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      media: {
        Row: {
          created_at: string;
          id: string;
          mime_type: string | null;
          path: string;
          size_bytes: number | null;
          uploaded_by: string | null;
          url: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          mime_type?: string | null;
          path: string;
          size_bytes?: number | null;
          uploaded_by?: string | null;
          url: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          mime_type?: string | null;
          path?: string;
          size_bytes?: number | null;
          uploaded_by?: string | null;
          url?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          role: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          role?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          role?: string;
        };
        Relationships: [];
      };
      project_highlights: {
        Row: {
          id: string;
          project_id: string;
          sort_order: number;
          text: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          sort_order?: number;
          text: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          sort_order?: number;
          text?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_highlights_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_images: {
        Row: {
          alt: string;
          id: string;
          project_id: string;
          sort_order: number;
          url: string;
        };
        Insert: {
          alt?: string;
          id?: string;
          project_id: string;
          sort_order?: number;
          url: string;
        };
        Update: {
          alt?: string;
          id?: string;
          project_id?: string;
          sort_order?: number;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_tech: {
        Row: {
          id: string;
          label: string;
          project_id: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          label: string;
          project_id: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          label?: string;
          project_id?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "project_tech_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          category: string | null;
          client_name: string | null;
          cover_image: string | null;
          created_at: string;
          description: string;
          explication: string | null;
          featured: boolean;
          id: string;
          live_url: string | null;
          performance: string | null;
          presentation: string | null;
          published: boolean;
          repo_url: string | null;
          security: string | null;
          slug: string;
          sort_order: number;
          tag: string | null;
          title: string;
          updated_at: string;
          video_poster: string | null;
          video_url: string | null;
          year: string | null;
        };
        Insert: {
          category?: string | null;
          client_name?: string | null;
          cover_image?: string | null;
          created_at?: string;
          description: string;
          explication?: string | null;
          featured?: boolean;
          id?: string;
          live_url?: string | null;
          performance?: string | null;
          presentation?: string | null;
          published?: boolean;
          repo_url?: string | null;
          security?: string | null;
          slug: string;
          sort_order?: number;
          tag?: string | null;
          title: string;
          updated_at?: string;
          video_poster?: string | null;
          video_url?: string | null;
          year?: string | null;
        };
        Update: {
          category?: string | null;
          client_name?: string | null;
          cover_image?: string | null;
          created_at?: string;
          description?: string;
          explication?: string | null;
          featured?: boolean;
          id?: string;
          live_url?: string | null;
          performance?: string | null;
          presentation?: string | null;
          published?: boolean;
          repo_url?: string | null;
          security?: string | null;
          slug?: string;
          sort_order?: number;
          tag?: string | null;
          title?: string;
          updated_at?: string;
          video_poster?: string | null;
          video_url?: string | null;
          year?: string | null;
        };
        Relationships: [];
      };
      services: {
        Row: {
          description: string;
          icon: string | null;
          id: string;
          published: boolean;
          sort_order: number;
          title: string;
        };
        Insert: {
          description?: string;
          icon?: string | null;
          id?: string;
          published?: boolean;
          sort_order?: number;
          title: string;
        };
        Update: {
          description?: string;
          icon?: string | null;
          id?: string;
          published?: boolean;
          sort_order?: number;
          title?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          updated_at: string;
          value: NonNullable<Json>;
        };
        Insert: {
          key: string;
          updated_at?: string;
          value: NonNullable<Json>;
        };
        Update: {
          key?: string;
          updated_at?: string;
          value?: NonNullable<Json>;
        };
        Relationships: [];
      };
      tech_banner: {
        Row: {
          id: string;
          image_url: string;
          name: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          image_url: string;
          name: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          image_url?: string;
          name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          avatar_text: string | null;
          id: string;
          linkedin_url: string | null;
          name: string;
          published: boolean;
          role: string | null;
          sort_order: number;
          text: string;
        };
        Insert: {
          avatar_text?: string | null;
          id?: string;
          linkedin_url?: string | null;
          name: string;
          published?: boolean;
          role?: string | null;
          sort_order?: number;
          text: string;
        };
        Update: {
          avatar_text?: string | null;
          id?: string;
          linkedin_url?: string | null;
          name?: string;
          published?: boolean;
          role?: string | null;
          sort_order?: number;
          text?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      show_limit: { Args: Record<PropertyKey, never>; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
