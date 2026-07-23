/** @format */

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { ColumnDef, PaginationState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/designSystem/ui/data-table";
import { useTranslation } from "@/hooks/useTranslation";
import Checkbox from "@/designSystem/Checkbox";
import StatusTag from "@/designSystem/StatusTag";
import Dropdown, { DropdownItem } from "@/designSystem/Dropdown";
import DirhamLabel from "@/designSystem/DirhamLabel";
import DeleteServiceModal from "../../modals/DeleteServiceModal";
import { MoreVertical, Edit, Trash } from "@/Icons";
import ServicesFloatingActionBar from "./ServicesFloatingActionBar";
import LoadingState from "@/designSystem/LoadingState";
import { ServicesFilters } from "./ServicesFilterDropdown";
import { useDeleteService, useListServices } from "@/hooks/services/useService";
import { Service } from "@/services/serviceService";
import toast from "@/utilities/toast";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";

interface ServicesTabProps {
   searchQuery: string;
   filters: ServicesFilters;
   sortBy: string;
   onEdit: (service: Service) => void;
}

// Actions Cell Component
function ActionsCell({
   service,
   onDelete,
   onEdit,
   canEdit,
   canDelete,
}: {
   service: Service;
   onDelete: (svc: Service) => void;
   onEdit: (svc: Service) => void;
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
                 label: t("serviceCatalog.floatingBar.editService"),
                 icon: Edit,
                 onClick: () => {
                    onEdit(service);
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
                 label: t("serviceCatalog.floatingBar.deleteService"),
                 icon: Trash,
                 onClick: () => {
                    onDelete(service);
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

function ServicesTab({ searchQuery, filters, sortBy, onEdit }: ServicesTabProps) {
   const { t } = useTranslation("settings");
   const { can } = usePermissions();
   const canViewServices = can("view_services");
   const canUpdateService = can("update_service");
   const canDeleteService = can("delete_service");
   const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
   const [servicesToDelete, setServicesToDelete] = useState<Service[] | null>(
      null
   );
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
         nameAsc: { field: "service_name_en", order: "asc" },
         nameDesc: { field: "service_name_en", order: "desc" },
         newest: { field: "created_at", order: "desc" },
         oldest: { field: "created_at", order: "asc" },
      };
   const { field: sortField, order: sortOrder } =
      sortConfig[sortBy] || sortConfig.newest;

   // Reset page when filters or search change
   useEffect(() => {
      setPage(1);
   }, [searchQuery, filters.status, sortBy]);

   // Fetch services with server-side pagination, search, filtering, and sorting
   const { data: servicesResponse, isLoading, error } = useListServices(
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
      { enabled: canViewServices }
   );

   const services = servicesResponse?.data || [];

   const totalPages = servicesResponse?.pagination?.total_pages || 1;

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

   const deleteMutation = useDeleteService();

   // Bulk actions handlers
   const handleBulkDelete = useCallback((services: Service[]) => {
      setServicesToDelete(services);
   }, []);

   const handleEditService = useCallback(
      (service: Service) => {
         onEdit(service);
      },
      [onEdit]
   );

   // Floating action bar
   const renderFloatingBar = useCallback(
      (selectedCount: number, selectedRows: Service[]) => (
         <ServicesFloatingActionBar
            selectedCount={selectedCount}
            selectedRows={selectedRows}
            onDelete={handleBulkDelete}
            onEdit={handleEditService}
            canEdit={canUpdateService}
            canDelete={canDeleteService}
            resetSignal={selectionResetSignal}
         />
      ),
      [handleBulkDelete, handleEditService, selectionResetSignal, canUpdateService, canDeleteService]
   );

   const columns: ColumnDef<Service>[] = useMemo(
      () => [
         ...(canDeleteService
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
                    cell: ({ row }: { row: { getIsSelected: () => boolean; toggleSelected: (value: boolean) => void } }) => (
                       <Checkbox
                          checked={row.getIsSelected()}
                          onChange={(e) => row.toggleSelected(e.target.checked)}
                          className="m-0 me-0.5"
                       />
                    ),
                    size: 40,
                 },
              ]
            : []),
         // Service ID column
         {
            accessorKey: "code",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("serviceCatalog.table.serviceId")}
               </span>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-text-strong">
                  {getValue() as string}
               </p>
            ),
            size: 90,
            meta: { className: "hidden md:table-cell" },
         },
         // Service Name (EN) column
         {
            accessorKey: "nameEn",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("serviceCatalog.table.serviceName")}
               </span>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-text-strong">
                  {getValue() as string}
               </p>
            ),
            size: 169,
         },
         // Department column
         {
            accessorKey: "departmentNameEn",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("serviceCatalog.table.department")}
               </span>
            ),
            cell: ({ row }) => {
               const service = row.original as Service;
               const label =
                  service.departmentNameEn ||
                  service.departmentNameAr ||
                  "-";
               return <p className="text-sm text-text-strong">{label}</p>;
            },
            size: 169,
         },
         // Category column
         {
            accessorKey: "categoryNameEn",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("serviceCatalog.table.category")}
               </span>
            ),
            cell: ({ row }) => {
               const service = row.original as Service;
               const label =
                  service.categoryNameEn || service.categoryNameAr || "-";
               return <p className="text-sm text-text-strong">{label}</p>;
            },
            size: 169,
         },
         // Service Charge column
         {
            accessorKey: "serviceCharge",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("serviceCatalog.table.serviceCharge")}
               </span>
            ),
            cell: ({ getValue }) => (
               <div className="text-sm text-text-strong">
                  <DirhamLabel value={Number(getValue()).toLocaleString()} />
               </div>
            ),
            size: 120,
         },
         // Gov Fees column
         {
            accessorKey: "govFees",
            header: () => (
               <p className="text-sm text-text-strong">
                  {t("serviceCatalog.table.govFees")}
               </p>
            ),
            cell: ({ getValue }) => (
               <div className="text-sm text-text-strong">
                  <DirhamLabel value={Number(getValue()).toLocaleString()} />
               </div>
            ),
            size: 120,
         },
         // VAT column
         {
            accessorKey: "vatPercentage",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("serviceCatalog.table.vatPercentage")}
               </span>
            ),
            cell: ({ row }) => {
               const svc = row.original as Service;
               const value =
                  svc.vatPercentage !== undefined
                     ? Number(svc.vatPercentage)
                     : svc.vat !== undefined
                     ? Number(svc.vat)
                     : undefined;

               return (
                  <p className="text-sm text-text-strong">
                     {value !== undefined ? `${value} %` : "-"}
                  </p>
               );
            },
            size: 120,
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
            size: 89,
         },
         ...(canUpdateService || canDeleteService
            ? [
                 {
                    id: "actions",
                    header: () => <div />,
                    cell: ({ row }: { row: { original: Service } }) => (
                       <ActionsCell
                          service={row.original}
                          onDelete={setServiceToDelete}
                          onEdit={handleEditService}
                          canEdit={canUpdateService}
                          canDelete={canDeleteService}
                       />
                    ),
                    size: 64,
                 },
              ]
            : []),
      ],
      [t, handleEditService, canDeleteService, canUpdateService]
   );

   return (
      <>
         {!canViewServices ? (
            <div className="p-6">
               <NoPermissionMessage
                  message={`You don't have permission to view services. Missing: ${formatPermissionName("view_services")}`}
               />
            </div>
         ) : isLoading ? (
            <LoadingState
               size="medium"
               label={t("serviceCatalog.services.loading")}
               minHeight="16rem"
            />
         ) : error ? (
            <div className="flex items-center justify-center h-64 text-danger">
               Error loading services: {error.message}
            </div>
         ) : (
            <DataTable
               columns={columns}
               data={services as Service[]}
               enableRowSelection={canDeleteService}
               showPagination={true}
               pageSize={pageSize}
               pageCount={totalPages}
               pagination={{ pageIndex: page - 1, pageSize }}
               onPaginationChange={handlePaginationChange}
               manualPagination={true}
               translationNamespace="settings"
               renderFloatingBar={canDeleteService ? renderFloatingBar : undefined}
               resetSelectionSignal={selectionResetSignal}
            />
         )}
         {canDeleteService && (
            <>
               <DeleteServiceModal
                  isOpen={!!serviceToDelete}
                  onClose={() => {
                     if (deleteButtonState !== "loading") {
                        setServiceToDelete(null);
                        setDeleteButtonState("idle");
                     }
                  }}
                  onConfirm={() => {
                     if (serviceToDelete?.id) {
                        setDeleteButtonState("loading");
                        deleteMutation.mutate(serviceToDelete.id, {
                           onSuccess: () => {
                              setDeleteButtonState("success");
                              toast.success(
                                 `${t("serviceCatalog.modal.deleteServiceSuccess")} (ID: ${serviceToDelete.code})`
                              );
                              setTimeout(() => {
                                 setServiceToDelete(null);
                                 setDeleteButtonState("idle");
                                 setSelectionResetSignal((prev) => prev + 1);
                              }, 600);
                           },
                           onError: (error: unknown) => {
                              setDeleteButtonState("idle");
                              setServiceToDelete(null);

                              let errorMessage = t("serviceCatalog.modal.deleteServiceError");

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
               <DeleteServiceModal
                  isOpen={!!servicesToDelete}
                  onClose={() => {
                     if (bulkDeleteButtonState !== "loading") {
                        setServicesToDelete(null);
                        setBulkDeleteButtonState("idle");
                     }
                  }}
                  onConfirm={async () => {
                     if (servicesToDelete && servicesToDelete.length > 0) {
                        setBulkDeleteButtonState("loading");

                        try {
                           // Delete all services sequentially
                           for (const svc of servicesToDelete) {
                              await new Promise<void>((resolve, reject) => {
                                 deleteMutation.mutate(svc.id, {
                                    onSuccess: () => {
                                       toast.success(
                                          `${t("serviceCatalog.modal.deleteServiceSuccess")} (ID: ${svc.code})`
                                       );
                                       resolve();
                                    },
                                    onError: (error) => reject(error),
                                 });
                              });
                           }

                           setBulkDeleteButtonState("success");
                           setTimeout(() => {
                              setServicesToDelete(null);
                              setBulkDeleteButtonState("idle");
                              setSelectionResetSignal((prev) => prev + 1);
                           }, 600);
                        } catch (err) {
                           setBulkDeleteButtonState("idle");
                           setServicesToDelete(null);

                           let errorMessage = t("serviceCatalog.modal.deleteServiceError");

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

export default ServicesTab;
