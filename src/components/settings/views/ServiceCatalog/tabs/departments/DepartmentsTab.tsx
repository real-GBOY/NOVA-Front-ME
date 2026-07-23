/** @format */

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { ColumnDef, PaginationState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/designSystem/ui/data-table";
import { useTranslation } from "@/hooks/useTranslation";
import Checkbox from "@/designSystem/Checkbox";
import StatusTag from "@/designSystem/StatusTag";
import Dropdown, { DropdownItem } from "@/designSystem/Dropdown";
import DeleteDepartmentModal from "../../modals/DeleteDepartmentModal";
import { MoreVertical, Edit, Trash } from "@/Icons";
import DepartmentsFloatingActionBar from "./DepartmentsFloatingActionBar";
import LoadingState from "@/designSystem/LoadingState";
import { DepartmentsFilters } from "./DepartmentsFilterDropdown";
import { useDeleteDepartment, useListDepartments } from "@/hooks/departments/useDepartment";
import { Department } from "@/services/departmentService";
import toast from "@/utilities/toast";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";

interface DepartmentsTabProps {
   searchQuery: string;
   filters: DepartmentsFilters;
   sortBy: string;
   onEdit: (department: Department) => void;
}

// Actions Cell Component
function ActionsCell({
   department,
   onDelete,
   onEdit,
   canEdit,
   canDelete,
}: {
   department: Department;
   onDelete: (dept: Department) => void;
   onEdit: (dept: Department) => void;
   canEdit: boolean;
   canDelete: boolean;
}) {
   const { t } = useTranslation("settings");
   const [isOpen, setIsOpen] = useState(false);
   const buttonRef = useRef<HTMLButtonElement>(null);

   const dropdownItems: DropdownItem[] = [
      ...(canEdit
         ? [
              {
                 id: "edit",
                 label: t("serviceCatalog.floatingBar.editDepartment"),
                 icon: Edit,
                 onClick: () => {
                    onEdit(department);
                    setIsOpen(false);
                 },
                 variant: "default" as const,
              },
           ]
         : []),
      ...(canDelete
         ? [
              {
                 id: "delete",
                 label: t("serviceCatalog.floatingBar.deleteDepartment"),
                 icon: Trash,
                 onClick: () => {
                    onDelete(department);
                    setIsOpen(false);
                 },
                 variant: "danger" as const,
              },
           ]
         : []),
   ];

   if (dropdownItems.length === 0) return null;

   return (
      <div className="flex justify-end">
         <button
            ref={buttonRef}
            type="button"
            aria-label={t("serviceCatalog.actions.more")}
            className={`p-1.5 transition-colors rounded-lg flex items-center justify-center w-8 h-8 ${
               isOpen
                  ? "bg-bg-weak"
                  : "bg-transparent hover:bg-bg-weak active:bg-border"
            }`}
            data-row-menu-trigger
            onClick={() => setIsOpen(!isOpen)}>
            <MoreVertical size={20} />
         </button>

         <Dropdown
            items={dropdownItems}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            anchorRef={buttonRef}
         />
      </div>
   );
}

function DepartmentsTab({ searchQuery, filters, sortBy, onEdit }: DepartmentsTabProps) {
   const { t } = useTranslation("settings");
   const { can } = usePermissions();
   const canViewDepartments = can("view_departments");
   const canUpdateDepartment = can("update_department");
   const canDeleteDepartment = can("delete_department");
   const [departmentToDelete, setDepartmentToDelete] =
      useState<Department | null>(null);
   const [departmentsToDelete, setDepartmentsToDelete] = useState<
      Department[] | null
   >(null);
   const [deleteButtonState, setDeleteButtonState] = useState<
      "idle" | "loading" | "success"
   >("idle");
   const [bulkDeleteButtonState, setBulkDeleteButtonState] = useState<
      "idle" | "loading" | "success"
   >("idle");
   const [selectionResetSignal, setSelectionResetSignal] = useState(0);
   
   // Pagination state
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(12);
   
   // Map UI sort options to backend column/order
   const sortConfig: Record<string, { field: string; order: "asc" | "desc" }> =
      {
         nameAsc: { field: "department_name_en", order: "asc" },
         nameDesc: { field: "department_name_en", order: "desc" },
         newest: { field: "created_at", order: "desc" },
         oldest: { field: "created_at", order: "asc" },
      };
   const { field: sortField, order: sortOrder } =
      sortConfig[sortBy] || sortConfig.newest;

   // Reset page when filters or search change
   useEffect(() => {
      setPage(1);
   }, [searchQuery, filters.status, sortBy]);

   // Fetch departments with server-side pagination, search, filtering, and sorting
   const { data: departmentsResponse, isLoading, error } = useListDepartments(
      {
         page,
         limit: pageSize,
         search: searchQuery || undefined,
         status: filters.status
            ? filters.status.charAt(0).toUpperCase() + filters.status.slice(1)
            : undefined,
         sort_by: sortField,
         sort_order: sortOrder,
      },
      { enabled: canViewDepartments }
   );

   const departments = departmentsResponse?.data || [];

   const totalPages = departmentsResponse?.pagination?.total_pages || 1;

   const handlePaginationChange = (updater: Updater<PaginationState>) => {
         if (typeof updater === "function") {
         const newState = updater({ pageIndex: page - 1, pageSize });
         setPage(newState.pageIndex + 1);
         setPageSize(newState.pageSize);
      } else {
         setPage(updater.pageIndex + 1);
         setPageSize(updater.pageSize);
      }
   };

   const deleteMutation = useDeleteDepartment();

   // Bulk actions handlers
   const handleBulkDelete = useCallback((departments: Department[]) => {
      setDepartmentsToDelete(departments);
   }, []);

   const handleEditDepartment = useCallback(
      (department: Department) => {
         onEdit(department);
      },
      [onEdit]
   );

   // Floating action bar
   const renderFloatingBar = useCallback(
      (selectedCount: number, selectedRows: Department[]) => (
         <DepartmentsFloatingActionBar
            selectedCount={selectedCount}
            selectedRows={selectedRows}
            onDelete={handleBulkDelete}
            onEdit={handleEditDepartment}
            canEdit={canUpdateDepartment}
            canDelete={canDeleteDepartment}
            resetSignal={selectionResetSignal}
         />
      ),
      [handleBulkDelete, handleEditDepartment, selectionResetSignal, canUpdateDepartment, canDeleteDepartment]
   );

   const columns: ColumnDef<Department>[] = useMemo(
      () => [
         ...(canDeleteDepartment
            ? [
                 {
                    id: "select",
                    header: ({ table }: { table: { getIsAllPageRowsSelected: () => boolean; toggleAllPageRowsSelected: (value: boolean) => void } }) => (
                       <Checkbox
                          checked={table.getIsAllPageRowsSelected()}
                          onChange={(e) =>
                             table.toggleAllPageRowsSelected(e.target.checked)
                          }
                          className="m-0 mb-0.5 me-0.5"
                       />
                    ),
                    cell: ({ row }: { row: { original: Department; getIsSelected: () => boolean; toggleSelected: (value: boolean) => void } }) => {
                       const department = row.original;
                       const hasDependencies =
                          (department.categoriesCount ?? 0) > 0 ||
                          (department.servicesCount ?? 0) > 0;

                       const dependenciesText = (() => {
                          const categories = department.categoriesCount ?? 0;
                          const services = department.servicesCount ?? 0;
                          const parts = [];
                          if (categories > 0)
                             parts.push(`${categories} ${categories === 1 ? t("serviceCatalog.dependency.category") : t("serviceCatalog.dependency.categories")}`);
                          if (services > 0)
                             parts.push(`${services} ${services === 1 ? t("serviceCatalog.dependency.service") : t("serviceCatalog.dependency.services")}`);
                          return parts.join(" & ");
                       })();

                       return (
                          <div
                             className="relative group"
                             title={
                                hasDependencies
                                   ? `${t("serviceCatalog.dependency.cannotDelete")}: ${dependenciesText}`
                                   : undefined
                             }>
                             <Checkbox
                                checked={row.getIsSelected()}
                                onChange={(e) => row.toggleSelected(e.target.checked)}
                                className="m-0 me-0.5"
                             />
                          </div>
                       );
                    },
                    size: 40,
                 },
              ]
            : []),
         // Department ID column
         {
            accessorKey: "code",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("serviceCatalog.table.departmentId")}
               </span>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-text-strong">
                  {getValue() as string}
               </p>
            ),
            size: 200,
            meta: { className: "hidden md:table-cell" },

         },
         // Department Name column
         {
            accessorKey: "nameEn",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("serviceCatalog.table.departmentName")}
               </span>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-text-strong">
                  {getValue() as string}
               </p>
            ),
            size: 300,

         },
         // Status column
         {
            accessorKey: "status",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("serviceCatalog.table.status")}
               </span>
            ),
            cell: ({ getValue }) => {
               const statusValue = getValue() as string;
               // Convert backend format (Active/Inactive) to frontend format (active/inactive)
               const status = (statusValue?.toLowerCase() || "inactive") as
                  | "active"
                  | "inactive";
               return (
                  <StatusTag
                     label={t(`serviceCatalog.status.${status}`)}
                     variant={status}
                     className="border-border border flex items-center justify-center ps-1! pe-2! py-0.5!"
                  />
               );
            },
            size: 230,

         },
         ...(canUpdateDepartment || canDeleteDepartment
            ? [
                 {
                    id: "actions",
                    header: () => <div />,
                    cell: ({ row }: { row: { original: Department } }) => (
                       <ActionsCell
                          department={row.original}
                          onDelete={setDepartmentToDelete}
                          onEdit={handleEditDepartment}
                          canEdit={canUpdateDepartment}
                          canDelete={canDeleteDepartment}
                       />
                    ),
                    size: 64,
                 },
              ]
            : []),
      ],
      [t, handleEditDepartment, canDeleteDepartment, canUpdateDepartment]
   );

   return (
      <>
         {!canViewDepartments ? (
            <div className="p-6">
               <NoPermissionMessage
                  message={`You don't have permission to view departments. Missing: ${formatPermissionName("view_departments")}`}
               />
            </div>
         ) : isLoading ? (
            <LoadingState
               size="medium"
               label={t("serviceCatalog.loading")}
               minHeight="16rem"
            />
         ) : error ? (
            <div className="flex items-center justify-center h-64 text-danger">
               Error loading departments: {error.message}
            </div>
         ) : (
            <DataTable
               columns={columns}
               data={departments as Department[]}
               enableRowSelection={canDeleteDepartment}
               showPagination={true}
               pageSize={pageSize}
               pageCount={totalPages}
               pagination={{ pageIndex: page - 1, pageSize }}
               onPaginationChange={handlePaginationChange}
               manualPagination={true}
               translationNamespace="settings"
               renderFloatingBar={canDeleteDepartment ? renderFloatingBar : undefined}
               resetSelectionSignal={selectionResetSignal}
            />
         )}
         {canDeleteDepartment && (
            <>
               <DeleteDepartmentModal
                  isOpen={!!departmentToDelete}
                  onClose={() => {
                     if (deleteButtonState !== "loading") {
                        setDepartmentToDelete(null);
                        setDeleteButtonState("idle");
                     }
                  }}
                  onConfirm={() => {
                     if (departmentToDelete?.id) {
                        setDeleteButtonState("loading");
                        deleteMutation.mutate(departmentToDelete.id, {
                           onSuccess: () => {
                              setDeleteButtonState("success");
                              toast.success(
                                 `${t("serviceCatalog.modal.deleteDepartmentSuccess")} (ID: ${departmentToDelete.code})`
                              );
                              setTimeout(() => {
                                 setDepartmentToDelete(null);
                                 setDeleteButtonState("idle");
                                 setSelectionResetSignal((prev) => prev + 1);
                              }, 600);
                           },
                           onError: (error: unknown) => {
                              setDeleteButtonState("idle");
                              setDepartmentToDelete(null);

                              let errorMessage = t("serviceCatalog.modal.deleteDepartmentError");

                              // Check if it's an Axios error with response data
                              if (
                                 error &&
                                 typeof error === "object" &&
                                 "response" in error &&
                                 error.response &&
                                 typeof error.response === "object" &&
                                 "data" in error.response
                              ) {
                                 const responseData = (error.response as { data: unknown }).data;
                                 if (
                                    responseData &&
                                    typeof responseData === "object" &&
                                    "message" in responseData
                                 ) {
                                    errorMessage = (responseData as { message: string }).message;
                                 }
                              } else if (error && typeof error === "object" && "message" in error) {
                                 errorMessage = (error as { message: string }).message;
                              } else if (error instanceof Error) {
                                 errorMessage = error.message;
                              }

                              toast.error(errorMessage);
                           },
                        });
                     }
                  }}
                  isLoading={deleteButtonState === "loading"}
                  isSuccess={deleteButtonState === "success"}
               />
               <DeleteDepartmentModal
                  isOpen={!!departmentsToDelete}
                  onClose={() => {
                     if (bulkDeleteButtonState !== "loading") {
                        setDepartmentsToDelete(null);
                        setBulkDeleteButtonState("idle");
                     }
                  }}
                  onConfirm={async () => {
                     if (departmentsToDelete && departmentsToDelete.length > 0) {
                        setBulkDeleteButtonState("loading");

                        try {
                           // Delete all departments sequentially
                           for (const dept of departmentsToDelete) {
                              await new Promise<void>((resolve, reject) => {
                                 deleteMutation.mutate(dept.id, {
                                    onSuccess: () => {
                                       toast.success(
                                          `${t("serviceCatalog.modal.deleteDepartmentSuccess")} (ID: ${dept.code})`
                                       );
                                       resolve();
                                    },
                                    onError: (error) => reject(error),
                                 });
                              });
                           }

                           setBulkDeleteButtonState("success");
                           setTimeout(() => {
                              setDepartmentsToDelete(null);
                              setBulkDeleteButtonState("idle");
                              setSelectionResetSignal((prev) => prev + 1);
                           }, 600);
                        } catch (err) {
                           setBulkDeleteButtonState("idle");
                           setDepartmentsToDelete(null);

                           let errorMessage = t("serviceCatalog.modal.deleteDepartmentError");

                           // Check if it's an Axios error with response data
                           if (
                              err &&
                              typeof err === "object" &&
                              "response" in err &&
                              err.response &&
                              typeof err.response === "object" &&
                              "data" in err.response
                           ) {
                              const responseData = (err.response as { data: unknown }).data;
                              if (
                                 responseData &&
                                 typeof responseData === "object" &&
                                 "message" in responseData
                              ) {
                                 errorMessage = (responseData as { message: string }).message;
                              }
                           } else if (err && typeof err === "object" && "message" in err) {
                              errorMessage = (err as { message: string }).message;
                           } else if (err instanceof Error) {
                              errorMessage = err.message;
                           }

                           toast.error(errorMessage);
                        }
                     }
                  }}
                  isLoading={bulkDeleteButtonState === "loading"}
                  isSuccess={bulkDeleteButtonState === "success"}
               />
            </>
         )}
      </>
   );
}

export default DepartmentsTab;
