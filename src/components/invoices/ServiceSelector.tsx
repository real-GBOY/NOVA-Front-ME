/** @format */

import { useMemo, useEffect, useRef } from "react";
import { getCurrentLanguage } from "@/config/i18n";
import SearchableSelect from "./SearchableSelect";
import { departmentService } from "@/services/departmentService";
import { categoryService } from "@/services/categoryService";
import { serviceService } from "@/services/serviceService";

type ServiceSelectorProps = {
   selectedDepartment: string;
   selectedCategory: string;
   selectedService: string;
   onDepartmentChange: (value: string) => void;
   onCategoryChange: (value: string) => void;
   onServiceChange: (value: string) => void;
};

export default function ServiceSelector({
   selectedDepartment,
   selectedCategory,
   selectedService,
   onDepartmentChange,
   onCategoryChange,
   onServiceChange,
}: ServiceSelectorProps) {
   const currentLanguage = getCurrentLanguage();
   const prevDepartmentRef = useRef<string>("");
   const prevCategoryRef = useRef<string>("");

   // Reset category and service when department changes
   useEffect(() => {
      if (
         prevDepartmentRef.current &&
         prevDepartmentRef.current !== selectedDepartment
      ) {
         // Department changed, reset dependent fields
         onCategoryChange("");
         onServiceChange("");
      }
      prevDepartmentRef.current = selectedDepartment;
   }, [selectedDepartment, onCategoryChange, onServiceChange]);

   // Reset service when category changes
   useEffect(() => {
      if (
         prevCategoryRef.current &&
         prevCategoryRef.current !== selectedCategory
      ) {
         // Category changed, reset service
         onServiceChange("");
      }
      prevCategoryRef.current = selectedCategory;
   }, [selectedCategory, onServiceChange]);

   // Fetch department options with server-side search
   const fetchDepartmentOptions = async (search: string): Promise<Array<{ id: string; label: string }>> => {
      const response = await departmentService.list({
         page: 1,
         limit: 50,
         search: search || undefined,
         status: "active",
      });
      return (response.data || []).map((dept) => ({
            id: String(dept.id),
         label: currentLanguage === "ar" ? dept.nameAr || dept.nameEn : dept.nameEn || dept.nameAr,
         }));
   };

   // Fetch category options with server-side search
   const fetchCategoryOptions = async (search: string): Promise<Array<{ id: string; label: string }>> => {
      if (!selectedDepartment) return [];
      // Pass department_id as a query parameter (backend may accept it)
      const response = await categoryService.list({
         page: 1,
         limit: 50,
         search: search || undefined,
         status: "active",
      } as any);
      // Filter by department_id client-side if backend doesn't support it
      const filtered = (response.data || []).filter(
         (cat) => String(cat.departmentId) === String(selectedDepartment)
      );
      return filtered.map((cat) => ({
            id: String(cat.id),
         label: currentLanguage === "ar" ? cat.nameAr || cat.nameEn : cat.nameEn || cat.nameAr,
         }));
   };

   // Fetch service options with server-side search
   const fetchServiceOptions = async (search: string): Promise<Array<{ id: string; label: string }>> => {
      const response = await serviceService.list({
         page: 1,
         limit: 50,
         search: search || undefined,
         status: "active",
      } as any);
      // Filter by department_id and category_id client-side if backend doesn't support them
      let filtered = response.data || [];
      if (selectedDepartment) {
         filtered = filtered.filter(
               (svc) => String(svc.departmentId) === String(selectedDepartment)
         );
      }
      if (selectedCategory) {
         filtered = filtered.filter(
            (svc) => String(svc.categoryId) === String(selectedCategory)
         );
      }
      return filtered.map((svc) => ({
         id: `${svc.id}|${currentLanguage === "ar" ? svc.nameAr || svc.nameEn : svc.nameEn || svc.nameAr}`,
         label: currentLanguage === "ar" ? svc.nameAr || svc.nameEn : svc.nameEn || svc.nameAr,
      }));
   };

   return (
      <>
         <div className="flex gap-4">
            <div className="flex-1">
               <SearchableSelect
                  label="Department"
                  placeholder="Find Department (Optional)"
                  value={selectedDepartment}
                  onChange={onDepartmentChange}
                  options={[]}
                  serverSideSearch={true}
                  fetchOptions={fetchDepartmentOptions}
               />
            </div>
            <div className="flex-1">
               <SearchableSelect
                  label="Category"
                  placeholder="Find Category (Optional)"
                  value={selectedCategory}
                  onChange={onCategoryChange}
                  options={[]}
                  disabled={!selectedDepartment}
                  serverSideSearch={true}
                  fetchOptions={fetchCategoryOptions}
               />
            </div>
         </div>

         <SearchableSelect
            label="Service"
            placeholder="Find Service"
            value={selectedService}
            onChange={onServiceChange}
            options={[]}
            disabled={!selectedDepartment}
            required
            serverSideSearch={true}
            fetchOptions={fetchServiceOptions}
         />
      </>
   );
}
