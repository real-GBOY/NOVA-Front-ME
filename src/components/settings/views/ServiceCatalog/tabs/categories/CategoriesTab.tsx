/** @format */

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { ColumnDef, PaginationState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/designSystem/ui/data-table";
import { useTranslation } from "@/hooks/useTranslation";
import Checkbox from "@/designSystem/Checkbox";
import StatusTag from "@/designSystem/StatusTag";
import Dropdown, { DropdownItem } from "@/designSystem/Dropdown";
import { MoreVertical, Edit, Trash } from "@/Icons";
import DeleteCategoryModal from "../../modals/DeleteCategoryModal";
import CategoriesFloatingActionBar from "./CategoriesFloatingActionBar";
import LoadingState from "@/designSystem/LoadingState";
import { CategoriesFilters } from "./CategoriesFilterDropdown";
import { useDeleteCategory, useListCategories } from "@/hooks/categories/useCategory";
import { Category } from "@/services/categoryService";
import toast from "@/utilities/toast";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";

interface CategoriesTabProps {
   searchQuery: string;
   filters: CategoriesFilters;
   sortBy: string;
   onEdit: (category: Category) => void;
}

// Actions Cell Component
function ActionsCell({
   category,
   onDelete,
   onEdit,
   canEdit,
   canDelete,
}: {
   category: Category;
   onDelete: (cat: Category) => void;
   onEdit: (cat: Category) => void;
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
                 label: t("serviceCatalog.floatingBar.editCategory"),
                 icon: Edit,
                 onClick: () => {
                    onEdit(category);
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
                 label: t("serviceCatalog.floatingBar.deleteCategory"),
                 icon: Trash,
                 onClick: () => {
                    onDelete(category);
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

function CategoriesTab({ searchQuery, filters, sortBy, onEdit }: CategoriesTabProps) {
   const { t } = useTranslation("settings");
   const { can } = usePermissions();
   const canViewCategories = can("view_categories");
   const canUpdateCategory = can("update_category");
   const canDeleteCategory = can("delete_category");
   const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
      null
   );
   const [categoriesToDelete, setCategoriesToDelete] = useState<
      Category[] | null
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
         nameAsc: { field: "category_name_en", order: "asc" },
         nameDesc: { field: "category_name_en", order: "desc" },
         newest: { field: "created_at", order: "desc" },
         oldest: { field: "created_at", order: "asc" },
      };
   const { field: sortField, order: sortOrder } =
      sortConfig[sortBy] || sortConfig.newest;

   // Reset page when filters or search change
   useEffect(() => {
      setPage(1);
   }, [searchQuery, filters.status, sortBy]);

   // Fetch categories with server-side pagination, search, filtering, and sorting
   const { data: categoriesResponse, isLoading, error } = useListCategories(
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
      { enabled: canViewCategories }
   );

   const categories = categoriesResponse?.data || [];

   const totalPages = categoriesResponse?.pagination?.total_pages || 1;

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

   const deleteMutation = useDeleteCategory();

   // Bulk actions handlers
   const handleBulkDelete = useCallback((categories: Category[]) => {
      setCategoriesToDelete(categories);
   }, []);

   const handleEditCategory = useCallback(
      (category: Category) => {
         onEdit(category);
      },
      [onEdit]
   );

   // Floating action bar
   const renderFloatingBar = useCallback(
      (selectedCount: number, selectedRows: Category[]) => (
         <CategoriesFloatingActionBar
            selectedCount={selectedCount}
            selectedRows={selectedRows}
            onDelete={handleBulkDelete}
            onEdit={handleEditCategory}
            canEdit={canUpdateCategory}
            canDelete={canDeleteCategory}
            resetSignal={selectionResetSignal}
         />
      ),
      [handleBulkDelete, handleEditCategory, selectionResetSignal, canUpdateCategory, canDeleteCategory]
   );

   const columns: ColumnDef<Category>[] = useMemo(
      () => [
         ...(canDeleteCategory
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
                    cell: ({ row }: { row: { original: Category; getIsSelected: () => boolean; toggleSelected: (value: boolean) => void } }) => {
                       const category = row.original;
                       const hasDependencies = (category.servicesCount ?? 0) > 0;

                       const services = category.servicesCount ?? 0;
                       const dependenciesText = `${services} ${services === 1 ? t("serviceCatalog.dependency.service") : t("serviceCatalog.dependency.services")}`;

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
         // Category ID column
         {
            accessorKey: "code",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("serviceCatalog.table.categoryId")}
               </span>
            ),
            cell: ({ row }) => {
               const { departmentNameEn, department } = row.original as Category & {
                  department?: { department_name_en?: string; department_name_ar?: string };
               };
               const name =
                  departmentNameEn ||
                  department?.department_name_en ||
                  department?.department_name_ar ||
                  t("serviceCatalog.table.departmentPlaceholder");

               return <p className="text-sm text-text-strong">{name}</p>;
            },
            size: 148,
            meta: { className: "hidden md:table-cell" },

         },
         // Category Name (EN) column
         {
            accessorKey: "nameEn",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("serviceCatalog.table.categoryNameEn")}
               </span>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-text-strong">
                  {getValue() as string}
               </p>
            ),
            size: 300,

         },
         // Department column
         // Department column
         {
            accessorKey: "departmentNameEn",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("serviceCatalog.table.department")}
               </span>
            ),
            cell: ({ row }) => {
               const category = row.original as Category & {
                  department?: { department_name_en?: string; department_name_ar?: string };
               };

               const departmentLabel =
                  category.departmentNameEn ||
                  category.department?.department_name_en ||
                  category.departmentNameAr ||
                  category.department?.department_name_ar ||
                  "-";

               return (
                  <p className="text-sm text-text-strong">{departmentLabel}</p>
               );
            },
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
         ...(canUpdateCategory || canDeleteCategory
            ? [
                 {
                    id: "actions",
                    header: () => <div />,
                    cell: ({ row }: { row: { original: Category } }) => (
                       <ActionsCell
                          category={row.original}
                          onDelete={setCategoryToDelete}
                          onEdit={handleEditCategory}
                          canEdit={canUpdateCategory}
                          canDelete={canDeleteCategory}
                       />
                    ),
                    size: 64,
                 },
              ]
            : []),
      ],
      [t, handleEditCategory, canDeleteCategory, canUpdateCategory]
   );

   return (
      <>
         {!canViewCategories ? (
            <div className="p-6">
               <NoPermissionMessage
                  message={`You don't have permission to view categories. Missing: ${formatPermissionName("view_categories")}`}
               />
            </div>
         ) : isLoading ? (
            <LoadingState
               size="medium"
               label={t("serviceCatalog.categories.loading")}
               minHeight="16rem"
            />
         ) : error ? (
            <div className="flex items-center justify-center h-64 text-danger">
               Error loading categories: {error.message}
            </div>
         ) : (
            <DataTable
               columns={columns}
               data={categories as Category[]}
               enableRowSelection={canDeleteCategory}
               showPagination={true}
               pageSize={pageSize}
               pageCount={totalPages}
               pagination={{ pageIndex: page - 1, pageSize }}
               onPaginationChange={handlePaginationChange}
               manualPagination={true}
               translationNamespace="settings"
               renderFloatingBar={canDeleteCategory ? renderFloatingBar : undefined}
               resetSelectionSignal={selectionResetSignal}
            />
         )}
         {canDeleteCategory && (
            <>
               <DeleteCategoryModal
                  isOpen={!!categoryToDelete}
                  onClose={() => {
                     if (deleteButtonState !== "loading") {
                        setCategoryToDelete(null);
                        setDeleteButtonState("idle");
                     }
                  }}
                  onConfirm={() => {
                     if (categoryToDelete?.id) {
                        setDeleteButtonState("loading");
                        deleteMutation.mutate(categoryToDelete.id, {
                           onSuccess: () => {
                              setDeleteButtonState("success");
                              toast.success(
                                 `${t("serviceCatalog.modal.deleteCategorySuccess")} (ID: ${categoryToDelete.code})`
                              );
                              setTimeout(() => {
                                 setCategoryToDelete(null);
                                 setDeleteButtonState("idle");
                                 setSelectionResetSignal((prev) => prev + 1);
                              }, 600);
                           },
                           onError: (error: unknown) => {
                              setDeleteButtonState("idle");
                              setCategoryToDelete(null);

                              let errorMessage = t("serviceCatalog.modal.deleteCategoryError");

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
               <DeleteCategoryModal
                  isOpen={!!categoriesToDelete}
                  onClose={() => {
                     if (bulkDeleteButtonState !== "loading") {
                        setCategoriesToDelete(null);
                        setBulkDeleteButtonState("idle");
                     }
                  }}
                  onConfirm={async () => {
                     if (categoriesToDelete && categoriesToDelete.length > 0) {
                        setBulkDeleteButtonState("loading");

                        try {
                           // Delete all categories sequentially
                           for (const cat of categoriesToDelete) {
                              await new Promise<void>((resolve, reject) => {
                                 deleteMutation.mutate(cat.id, {
                                    onSuccess: () => {
                                       toast.success(
                                          `${t("serviceCatalog.modal.deleteCategorySuccess")} (ID: ${cat.code})`
                                       );
                                       resolve();
                                    },
                                    onError: (error) => reject(error),
                                 });
                              });
                           }

                           setBulkDeleteButtonState("success");
                           setTimeout(() => {
                              setCategoriesToDelete(null);
                              setBulkDeleteButtonState("idle");
                              setSelectionResetSignal((prev) => prev + 1);
                           }, 600);
                        } catch (err) {
                           setBulkDeleteButtonState("idle");
                           setCategoriesToDelete(null);

                           let errorMessage = t("serviceCatalog.modal.deleteCategoryError");

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

export default CategoriesTab;
