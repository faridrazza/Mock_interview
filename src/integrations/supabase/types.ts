export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      advanced_interview_sessions: {
        Row: {
          company_name: string
          created_at: string | null
          end_time: string | null
          feedback: Json | null
          id: string
          job_role: string
          messages: Json | null
          questions: Json
          start_time: string | null
          status: string | null
          suggestions: Json | null
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string | null
          end_time?: string | null
          feedback?: Json | null
          id?: string
          job_role: string
          messages?: Json | null
          questions: Json
          start_time?: string | null
          status?: string | null
          suggestions?: Json | null
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string | null
          end_time?: string | null
          feedback?: Json | null
          id?: string
          job_role?: string
          messages?: Json | null
          questions?: Json
          start_time?: string | null
          status?: string | null
          suggestions?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          content: string
          cover_image: string
          created_at: string | null
          excerpt: string
          id: string
          last_updated: string | null
          meta_description: string | null
          meta_title: string | null
          publish_date: string | null
          slug: string
          status: Database["public"]["Enums"]["post_status"] | null
          tags: string[] | null
          title: string
        }
        Insert: {
          author: string
          content: string
          cover_image: string
          created_at?: string | null
          excerpt: string
          id?: string
          last_updated?: string | null
          meta_description?: string | null
          meta_title?: string | null
          publish_date?: string | null
          slug: string
          status?: Database["public"]["Enums"]["post_status"] | null
          tags?: string[] | null
          title: string
        }
        Update: {
          author?: string
          content?: string
          cover_image?: string
          created_at?: string | null
          excerpt?: string
          id?: string
          last_updated?: string | null
          meta_description?: string | null
          meta_title?: string | null
          publish_date?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["post_status"] | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      interview_questions: {
        Row: {
          answer_text: string | null
          feedback: string | null
          id: string
          interview_id: string
          question_text: string
          score: number | null
        }
        Insert: {
          answer_text?: string | null
          feedback?: string | null
          id?: string
          interview_id: string
          question_text: string
          score?: number | null
        }
        Update: {
          answer_text?: string | null
          feedback?: string | null
          id?: string
          interview_id?: string
          question_text?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_questions_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_usage: {
        Row: {
          count: number
          created_at: string
          date: string
          id: string
          interview_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          date: string
          id?: string
          interview_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          date?: string
          id?: string
          interview_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interviews: {
        Row: {
          end_time: string | null
          experience_level: string
          feedback_summary: string | null
          id: string
          job_role: string
          messages: Json | null
          progression_status: string | null
          recording_url: string | null
          start_time: string
          user_id: string
        }
        Insert: {
          end_time?: string | null
          experience_level: string
          feedback_summary?: string | null
          id?: string
          job_role: string
          messages?: Json | null
          progression_status?: string | null
          recording_url?: string | null
          start_time?: string
          user_id: string
        }
        Update: {
          end_time?: string | null
          experience_level?: string
          feedback_summary?: string | null
          id?: string
          job_role?: string
          messages?: Json | null
          progression_status?: string | null
          recording_url?: string | null
          start_time?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          date_joined: string
          full_name: string | null
          id: string
          referral_code: string | null
          referrer_id: string | null
          resume_subscription_status: Database["public"]["Enums"]["subscription_status"]
          resume_subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Insert: {
          date_joined?: string
          full_name?: string | null
          id: string
          referral_code?: string | null
          referrer_id?: string | null
          resume_subscription_status?: Database["public"]["Enums"]["subscription_status"]
          resume_subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
        }
        Update: {
          date_joined?: string
          full_name?: string | null
          id?: string
          referral_code?: string | null
          referrer_id?: string | null
          resume_subscription_status?: Database["public"]["Enums"]["subscription_status"]
          resume_subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
        }
        Relationships: []
      }
      referrals: {
        Row: {
          commission_amount: number | null
          commission_status: string | null
          date_referred: string
          id: string
          referred_id: string
          referrer_id: string
          subscription_id: string | null
        }
        Insert: {
          commission_amount?: number | null
          commission_status?: string | null
          date_referred?: string
          id?: string
          referred_id: string
          referrer_id: string
          subscription_id?: string | null
        }
        Update: {
          commission_amount?: number | null
          commission_status?: string | null
          date_referred?: string
          id?: string
          referred_id?: string
          referrer_id?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          device_count: number | null
          end_date: string | null
          id: string
          payment_provider_subscription_id: string | null
          payment_status: string | null
          plan_type: Database["public"]["Enums"]["subscription_tier"]
          start_date: string
          subscription_type: string
          user_id: string
        }
        Insert: {
          device_count?: number | null
          end_date?: string | null
          id?: string
          payment_provider_subscription_id?: string | null
          payment_status?: string | null
          plan_type: Database["public"]["Enums"]["subscription_tier"]
          start_date?: string
          subscription_type?: string
          user_id: string
        }
        Update: {
          device_count?: number | null
          end_date?: string | null
          id?: string
          payment_provider_subscription_id?: string | null
          payment_status?: string | null
          plan_type?: Database["public"]["Enums"]["subscription_tier"]
          start_date?: string
          subscription_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_resumes: {
        Row: {
          ats_score: number | null
          content: Json
          created_at: string | null
          enhanced_text: string | null
          id: string
          job_description: string | null
          original_text: string | null
          status: string | null
          template_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ats_score?: number | null
          content?: Json
          created_at?: string | null
          enhanced_text?: string | null
          id?: string
          job_description?: string | null
          original_text?: string | null
          status?: string | null
          template_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ats_score?: number | null
          content?: Json
          created_at?: string | null
          enhanced_text?: string | null
          id?: string
          job_description?: string | null
          original_text?: string | null
          status?: string | null
          template_id?: string | null
          title?: string
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
      post_status: "draft" | "published"
      subscription_status: "active" | "expired" | "canceled" | "trial"
      subscription_tier:
        | "bronze"
        | "gold"
        | "diamond"
        | "free"
        | "megastar"
        | "resume_basic"
        | "resume_premium"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      post_status: ["draft", "published"],
      subscription_status: ["active", "expired", "canceled", "trial"],
      subscription_tier: [
        "bronze",
        "gold",
        "diamond",
        "free",
        "megastar",
        "resume_basic",
        "resume_premium",
      ],
    },
  },
} as const
