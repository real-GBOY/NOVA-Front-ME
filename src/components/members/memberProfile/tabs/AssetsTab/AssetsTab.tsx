/** @format */

import { useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
   useGetEmployeeAssets,
   useGetEmployeeById,
} from "@/hooks/employees/employee.queries";
import { useGetAssetById } from "@/hooks/assets/useAssets";
import AssetsTable, { Asset } from "./AssetsTable";
import { format } from "date-fns";
import LoadingState from "@/designSystem/LoadingState";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";
import Button from "@/designSystem/Button";
import AssignAssetToMemberModal from "./AssignAssetToMemberModal";
import Modal from "@/designSystem/Modal";
import ConfirmModal from "@/designSystem/ConfirmModal";
import AddAssetWizard from "@/components/settings/views/Assets/AddAssetWizard";
import type { AssetFormData } from "@/components/settings/views/Assets/AddAssetWizard";
import { useCreateAsset, useAssignAsset } from "@/hooks/assets/useAssets";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import type { CreateAssetRequest } from "@/services/assetService";
import ViewAssetModal from "@/components/settings/views/Assets/components/modals/ViewAssetModal/ViewAssetModal";

interface AssetsTabProps {
   employeeId: string;
   title?: string;
}

function AssetsTab({ employeeId, title }: AssetsTabProps) {
   const { t } = useTranslation("members");
   const { t: tCommon } = useTranslation("common");
   const { can } = usePermissions();
   const canViewAssets = can("read_asset") || can("read_assets");
   const canAssignAssets = can("assign_asset");
   const canCreateAssets = can("create_asset");
   const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
   const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
   const [assetDraft, setAssetDraft] = useState<AssetFormData | null>(null);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
   const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
   const queryClient = useQueryClient();

   // Fetch employee assets from API
   const { data: assetsResponse, isLoading } = useGetEmployeeAssets(employeeId, {
      enabled: !!employeeId && canViewAssets,
   });

   const { data: employeeData } = useGetEmployeeById(employeeId, {
      enabled: !!employeeId,
   });

   const { data: selectedAssetResponse } = useGetAssetById(
      selectedAssetId || "",
      { enabled: !!selectedAssetId }
   );
   const selectedAsset =
      (selectedAssetResponse as { data?: unknown })?.data ??
      selectedAssetResponse;

   const createAssetMutation = useCreateAsset();
   const assignAssetMutation = useAssignAsset();

   const displayTitle = title || t("placeholders.assets.title");

   // Transform API response to match the Asset interface
   const assetsData: Asset[] = useMemo(() => {
      if (!assetsResponse?.data) return [];

      return assetsResponse.data.map((asset) => ({
         id: String(asset.asset_id ?? asset.id),
         assetName: asset.asset_name,
         assignedDate: asset.assigned_date
            ? format(new Date(asset.assigned_date), "d MMM, yyyy")
            : "",
         assetType: asset.category || "",
         serialNumber: asset.serial_number,
         imageUrl: asset.image_url || undefined,
         // Map current_condition to status - default to "active" if not provided
         status: "active" as const,
      }));
   }, [assetsResponse]);

   const isAssetDraftDirty = useMemo(() => {
      if (!assetDraft) return false;
      return Boolean(
         assetDraft.name ||
            assetDraft.category ||
            assetDraft.serial ||
            assetDraft.condition ||
            assetDraft.image
      );
   }, [assetDraft]);

   // Show loading state
   if (isLoading) {
      return (
         <div className="w-full flex flex-col r-gap xl:gap-6">
            <LoadingState size="medium" label={t("loading.assets")} />
         </div>
      );
   }

   const handleOpenAddAsset = () => {
      setIsAddAssetModalOpen(true);
   };

   const handleCloseAddAssetModal = () => {
      if (isAssetDraftDirty) {
         setShowDiscardConfirm(true);
         return;
      }
      setIsAddAssetModalOpen(false);
      setAssetDraft(null);
   };

   const handleSubmitAsset = async (data: AssetFormData) => {
      try {
         const imageData =
            data.image?.fileId && data.image?.token
               ? {
                    fileId: data.image.fileId,
                    token: data.image.token,
                    purpose: data.image.purpose,
                 }
               : undefined;

         const categoryIdMap: Record<string, number> = {
            laptop: 1,
            mobile: 2,
            tablet: 3,
            monitor: 4,
            keyboard: 5,
            mouse: 6,
            other: 7,
         };

         const payload: CreateAssetRequest = {
            name: data.name,
            status: "available",
         };

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
                  t("profile.assets.errors.invalidCategory", "Invalid category.")
               );
               return;
            }
            payload.category_id = categoryId;
         }

         if (imageData) {
            payload.image = imageData;
         }

         const created = await createAssetMutation.mutateAsync(payload);
         const createdAssetId =
            (created as { data?: { id?: number | string } })?.data?.id ??
            (created as { id?: number | string })?.id;

         if (!createdAssetId) {
            toast.error(
               t("profile.assets.errors.createFailed", "Failed to create asset.")
            );
            return;
         }

         await assignAssetMutation.mutateAsync({
            id: createdAssetId,
            payload: {
               employee_id: Number(employeeId),
               assigned_date: new Date().toISOString().split("T")[0],
               condition_at_handover: data.condition,
            },
         });

         queryClient.invalidateQueries({
            queryKey: reactQueryKeys.employees.assets(employeeId),
            exact: false,
         });

         setIsAddAssetModalOpen(false);
         setAssetDraft(null);
         toast.success(tCommon("messages.createSuccess"));
      } catch (error: unknown) {
         console.error("Error creating/assigning asset:", error);
         toast.error(tCommon("messages.errorOccurred"));
      }
   };

   if (!canViewAssets) {
      return (
         <div className="w-full flex flex-col r-gap xl:gap-6">
            <NoPermissionMessage
               message={t("permissions.noReadAccess.title", "Access Restricted")}
               description={`${t(
                  "permissions.noReadAccess.message",
                  "You don't have permission to view assets."
               )} (Missing: ${formatPermissionName("read_asset")})`}
            />
         </div>
      );
   }

   return (
      <div className="w-full flex flex-col r-gap xl:gap-6">
         <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-base font-semibold text-text-strong">
               <span>{displayTitle}</span>
            </div>
            <div className="flex items-center gap-2">
               {canCreateAssets && canAssignAssets && (
                  <Button variant="secondary" onClick={handleOpenAddAsset}>
                     {t("profile.assets.actions.add", "Add Asset")}
                  </Button>
               )}
               {canAssignAssets && (
                  <Button
                     variant="secondary"
                     onClick={() => setIsAssignModalOpen(true)}>
                     {t("profile.assets.actions.assign", "Assign Asset")}
                  </Button>
               )}
            </div>
         </div>

         {assetsData.length > 0 ? (
            <AssetsTable
               data={assetsData}
               onRowClick={(asset) => setSelectedAssetId(asset.id)}
            />
         ) : (
            <div className="w-full border border-dashed border-border bg-bg-weak text-sm text-text-sub text-center r-rounded r-p-sm xl:rounded-2xl xl:p-6">
               <p>{t("placeholders.assets.description")}</p>
            </div>
         )}

         {canAssignAssets && (
            <AssignAssetToMemberModal
               isOpen={isAssignModalOpen}
               onClose={() => setIsAssignModalOpen(false)}
               employeeId={employeeId}
            />
         )}

         {canCreateAssets && canAssignAssets && (
            <Modal
               isOpen={isAddAssetModalOpen}
               onClose={handleCloseAddAssetModal}
               title={t("profile.assets.actions.add", "Add Asset")}
               size="large"
               showCloseButton={true}>
               <AddAssetWizard
                  onSubmit={handleSubmitAsset}
                  onCancel={handleCloseAddAssetModal}
                  onFormDataChange={setAssetDraft}
                  assignedTo={{
                     id: employeeId,
                     name:
                        employeeData?.name ||
                        t("profile.assets.assignedTo", "This member"),
                     email: employeeData?.email,
                     avatar: employeeData?.avatar || undefined,
                  }}
               />
            </Modal>
         )}

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

         {selectedAssetId && selectedAsset && (
            <ViewAssetModal
               isOpen={!!selectedAssetId}
               onClose={() => setSelectedAssetId(null)}
               asset={selectedAsset}
            />
         )}
      </div>
   );
}

export default AssetsTab;
