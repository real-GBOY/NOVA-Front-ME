/** @format */

import { useState, useMemo, useCallback, useEffect } from "react";
import Modal from "@/designSystem/Modal";
import ConfirmModal from "@/designSystem/ConfirmModal";
import AssetsTable from "./AssetsTable";
import { AssetsHeader, AssetsToolbar } from "./components/layout";
import AddAssetWizard from "./AddAssetWizard";
import AssetsNoResults from "./components/AssetsNoResults";
import AssetsEmptyState from "./components/AssetsEmptyState";
import { useCreateAsset } from "@/hooks/assets/useAssets";
import type { AssetFormData } from "./AddAssetWizard";
import type { CreateAssetRequest } from "@/services/assetService";
import { toast } from "sonner";
import { useTableFilter } from "@/hooks/table";
import { useServerTableData } from "@/hooks/table/useServerTableData";
import { assetService } from "@/services/assetService";
import type { Asset } from "@/services/assetService";
import type { AssetFilters } from "./components/AssetsFilterDropdown";
import LoadingState from "@/designSystem/LoadingState";
import { useTranslation } from "@/hooks/useTranslation";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";
import type { PaginationState, Updater } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/useDebounce";

function AssetsView() {
   const { t } = useTranslation("settings");
   const { t: tCommon } = useTranslation("common");
   const { can } = usePermissions();
   const canViewAssets = can("read_asset");
   const canCreateAssets = can("create_asset");
   const canDeleteAssets = can("delete_asset");
   const canAssignAssets = can("assign_asset");
   const canReturnAssets = can("return_asset");

   const canAccessAssets =
      canViewAssets ||
      canCreateAssets ||
      canDeleteAssets ||
      canAssignAssets ||
      canReturnAssets;

   const [searchQuery, setSearchQuery] = useState("");
   const debouncedSearchQuery = useDebounce(searchQuery, 400);
   const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
   const [assetDraft, setAssetDraft] = useState<AssetFormData | null>(null);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

   const createAssetMutation = useCreateAsset();

   const handleAddAsset = () => {
      setIsAddAssetModalOpen(true);
   };

   const handleCloseModal = () => {
      if (isAssetDraftDirty) {
         setShowDiscardConfirm(true);
         return;
      }
      setIsAddAssetModalOpen(false);
      setAssetDraft(null);
   };

   const handleSubmitAsset = async (data: AssetFormData) => {
      try {
         // Step 1: Prepare image data if provided (already uploaded)
         const imageData =
            data.image?.fileId && data.image?.token
               ? {
                    fileId: data.image.fileId,
                    token: data.image.token,
                    purpose: data.image.purpose,
                 }
               : undefined;

         // Step 2: Map category string to category_id
         // TODO: Replace with actual category lookup from API
         const categoryIdMap: Record<string, number> = {
            laptop: 1,
            mobile: 2,
            tablet: 3,
            monitor: 4,
            keyboard: 5,
            mouse: 6,
            other: 7,
         };

         // Step 3: Build payload (omit undefined/empty fields)
         const payload: CreateAssetRequest = {
            name: data.name,
            status: "available", // Default status
         };

         // Add optional fields only if they have values
         if (data.serial?.trim()) {
            payload.serial = data.serial.trim();
         }

         if (data.condition) {
            payload.asset_condition = data.condition as
               | "new"
               | "good"
               | "fair"
               | "poor"
               | "damaged";
         }

         if (data.category) {
            const categoryId = categoryIdMap[data.category];
            if (!categoryId) {
               toast.error(
                  t("assets.errors.invalidCategory", {
                     category: data.category,
                  }),
               );
               return;
            }
            payload.category_id = categoryId;
         }

         if (imageData) {
            payload.image = imageData;
         }

         // Step 4: Create asset - mutation's onSuccess will handle refetch
         await createAssetMutation.mutateAsync(payload);

         // Close modal and show success message
         setIsAddAssetModalOpen(false);
         setAssetDraft(null);
         toast.success(tCommon("messages.createSuccess"));
      } catch (error: unknown) {
         console.error("Error creating asset:", error);

         // Handle validation errors
         if (
            typeof error === "object" &&
            error !== null &&
            (error as { response?: { status?: number } }).response?.status ===
               400
         ) {
            const errorMessage =
               (
                  error as {
                     response?: { data?: { message?: string; error?: string } };
                  }
               ).response?.data?.message ||
               (error as { response?: { data?: { error?: string } } }).response
                  ?.data?.error ||
               t("assets.errors.invalidData");
            toast.error(errorMessage);
            return;
         }

         // Handle permission errors
         if (
            typeof error === "object" &&
            error !== null &&
            (error as { response?: { status?: number } }).response?.status ===
               403
         ) {
            toast.error(tCommon("messages.noPermission"));
            return;
         }

         // Generic error
         toast.error(tCommon("messages.errorOccurred"));
      }
   };

   const isAssetDraftDirty = useMemo(() => {
      if (!assetDraft) return false;
      return Boolean(
         assetDraft.name ||
         assetDraft.category ||
         assetDraft.serial ||
         assetDraft.condition ||
         assetDraft.image,
      );
   }, [assetDraft]);
   // ===== SERVER SIDE DATA =====
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(7);
   const [sortBy, setSortBy] = useState<string>("name_asc");

   // Handle sort change
   const handleSortChange = (sortId: string) => {
      setSortBy(sortId);
      setPage(1);
   };

   // Parse sort
   const getSortParams = (sortStr: string) => {
      if (!sortStr) return { field: "created_at", direction: "desc" as const };

      // Handle simple keys from toolbar (default to asc)
      if (
         ["name", "category", "status", "condition", "serial"].includes(sortStr)
      ) {
         const mapping: Record<string, string> = {
            name: "name",
            category: "category_id",
            status: "status",
            condition: "asset_condition",
            serial: "serial",
         };
         return {
            field: mapping[sortStr] || sortStr,
            direction: "asc" as const,
         };
      }

      const [field, order] = sortStr.split("_");
      // Map SortDropdown keys to Backend DB Columns
      const mapping: Record<string, string> = {
         name: "name",
         category: "category_id",
         status: "status",
         condition: "asset_condition",
         serial: "serial",
         created: "created_at",
      };

      return {
         field: mapping[field] || field,
         direction: (order as "asc" | "desc") || "desc",
      };
   };

   const { field: sortField, direction: sortDirection } = getSortParams(sortBy);

   const { filters, updateFilters } = useTableFilter<AssetFilters>();

   // Map Filters to API params
   const mapFilters = useMemo(() => {
      const mapped: Record<string, unknown> = {};
      if (filters.status?.length) mapped.status = filters.status;
      if (filters.assignedTo?.length) mapped.employee_id = filters.assignedTo;

      if (filters.category?.length) {
         const categoryIdMap: Record<string, number> = {
            laptop: 1,
            mobile: 2,
            tablet: 3,
            monitor: 4,
            keyboard: 5,
            mouse: 6,
            other: 7,
         };
         const ids = filters.category
            .map((c) => categoryIdMap[c])
            .filter(Boolean);
         if (ids.length) mapped.category_id = ids;
      }
      return mapped;
   }, [filters]);

   // Reset page when search, filters, or sort changes
   useEffect(() => {
      setPage(1);
   }, [debouncedSearchQuery, filters, sortBy]);

   const {
      data: assetsData,
      totalCount,
      isLoading,
      error,
   } = useServerTableData<Asset>({
      queryKey: ["assets", "list"],
      queryFn: assetService.list,
      page,
      pageSize,
      searchQuery: debouncedSearchQuery,
      filters: mapFilters,
      sortField,
      sortDirection,
      enabled: canViewAssets,
   });

   const assets = assetsData || [];
   const totalPages = Math.ceil(totalCount / pageSize);

   const handleFiltersApply = useCallback(
      (newFilters: AssetFilters) => {
         updateFilters(newFilters);
         setPage(1);
      },
      [updateFilters],
   );

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

   const isForbiddenError =
      typeof error === "object" &&
      error !== null &&
      (error as { response?: { status?: number } }).response?.status === 403;

   if (!canAccessAssets) {
      return (
         <div className="p-6">
            <NoPermissionMessage
               message={t("permissions.noAccess.title", "Access Restricted")}
               description={t(
                  "permissions.noAccess.message",
                  "You don't have permission to access the assets module.",
               )}
            />
         </div>
      );
   }

   return (
      <>
         <div className="flex flex-col gap-6">
            {/* Header */}
            <AssetsHeader />

            {/* Toolbar */}
            <AssetsToolbar
               searchQuery={searchQuery}
               onSearchChange={setSearchQuery}
               onSortChange={handleSortChange}
               onAddAsset={handleAddAsset}
               onFiltersApply={handleFiltersApply}
            />
            {/* Table */}
            {!canViewAssets ? (
               <NoPermissionMessage
                  message={t(
                     "permissions.noReadAccess.title",
                     "Access Restricted",
                  )}
                  description={`${t("permissions.noReadAccess.message", "You don't have permission to view assets.")} (Missing: ${formatPermissionName("read_asset")})`}
                  className="mt-12"
               />
            ) : (
               <>
                  {/* Table */}
                  {isLoading ? (
                     <LoadingState size="large" label={t("loading.assets")} />
                  ) : error ? (
                     isForbiddenError ? (
                        <NoPermissionMessage
                           message={t(
                              "permissions.noReadAccess.title",
                              "Access Restricted",
                           )}
                           description={`${t("permissions.noReadAccess.message", "You don't have permission to view assets.")} (Missing: ${formatPermissionName("read_asset")})`}
                           className="mt-12"
                        />
                     ) : (
                        <div className="flex items-center justify-center py-8">
                           <div className="flex flex-col items-center gap-2">
                              <span className="text-error">
                                 Error loading assets. Please try again.
                              </span>
                              {process.env.NODE_ENV === "development" && (
                                 <span className="text-xs text-text-sub">
                                    {error instanceof Error
                                       ? error.message
                                       : String(error)}
                                 </span>
                              )}
                           </div>
                        </div>
                     )
                  ) : assets.length === 0 &&
                    !searchQuery &&
                    !filters.status?.length ? (
                     <AssetsEmptyState />
                  ) : assets.length === 0 ? (
                     <AssetsNoResults />
                  ) : (
                     <AssetsTable
                        data={assets}
                        globalFilter=""
                        pageCount={totalPages}
                        pagination={{ pageIndex: page - 1, pageSize }}
                        onPaginationChange={handlePaginationChange}
                     />
                  )}
               </>
            )}
         </div>

         {/* Add Asset Modal */}
         <Modal
            isOpen={isAddAssetModalOpen}
            onClose={handleCloseModal}
            title={t("assets.addWizard.title")}
            size="large"
            showCloseButton={true}>
            <AddAssetWizard
               onSubmit={handleSubmitAsset}
               onCancel={handleCloseModal}
               onFormDataChange={setAssetDraft}
            />
         </Modal>
         <ConfirmModal
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={() => {
               setShowDiscardConfirm(false);
               setIsAddAssetModalOpen(false);
               setAssetDraft(null);
            }}
            title={tCommon("unsavedChanges.title")}
            description={tCommon("unsavedChanges.description")}
            confirmText={tCommon("unsavedChanges.confirm")}
            cancelText={tCommon("unsavedChanges.cancel")}
         />
      </>
   );
}

export default AssetsView;
