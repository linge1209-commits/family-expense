export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      ledgers: {
        Row: {
          id: string
          name: string
          icon: string
          initial_balance: number
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon?: string
          initial_balance?: number
          created_by?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          icon?: string
          initial_balance?: number
        }
        Relationships: []
      }
      ledger_transfers: {
        Row: {
          id: string
          from_ledger_id: string
          to_ledger_id: string
          amount: number
          note: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          from_ledger_id: string
          to_ledger_id: string
          amount: number
          note?: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_transfers_from_ledger_id_fkey"
            columns: ["from_ledger_id"]
            isOneToOne: false
            referencedRelation: "ledgers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_transfers_to_ledger_id_fkey"
            columns: ["to_ledger_id"]
            isOneToOne: false
            referencedRelation: "ledgers"
            referencedColumns: ["id"]
          }
        ]
      }
      family_members: {
        Row: {
          id: string
          email: string
          display_name: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          display_name: string
          created_at?: string
        }
        Update: {
          email?: string
          display_name?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: number
          name: string
          icon: string
          monthly_budget: number | null
          sort_order: number
        }
        Insert: {
          name: string
          icon?: string
          monthly_budget?: number | null
          sort_order?: number
        }
        Update: {
          name?: string
          icon?: string
          monthly_budget?: number | null
          sort_order?: number
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          date: string
          amount: number
          category_id: number | null
          description: string
          payer: string
          added_by: string | null
          added_by_email: string
          ledger_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date?: string
          amount: number
          category_id?: number | null
          description: string
          payer: string
          added_by?: string | null
          added_by_email: string
          ledger_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          date?: string
          amount?: number
          category_id?: number | null
          description?: string
          payer?: string
          ledger_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_ledger_id_fkey"
            columns: ["ledger_id"]
            isOneToOne: false
            referencedRelation: "ledgers"
            referencedColumns: ["id"]
          }
        ]
      }
      monthly_budgets: {
        Row: {
          id: number
          year: number
          month: number
          category_id: number
          budget: number
        }
        Insert: {
          year: number
          month: number
          category_id: number
          budget: number
        }
        Update: {
          budget?: number
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_family_member: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type Category = Database['public']['Tables']['categories']['Row']
export type FamilyMember = Database['public']['Tables']['family_members']['Row']
export type MonthlyBudget = Database['public']['Tables']['monthly_budgets']['Row']
export type Ledger = Database['public']['Tables']['ledgers']['Row']
export type LedgerInsert = Database['public']['Tables']['ledgers']['Insert']
export type LedgerTransfer = Database['public']['Tables']['ledger_transfers']['Row']

export type TransactionWithCategory = Transaction & {
  categories: Pick<Category, 'id' | 'name' | 'icon'> | null
  ledgers: Pick<Ledger, 'id' | 'name' | 'icon'> | null
}
