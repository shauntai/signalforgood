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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_stats: {
        Row: {
          agent_id: string
          avg_actionability_score: number | null
          avg_clarity_score: number | null
          avg_evidence_score: number | null
          debates_participated: number | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          avg_actionability_score?: number | null
          avg_clarity_score?: number | null
          avg_evidence_score?: number | null
          debates_participated?: number | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          avg_actionability_score?: number | null
          avg_clarity_score?: number | null
          avg_evidence_score?: number | null
          debates_participated?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_stats_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          avatar_url: string | null
          bias_statement: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          persona_prompt: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          bias_statement?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          persona_prompt?: string | null
          role: string
        }
        Update: {
          avatar_url?: string | null
          bias_statement?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          persona_prompt?: string | null
          role?: string
        }
        Relationships: []
      }
      artifact_views: {
        Row: {
          content: string | null
          created_at: string
          id: string
          lens: string
          local_context: Json | null
          locale: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          lens: string
          local_context?: Json | null
          locale?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          lens?: string
          local_context?: Json | null
          locale?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      buckets: {
        Row: {
          color: string
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      citations: {
        Row: {
          claim_id: string
          created_at: string
          id: string
          location_info: Json | null
          snippet: string | null
          source_id: string
          why_it_matters: string | null
        }
        Insert: {
          claim_id: string
          created_at?: string
          id?: string
          location_info?: Json | null
          snippet?: string | null
          source_id: string
          why_it_matters?: string | null
        }
        Update: {
          claim_id?: string
          created_at?: string
          id?: string
          location_info?: Json | null
          snippet?: string | null
          source_id?: string
          why_it_matters?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citations_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citations_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          claim_text: string
          claim_type: Database["public"]["Enums"]["claim_type"]
          confidence: number
          created_at: string
          id: string
          is_flagged: boolean
          is_retracted: boolean
          message_id: string
          mission_id: string
        }
        Insert: {
          claim_text: string
          claim_type?: Database["public"]["Enums"]["claim_type"]
          confidence?: number
          created_at?: string
          id?: string
          is_flagged?: boolean
          is_retracted?: boolean
          message_id: string
          mission_id: string
        }
        Update: {
          claim_text?: string
          claim_type?: Database["public"]["Enums"]["claim_type"]
          confidence?: number
          created_at?: string
          id?: string
          is_flagged?: boolean
          is_retracted?: boolean
          message_id?: string
          mission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "debate_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          fingerprint_hash: string | null
          id: string
          ip_hash: string | null
          spam_score: number | null
          status: Database["public"]["Enums"]["comment_status"]
          target_id: string
          target_type: string
          ua_hash: string | null
        }
        Insert: {
          content: string
          created_at?: string
          fingerprint_hash?: string | null
          id?: string
          ip_hash?: string | null
          spam_score?: number | null
          status?: Database["public"]["Enums"]["comment_status"]
          target_id: string
          target_type: string
          ua_hash?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          fingerprint_hash?: string | null
          id?: string
          ip_hash?: string | null
          spam_score?: number | null
          status?: Database["public"]["Enums"]["comment_status"]
          target_id?: string
          target_type?: string
          ua_hash?: string | null
        }
        Relationships: []
      }
      daily_briefs: {
        Row: {
          bucket_id: string
          content: string | null
          created_at: string
          highlights: Json | null
          id: string
          published_date: string
          title: string
        }
        Insert: {
          bucket_id: string
          content?: string | null
          created_at?: string
          highlights?: Json | null
          id?: string
          published_date?: string
          title: string
        }
        Update: {
          bucket_id?: string
          content?: string | null
          created_at?: string
          highlights?: Json | null
          id?: string
          published_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_briefs_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      debate_messages: {
        Row: {
          agent_id: string
          content: string
          created_at: string
          id: string
          lane: Database["public"]["Enums"]["message_lane"]
          mission_id: string
          round_number: number
        }
        Insert: {
          agent_id: string
          content: string
          created_at?: string
          id?: string
          lane?: Database["public"]["Enums"]["message_lane"]
          mission_id: string
          round_number?: number
        }
        Update: {
          agent_id?: string
          content?: string
          created_at?: string
          id?: string
          lane?: Database["public"]["Enums"]["message_lane"]
          mission_id?: string
          round_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "debate_messages_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debate_messages_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      debate_stats: {
        Row: {
          citation_coverage: number | null
          claims_count: number | null
          last_message_at: string | null
          messages_last_hour: number | null
          mission_id: string
          updated_at: string
        }
        Insert: {
          citation_coverage?: number | null
          claims_count?: number | null
          last_message_at?: string | null
          messages_last_hour?: number | null
          mission_id: string
          updated_at?: string
        }
        Update: {
          citation_coverage?: number | null
          claims_count?: number | null
          last_message_at?: string | null
          messages_last_hour?: number | null
          mission_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "debate_stats_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: true
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_events: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          payment_status: string
          provider: string
          provider_event_id: string
          session_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency: string
          id?: string
          payment_status: string
          provider: string
          provider_event_id: string
          session_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          payment_status?: string
          provider?: string
          provider_event_id?: string
          session_id?: string | null
        }
        Relationships: []
      }
      donation_intents: {
        Row: {
          amount_cents: number | null
          created_at: string
          id: string
          ip_hash: string | null
          metadata: Json | null
          method: string
          page_path: string
          status: string
          stripe_session_id: string | null
          user_agent_hash: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          method: string
          page_path: string
          status?: string
          stripe_session_id?: string | null
          user_agent_hash?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          method?: string
          page_path?: string
          status?: string
          stripe_session_id?: string | null
          user_agent_hash?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          metadata: Json | null
          page_path: string | null
          session_id: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          session_id?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          session_id?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      exports: {
        Row: {
          created_at: string
          export_type: string
          id: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          export_type: string
          id?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          export_type?: string
          id?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          bucket_id: string
          completed_at: string | null
          constraints: Json | null
          core_question: string | null
          created_at: string
          debate_hook: string | null
          id: string
          is_live: boolean
          started_at: string | null
          status: Database["public"]["Enums"]["mission_status"]
          success_metric: string | null
          title: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          completed_at?: string | null
          constraints?: Json | null
          core_question?: string | null
          created_at?: string
          debate_hook?: string | null
          id?: string
          is_live?: boolean
          started_at?: string | null
          status?: Database["public"]["Enums"]["mission_status"]
          success_metric?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          completed_at?: string | null
          constraints?: Json | null
          core_question?: string | null
          created_at?: string
          debate_hook?: string | null
          id?: string
          is_live?: boolean
          started_at?: string | null
          status?: Database["public"]["Enums"]["mission_status"]
          success_metric?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      replays: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          mission_id: string
          script: string | null
          timestamp_jumps: Json | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          mission_id: string
          script?: string | null
          timestamp_jumps?: Json | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          mission_id?: string
          script?: string | null
          timestamp_jumps?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "replays_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: true
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      scores: {
        Row: {
          actionability_score: number | null
          citation_coverage: number | null
          clarity_score: number | null
          created_at: string
          evidence_score: number | null
          flagged_claim_rate: number | null
          id: string
          mission_id: string
          overall_score: number | null
          revision_count: number | null
          risk_score: number | null
        }
        Insert: {
          actionability_score?: number | null
          citation_coverage?: number | null
          clarity_score?: number | null
          created_at?: string
          evidence_score?: number | null
          flagged_claim_rate?: number | null
          id?: string
          mission_id: string
          overall_score?: number | null
          revision_count?: number | null
          risk_score?: number | null
        }
        Update: {
          actionability_score?: number | null
          citation_coverage?: number | null
          clarity_score?: number | null
          created_at?: string
          evidence_score?: number | null
          flagged_claim_rate?: number | null
          id?: string
          mission_id?: string
          overall_score?: number | null
          revision_count?: number | null
          risk_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scores_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: true
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      signals_agg: {
        Row: {
          bucket_id: string | null
          id: string
          metrics: Json | null
          time_window: string
          updated_at: string
        }
        Insert: {
          bucket_id?: string | null
          id?: string
          metrics?: Json | null
          time_window: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string | null
          id?: string
          metrics?: Json | null
          time_window?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "signals_agg_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_cards: {
        Row: {
          content: string | null
          cost_band: string | null
          created_at: string
          dependencies: string | null
          id: string
          intended_owner: string | null
          is_published: boolean
          mission_id: string
          risks_mitigations: string | null
          staffing_assumptions: string | null
          success_metrics: Json | null
          summary: string | null
          timeline: string | null
          title: string
        }
        Insert: {
          content?: string | null
          cost_band?: string | null
          created_at?: string
          dependencies?: string | null
          id?: string
          intended_owner?: string | null
          is_published?: boolean
          mission_id: string
          risks_mitigations?: string | null
          staffing_assumptions?: string | null
          success_metrics?: Json | null
          summary?: string | null
          timeline?: string | null
          title: string
        }
        Update: {
          content?: string | null
          cost_band?: string | null
          created_at?: string
          dependencies?: string | null
          id?: string
          intended_owner?: string | null
          is_published?: boolean
          mission_id?: string
          risks_mitigations?: string | null
          staffing_assumptions?: string | null
          success_metrics?: Json | null
          summary?: string | null
          timeline?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_cards_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      source_packs: {
        Row: {
          bucket_id: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_packs_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          created_at: string
          file_path: string | null
          id: string
          metadata: Json | null
          source_pack_id: string
          source_type: string
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string
          file_path?: string | null
          id?: string
          metadata?: Json | null
          source_pack_id: string
          source_type?: string
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string | null
          id?: string
          metadata?: Json | null
          source_pack_id?: string
          source_type?: string
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sources_source_pack_id_fkey"
            columns: ["source_pack_id"]
            isOneToOne: false
            referencedRelation: "source_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      system_status: {
        Row: {
          budget_state: string | null
          citation_coverage_24h: number | null
          debates_live: number | null
          generation_enabled: boolean | null
          id: string
          last_updated: string
          messages_last_10_min: number | null
          seed_version: string | null
          seeded_at: string | null
        }
        Insert: {
          budget_state?: string | null
          citation_coverage_24h?: number | null
          debates_live?: number | null
          generation_enabled?: boolean | null
          id?: string
          last_updated?: string
          messages_last_10_min?: number | null
          seed_version?: string | null
          seeded_at?: string | null
        }
        Update: {
          budget_state?: string | null
          citation_coverage_24h?: number | null
          debates_live?: number | null
          generation_enabled?: boolean | null
          id?: string
          last_updated?: string
          messages_last_10_min?: number | null
          seed_version?: string | null
          seeded_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      app_role: "admin" | "moderator" | "user"
      claim_type: "evidence" | "precedent" | "assumption" | "speculation"
      comment_status: "visible" | "queued" | "hidden" | "removed"
      message_lane: "proposal" | "support" | "counter"
      mission_status: "draft" | "live" | "paused" | "completed"
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
      app_role: ["admin", "moderator", "user"],
      claim_type: ["evidence", "precedent", "assumption", "speculation"],
      comment_status: ["visible", "queued", "hidden", "removed"],
      message_lane: ["proposal", "support", "counter"],
      mission_status: ["draft", "live", "paused", "completed"],
    },
  },
} as const
