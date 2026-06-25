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
      accounts: {
        Row: {
          access_token: string | null
          expires_at: number | null
          id: string
          id_token: string | null
          provider: string
          provider_account_id: string
          refresh_token: string | null
          scope: string | null
          session_state: string | null
          token_type: string | null
          type: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          expires_at?: number | null
          id?: string
          id_token?: string | null
          provider: string
          provider_account_id: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          expires_at?: number | null
          id?: string
          id_token?: string | null
          provider?: string
          provider_account_id?: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_logs: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          resume_id: string
          slug: string
          theme: string
          updated_at: string
          user_id: string
          views: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          resume_id: string
          slug: string
          theme?: string
          updated_at?: string
          user_id: string
          views?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          resume_id?: string
          slug?: string
          theme?: string
          updated_at?: string
          user_id?: string
          views?: number
        }
        Relationships: []
      }
      resumes: {
        Row: {
          created_at: string
          data: Json
          id: string
          is_public: boolean
          template: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          is_public?: boolean
          template?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          is_public?: boolean
          template?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          id: string
          job_data: Json
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          job_data?: Json
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          job_data?: Json
          saved_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          expires: string
          id: string
          session_token: string
          user_id: string
        }
        Insert: {
          expires: string
          id?: string
          session_token: string
          user_id: string
        }
        Update: {
          expires?: string
          id?: string
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          credits: number
          email: string | null
          email_verified: string | null
          id: string
          image: string | null
          name: string | null
          password: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          credits?: number
          email?: string | null
          email_verified?: string | null
          id?: string
          image?: string | null
          name?: string | null
          password?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          credits?: number
          email?: string | null
          email_verified?: string | null
          id?: string
          image?: string | null
          name?: string | null
          password?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      verification_tokens: {
        Row: {
          expires: string
          identifier: string
          token: string
        }
        Insert: {
          expires: string
          identifier: string
          token: string
        }
        Update: {
          expires?: string
          identifier?: string
          token?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      decrement_credits: { Args: { user_id: string }; Returns: number }
      increment_portfolio_views: { Args: { portfolio_id: string }; Returns: undefined }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type UserRow = Database['public']['Tables']['users']['Row']
export type ResumeRow = Database['public']['Tables']['resumes']['Row']
export type PortfolioRow = Database['public']['Tables']['portfolios']['Row']
export type SavedJobRow = Database['public']['Tables']['saved_jobs']['Row']
export type CreditLogRow = Database['public']['Tables']['credit_logs']['Row']
