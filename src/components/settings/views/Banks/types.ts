/** @format */

export interface Bank {
   id: string | number;
   name: string;
   shortCode: string;
   balance: string;
   status: "active" | "inactive" | "Active" | "Inactive";
   // Backend fields
   bank_id?: string | number;
   account_id?: string | number;
   bank_name?: string;
   account_name?: string;
   account_code?: string | null;
   account_number?: string;
   iban?: string;
   swift_code?: string;
   currency?: string;
   opening_balance?: number;
   current_balance?: number;
   is_active?: boolean;
   last_reconciled_at?: string | null;
   created_at?: string;
   updated_at?: string;
}

export interface BankFormData {
   name: string;
   shortCode: string;
   balance: string;
   status: "active" | "inactive";
}
