/** @format */

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";
import { useTranslation } from "@/hooks/useTranslation";
import { useListEmployees } from "@/hooks/employees/employee.queries";
import { useDebounce } from "@/hooks/useDebounce";
import Loader from "./Loader";

type Member = {
   id: string;
   name: string;
   username: string;
   avatar?: string;
};

type MemberPickerProps = {
   label?: string;
   placeholder?: string;
   selectedMembers: Member[];
   availableMembers?: Member[]; // Optional - if not provided, uses server-side fetching
   onChange: (members: Member[]) => void;
   optional?: boolean;
   serverSide?: boolean; // Force server-side mode even if availableMembers is provided
   filters?: {
      status?: string;
      role_id?: number;
      team_id?: number;
   };
};

function MemberPicker({
   label,
   placeholder,
   selectedMembers,
   availableMembers,
   onChange,
   optional = false,
   serverSide = false,
   filters,
}: MemberPickerProps) {
   const { t } = useTranslation("common");
   const [searchQuery, setSearchQuery] = useState("");
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const [currentPage, setCurrentPage] = useState(1);
   const inputRef = useRef<HTMLInputElement>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);

   // Determine if we should use server-side fetching
   const useServerSide = serverSide || !availableMembers;

   // Debounce search query for server-side
   const debouncedSearch = useDebounce(searchQuery, 300);

   // Reset to page 1 when search changes
   useEffect(() => {
      if (useServerSide) {
         setCurrentPage(1);
      }
   }, [debouncedSearch, useServerSide]);

   // Fetch employees from server if using server-side mode
   const {
      data: employeesData,
      isLoading: isLoadingEmployees,
   } = useListEmployees(
      useServerSide
         ? {
              page: currentPage,
              limit: 10,
              search: debouncedSearch || undefined,
              ...filters,
           }
         : undefined,
      {
         enabled: useServerSide && isDropdownOpen,
      }
   );

   // Transform server data to Member format
   const serverMembers: Member[] = useMemo(() => {
      if (!employeesData?.data) return [];
      return employeesData.data.map((employee) => ({
         id: String(employee.id),
         name: employee.name,
         username: employee.email.split("@")[0] || employee.email,
         avatar: employee.avatar || undefined,
      }));
   }, [employeesData]);

   // Use server-side members or client-side availableMembers
   const allMembers = useServerSide ? serverMembers : (availableMembers || []);

   // Filter out already selected members
   const filteredMembers = allMembers.filter(
      (member) => !selectedMembers.find((sm) => sm.id === member.id)
   );

   // For client-side mode, also filter by search query
   const finalFilteredMembers = useServerSide
      ? filteredMembers
      : filteredMembers.filter(
           (member) =>
              member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              member.username.toLowerCase().includes(searchQuery.toLowerCase())
        );

   const pagination = employeesData?.pagination;
   const hasMorePages =
      pagination && currentPage < Math.ceil(pagination.total / pagination.limit);
   const hasPreviousPage = pagination && currentPage > 1;

   const handleSelectMember = (member: Member) => {
      onChange([...selectedMembers, member]);
      setSearchQuery("");
      inputRef.current?.focus();
   };

   const handleRemoveMember = (memberId: string) => {
      onChange(selectedMembers.filter((m) => m.id !== memberId));
   };

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
         ) {
            setIsDropdownOpen(false);
            if (useServerSide) {
               setCurrentPage(1);
               setSearchQuery("");
            }
         }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, [useServerSide]);

   const displayLabel = label || t("memberPicker.label");
   const displayPlaceholder = placeholder || t("memberPicker.placeholder");

   return (
      <div className="space-y-2">
         <label className="block text-sm font-medium text-text-strong">
            {displayLabel}{" "}
            {optional && (
               <span className="text-text-soft">({t("actions.optional")})</span>
            )}
         </label>

         <div ref={dropdownRef}>
            <div className="w-full min-h-12 px-4 py-2 rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
               <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((member) => (
                     <MemberChip
                        key={member.id}
                        member={member}
                        onRemove={handleRemoveMember}
                     />
                  ))}
                  <input
                     ref={inputRef}
                     type="text"
                     value={searchQuery}
                     onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                     }}
                     onFocus={() => setIsDropdownOpen(true)}
                     placeholder={
                        selectedMembers.length === 0 ? displayPlaceholder : ""
                     }
                     className="flex-1 min-w-[120px] outline-none text-sm text-text-strong placeholder:text-text-soft bg-transparent"
                  />
               </div>
            </div>

            {/* Dropdown */}
            <AnimatePresence>
               {isDropdownOpen && (
                  <motion.div
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     transition={{ duration: 0.2 }}
                     className="w-full sm:w-80 mt-2 bg-background rounded-lg border border-border shadow-lg max-h-60 flex flex-col">
                     {/* Loading State */}
                     {isLoadingEmployees && (
                        <div className="flex items-center justify-center py-4">
                           <Loader size="sm" />
                        </div>
                     )}

                     {/* Members List */}
                     {!isLoadingEmployees && (
                        <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                           {finalFilteredMembers.length > 0 ? (
                              finalFilteredMembers.map((member) => (
                                 <Button
                                    key={member.id}
                                    variant="secondary"
                                    onClick={() => handleSelectMember(member)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-weak transition-colors text-left">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-text-main text-sm font-semibold shrink-0">
                                       {member.avatar ? (
                                          <img
                                             src={member.avatar}
                                             alt={member.name}
                                             className="w-full h-full rounded-full object-cover"
                                          />
                                       ) : (
                                          member.name.charAt(0).toUpperCase()
                                       )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className="text-sm font-medium text-text-strong truncate">
                                          {member.name}
                                       </p>
                                       <p className="text-xs text-text-sub truncate">
                                          @{member.username}
                                       </p>
                                    </div>
                                 </Button>
                              ))
                           ) : (
                              <div className="px-4 py-3 text-sm text-text-sub text-center">
                                 {t("common.noData")}
                              </div>
                           )}
                        </div>
                     )}

                     {/* Pagination Controls */}
                     {useServerSide &&
                        !isLoadingEmployees &&
                        pagination &&
                        (hasMorePages || hasPreviousPage) && (
                           <div className="flex items-center justify-between px-4 py-2 border-t border-border">
                              <Button
                                 variant="secondary"
                                 onClick={() => {
                                    if (hasPreviousPage) {
                                       setCurrentPage(currentPage - 1);
                                    }
                                 }}
                                 disabled={!hasPreviousPage}
                                 className="text-xs">
                                 {t("pagination.previous")}
                              </Button>
                              <span className="text-xs text-text-sub">
                                 {t("pagination.pageOf", {
                                    current: currentPage,
                                    total: Math.ceil(
                                       pagination.total / pagination.limit
                                    ),
                                 })}
                              </span>
                              <Button
                                 variant="secondary"
                                 onClick={() => {
                                    if (hasMorePages) {
                                       setCurrentPage(currentPage + 1);
                                    }
                                 }}
                                 disabled={!hasMorePages}
                                 className="text-xs">
                                 {t("pagination.next")}
                              </Button>
                           </div>
                        )}
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
   );
}

function MemberChip({
   member,
   onRemove,
}: {
   member: Member;
   onRemove: (id: string) => void;
}) {
   return (
      <motion.div
         initial={{ scale: 0.8, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         exit={{ scale: 0.8, opacity: 0 }}
         className="flex items-center gap-2 pl-2 pr-1 py-1 bg-bg-weak rounded-lg border border-border">
         <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-text-main text-xs font-semibold">
            {member.avatar ? (
               <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full rounded-full object-cover"
               />
            ) : (
               member.name.charAt(0).toUpperCase()
            )}
         </div>
         <span className="text-sm font-medium text-text-strong">
            {member.name}
         </span>
         <Button
            variant="secondary"
            onClick={() => onRemove(member.id)}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-border transition-colors">
            <svg
               xmlns="http://www.w3.org/2000/svg"
               width="12"
               height="12"
               viewBox="0 0 24 24"
               fill="none"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round">
               <line x1="18" y1="6" x2="6" y2="18" />
               <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
         </Button>
      </motion.div>
   );
}

export default MemberPicker;
