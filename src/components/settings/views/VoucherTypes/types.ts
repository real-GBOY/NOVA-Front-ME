/** @format */

export type VoucherDirection = "to" | "from" | "both";
export type VoucherStatus = "active" | "inactive" | "fullyPaid";

export interface VoucherType {
   id: string | number;
   name: string;
   direction: VoucherDirection | string; // Backend returns "To (Receiver)", "From (Source)", "Both"
   description?: string;
   status: VoucherStatus | "Active" | "Inactive";
   // Backend fields
   voucher_type_id?: string | number;
   voucher_type_name?: string;
   usage_count?: number;
   last_used_at?: string | null;
   created_at?: string;
   updated_at?: string;
}
