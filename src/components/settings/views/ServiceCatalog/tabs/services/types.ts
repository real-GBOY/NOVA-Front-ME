/** @format */

export interface Service {
   id: string | number;
   code?: string;
   nameEn: string;
   nameAr: string;
   departmentId: string | number;
   departmentNameEn?: string;
   departmentNameAr?: string;
   categoryId: string | number;
   categoryNameEn?: string;
   categoryNameAr?: string;
   serviceCharge: number;
   govFees: number;
   vat: number;
   vatPercentage?: number;
   totalAmount?: number;
   status: "active" | "inactive";
   created_at?: string;
   updated_at?: string;
}
