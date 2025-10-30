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
      assigned_sites: {
        Row: {
          created_at: string | null
          effective_rate_date: string | null
          id: string
          is_primary: boolean | null
          officer_id: string
          rate: number | null
          site_name: string
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          effective_rate_date?: string | null
          id?: string
          is_primary?: boolean | null
          officer_id: string
          rate?: number | null
          site_name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          effective_rate_date?: string | null
          id?: string
          is_primary?: boolean | null
          officer_id?: string
          rate?: number | null
          site_name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assigned_sites_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assigned_sites_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officer_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          certification_number: string | null
          certification_type: string | null
          created_at: string | null
          credential_id: string | null
          description: string | null
          document_back_url: string | null
          document_front_url: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuing_organization: string | null
          license_level: string | null
          name: string
          officer_id: string
        }
        Insert: {
          certification_number?: string | null
          certification_type?: string | null
          created_at?: string | null
          credential_id?: string | null
          description?: string | null
          document_back_url?: string | null
          document_front_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_organization?: string | null
          license_level?: string | null
          name: string
          officer_id: string
        }
        Update: {
          certification_number?: string | null
          certification_type?: string | null
          created_at?: string | null
          credential_id?: string | null
          description?: string | null
          document_back_url?: string | null
          document_front_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_organization?: string | null
          license_level?: string | null
          name?: string
          officer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certifications_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certifications_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officer_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profiles: {
        Row: {
          account_status: string | null
          company_name: string
          company_number: string | null
          company_phone: string | null
          company_phone_ext: string | null
          company_size: string | null
          company_state: string | null
          contact_cell_phone: string | null
          contact_email: string | null
          contact_person_name: string | null
          contact_person_position: string | null
          contact_person_title: string | null
          created_at: string | null
          facebook_url: string | null
          id: string
          industry: string | null
          instagram_url: string | null
          last_payment_date: string | null
          license_number: string | null
          license_types: string[] | null
          licensed_states: string[] | null
          linkedin_url: string | null
          logo_url: string | null
          payment_due_date: string | null
          payment_status: string | null
          subscription_start_date: string | null
          subscription_status: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          trial_end_date: string | null
          trial_start_date: string | null
          twitter_url: string | null
          updated_at: string | null
          user_id: string
          website_url: string | null
          year_founded: number | null
          years_in_business: string | null
        }
        Insert: {
          account_status?: string | null
          company_name: string
          company_number?: string | null
          company_phone?: string | null
          company_phone_ext?: string | null
          company_size?: string | null
          company_state?: string | null
          contact_cell_phone?: string | null
          contact_email?: string | null
          contact_person_name?: string | null
          contact_person_position?: string | null
          contact_person_title?: string | null
          created_at?: string | null
          facebook_url?: string | null
          id?: string
          industry?: string | null
          instagram_url?: string | null
          last_payment_date?: string | null
          license_number?: string | null
          license_types?: string[] | null
          licensed_states?: string[] | null
          linkedin_url?: string | null
          logo_url?: string | null
          payment_due_date?: string | null
          payment_status?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
          year_founded?: number | null
          years_in_business?: string | null
        }
        Update: {
          account_status?: string | null
          company_name?: string
          company_number?: string | null
          company_phone?: string | null
          company_phone_ext?: string | null
          company_size?: string | null
          company_state?: string | null
          contact_cell_phone?: string | null
          contact_email?: string | null
          contact_person_name?: string | null
          contact_person_position?: string | null
          contact_person_title?: string | null
          created_at?: string | null
          facebook_url?: string | null
          id?: string
          industry?: string | null
          instagram_url?: string | null
          last_payment_date?: string | null
          license_number?: string | null
          license_types?: string[] | null
          licensed_states?: string[] | null
          linkedin_url?: string | null
          logo_url?: string | null
          payment_due_date?: string | null
          payment_status?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
          year_founded?: number | null
          years_in_business?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "safe_officer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employment_updates: {
        Row: {
          created_at: string | null
          created_by_user_id: string
          document_url: string | null
          hire_id: string
          id: string
          notes: string | null
          rating: number | null
          update_type: string
        }
        Insert: {
          created_at?: string | null
          created_by_user_id: string
          document_url?: string | null
          hire_id: string
          id?: string
          notes?: string | null
          rating?: number | null
          update_type: string
        }
        Update: {
          created_at?: string | null
          created_by_user_id?: string
          document_url?: string | null
          hire_id?: string
          id?: string
          notes?: string | null
          rating?: number | null
          update_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "employment_updates_hire_id_fkey"
            columns: ["hire_id"]
            isOneToOne: false
            referencedRelation: "hires"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          areas_of_improvement: string | null
          attendance_rating: number | null
          completed_date: string | null
          created_at: string | null
          due_date: string
          evaluation_period: string
          hire_id: string
          id: string
          overall_rating: number | null
          performance_notes: string | null
          professionalism_rating: number | null
          quality_of_work_rating: number | null
          reliability_rating: number | null
          sent_date: string | null
          updated_at: string | null
          would_rehire: boolean | null
        }
        Insert: {
          areas_of_improvement?: string | null
          attendance_rating?: number | null
          completed_date?: string | null
          created_at?: string | null
          due_date: string
          evaluation_period: string
          hire_id: string
          id?: string
          overall_rating?: number | null
          performance_notes?: string | null
          professionalism_rating?: number | null
          quality_of_work_rating?: number | null
          reliability_rating?: number | null
          sent_date?: string | null
          updated_at?: string | null
          would_rehire?: boolean | null
        }
        Update: {
          areas_of_improvement?: string | null
          attendance_rating?: number | null
          completed_date?: string | null
          created_at?: string | null
          due_date?: string
          evaluation_period?: string
          hire_id?: string
          id?: string
          overall_rating?: number | null
          performance_notes?: string | null
          professionalism_rating?: number | null
          quality_of_work_rating?: number | null
          reliability_rating?: number | null
          sent_date?: string | null
          updated_at?: string | null
          would_rehire?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_hire_id_fkey"
            columns: ["hire_id"]
            isOneToOne: false
            referencedRelation: "hires"
            referencedColumns: ["id"]
          },
        ]
      }
      hires: {
        Row: {
          company_id: string
          created_at: string | null
          hire_date: string
          hired_by_user_id: string
          id: string
          officer_id: string
          position_title: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          hire_date: string
          hired_by_user_id: string
          id?: string
          officer_id: string
          position_title?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          hire_date?: string
          hired_by_user_id?: string
          id?: string
          officer_id?: string
          position_title?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hires_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hires_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hires_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officer_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          created_at: string | null
          id: string
          job_posting_id: string
          message: string | null
          officer_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_posting_id: string
          message?: string | null
          officer_id: string
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          job_posting_id?: string
          message?: string | null
          officer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officer_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          company_id: string
          created_at: string | null
          description: string | null
          employment_type: string[] | null
          hourly_rate_max: number | null
          hourly_rate_min: number | null
          id: string
          location: string | null
          requirements: string | null
          shift_type: string[] | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          description?: string | null
          employment_type?: string[] | null
          hourly_rate_max?: number | null
          hourly_rate_min?: number | null
          id?: string
          location?: string | null
          requirements?: string | null
          shift_type?: string[] | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          description?: string | null
          employment_type?: string[] | null
          hourly_rate_max?: number | null
          hourly_rate_min?: number | null
          id?: string
          location?: string | null
          requirements?: string | null
          shift_type?: string[] | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          officer_id: string
          sender_type: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          officer_id: string
          sender_type: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          officer_id?: string
          sender_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officer_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      officer_interests: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          officer_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          officer_id: string
          status: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          officer_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "officer_interests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "officer_interests_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "officer_interests_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officer_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      officer_profiles: {
        Row: {
          account_status: string | null
          address_city: string | null
          address_country: string | null
          address_state: string | null
          address_street: string | null
          address_unit: string | null
          address_zip: string | null
          availability_schedule: Json | null
          availability_status: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          date_of_birth: string | null
          desired_salary: number | null
          employment_type: string[] | null
          hourly_rate: number | null
          id: string
          linkedin_url: string | null
          location: string | null
          main_region: string | null
          officer_number: string | null
          phone: string | null
          resume_url: string | null
          shift_preference: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
          years_experience: number | null
        }
        Insert: {
          account_status?: string | null
          address_city?: string | null
          address_country?: string | null
          address_state?: string | null
          address_street?: string | null
          address_unit?: string | null
          address_zip?: string | null
          availability_schedule?: Json | null
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          desired_salary?: number | null
          employment_type?: string[] | null
          hourly_rate?: number | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          main_region?: string | null
          officer_number?: string | null
          phone?: string | null
          resume_url?: string | null
          shift_preference?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          years_experience?: number | null
        }
        Update: {
          account_status?: string | null
          address_city?: string | null
          address_country?: string | null
          address_state?: string | null
          address_street?: string | null
          address_unit?: string | null
          address_zip?: string | null
          availability_schedule?: Json | null
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          desired_salary?: number | null
          employment_type?: string[] | null
          hourly_rate?: number | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          main_region?: string | null
          officer_number?: string | null
          phone?: string | null
          resume_url?: string | null
          shift_preference?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "officer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "officer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "safe_officer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          company_id: string
          id: string
          officer_id: string
          viewed_at: string | null
          viewer_user_id: string
        }
        Insert: {
          company_id: string
          id?: string
          officer_id: string
          viewed_at?: string | null
          viewer_user_id: string
        }
        Update: {
          company_id?: string
          id?: string
          officer_id?: string
          viewed_at?: string | null
          viewer_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officer_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_interviews: {
        Row: {
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          officer_id: string
          title: string | null
          video_url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          officer_id: string
          title?: string | null
          video_url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          officer_id?: string
          title?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_interviews_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_interviews_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officer_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      work_history: {
        Row: {
          company_address: string | null
          company_city: string | null
          company_name: string
          company_phone: string | null
          company_state: string | null
          company_zip: string | null
          created_at: string
          end_date: string | null
          id: string
          job_description: string | null
          may_contact: boolean | null
          officer_id: string
          position_title: string | null
          reason_for_leaving: string | null
          start_date: string | null
          supervisor_name: string | null
          supervisor_phone: string | null
          updated_at: string
        }
        Insert: {
          company_address?: string | null
          company_city?: string | null
          company_name: string
          company_phone?: string | null
          company_state?: string | null
          company_zip?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          job_description?: string | null
          may_contact?: boolean | null
          officer_id: string
          position_title?: string | null
          reason_for_leaving?: string | null
          start_date?: string | null
          supervisor_name?: string | null
          supervisor_phone?: string | null
          updated_at?: string
        }
        Update: {
          company_address?: string | null
          company_city?: string | null
          company_name?: string
          company_phone?: string | null
          company_state?: string | null
          company_zip?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          job_description?: string | null
          may_contact?: boolean | null
          officer_id?: string
          position_title?: string | null
          reason_for_leaving?: string | null
          start_date?: string | null
          supervisor_name?: string | null
          supervisor_phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      officer_certifications_summary: {
        Row: {
          certification_type: string | null
          expiry_date: string | null
          issue_date: string | null
          issuing_organization: string | null
          license_level: string | null
          name: string | null
          officer_id: string | null
        }
        Insert: {
          certification_type?: string | null
          expiry_date?: string | null
          issue_date?: string | null
          issuing_organization?: string | null
          license_level?: string | null
          name?: string | null
          officer_id?: string | null
        }
        Update: {
          certification_type?: string | null
          expiry_date?: string | null
          issue_date?: string | null
          issuing_organization?: string | null
          license_level?: string | null
          name?: string | null
          officer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certifications_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certifications_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officer_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      officer_profiles_public: {
        Row: {
          availability_schedule: Json | null
          availability_status: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          employment_type: string[] | null
          hourly_rate: number | null
          id: string | null
          location: string | null
          main_region: string | null
          shift_preference: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          availability_schedule?: Json | null
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          employment_type?: string[] | null
          hourly_rate?: number | null
          id?: string | null
          location?: string | null
          main_region?: string | null
          shift_preference?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          availability_schedule?: Json | null
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          employment_type?: string[] | null
          hourly_rate?: number | null
          id?: string | null
          location?: string | null
          main_region?: string | null
          shift_preference?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "officer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "officer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "safe_officer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      safe_officer_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_overdue_payments: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "company" | "officer" | "view_only" | "full_access"
      subscription_tier: "free" | "professional" | "premium"
      user_role: "officer" | "company"
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
      app_role: ["admin", "company", "officer", "view_only", "full_access"],
      subscription_tier: ["free", "professional", "premium"],
      user_role: ["officer", "company"],
    },
  },
} as const
