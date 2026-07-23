/** @format */

export interface PrettyCashName {
   id: string | number;
   name: string;
   balance: string;
   status: "active" | "inactive" | "fullyPaid" | "Active" | "Inactive";
   // Backend fields
   petty_cash_id?: string | number;
   account_id?: string | number;
   account_name?: string;
   account_code?: string | null;
   currency?: string;
   opening_balance?: number;
   current_balance?: number;
   is_active?: boolean;
   last_reconciled_at?: string | null;
   created_at?: string;
   updated_at?: string;
}
