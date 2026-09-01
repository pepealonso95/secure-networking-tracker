export interface Contact {
  id: number;
  name: string;
  company: string | null;
  role: string | null;
  where_met: string | null;
  notes: string | null;
  priority: "high" | "medium" | "low";
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      contacts: {
        Row: Contact & { user_id: string };
        Insert: {
          id?: never;
          user_id?: never;
          name: string;
          company?: string | null;
          role?: string | null;
          where_met?: string | null;
          notes?: string | null;
          priority?: "high" | "medium" | "low";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: never;
          name?: string;
          company?: string | null;
          role?: string | null;
          where_met?: string | null;
          notes?: string | null;
          priority?: "high" | "medium" | "low";
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

