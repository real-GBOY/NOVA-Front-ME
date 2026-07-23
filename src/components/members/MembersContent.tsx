/** @format */

import {
   Users,
   UsersGroupSimpleAlt,
   UserCheckCircleAlt,
   UserMinusCircleAlt,
   UserGearAlt,
} from "@/Icons";
import KPICard from "@/designSystem/KPICard";
import MembersTable, { Member } from "@/components/members/MembersTable";
import MembersGrid from "@/components/members/MembersGrid";
import MembersEmptyState from "@/components/members/MembersEmptyState";
import MembersNoResults from "@/components/members/MembersNoResults";
import ExportMembersModal from "@/components/members/ExportMembersModal";
import PermissionOverrideModal from "@/components/members/PermissionOverrideModal";
import AddMemberWizard from "@/components/members/AddMemberWizard/AddMemberWizard";
import Modal from "@/designSystem/Modal";
import ConfirmModal from "@/designSystem/ConfirmModal";
import LoadingState from "@/designSystem/LoadingState";
import type { MemberFormData } from "@/utilities/schemas/memberSchema";

import MembersToolbar, {
   ViewType,
} from "@/components/members/ui/MembersToolbar";
import type { SortOption } from "@/designSystem/SortDropdown";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useListJobTitles } from "@/hooks/jobTitles/useJobTitle";
import { useListTeams } from "@/hooks/teams/useTeam";
import { useListRoles } from "@/hooks/roles/useRole";
import {
   useListEmployees,
   useGetEmployeeStats,
} from "@/hooks/employees/useEmployee";
import { useListOnboarding } from "@/hooks/onboarding/onboarding.queries";
import { useResendOnboardingInvite } from "@/hooks/onboarding/onboarding.mutations";
import {
   useDeleteEmployee,
   useResetEmployeePermissions,
} from "@/hooks/employees/employee.mutations";
import { transformEmployeeToMember } from "@/utilities/employeeTransformers";
import { formatPermissionName } from "@/utilities/permissionFormatters";
import toast from "@/utilities/toast";
import { useTableSort, useTableFilter } from "@/hooks/table";
import { useDebounce } from "@/hooks/useDebounce";
import type { MemberFilters } from "./ui/MembersFilterDropdown";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import type { PaginationState, Updater } from "@tanstack/react-table";

function MembersContent() {
   const [searchQuery, setSearchQuery] = useState("");
   const debouncedSearchQuery = useDebounce(searchQuery, 400);
   const [viewType, setViewType] = useState<ViewType>("table");
   const [isExportModalOpen, setIsExportModalOpen] = useState(false);
   const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
   const [memberDraft, setMemberDraft] = useState<MemberFormData | null>(null);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
   const { t } = useTranslation("members");
   const { t: tCommon } = useTranslation("common");
   const navigate = useNavigate();
   const deactivateEmployeeMutation = useDeleteEmployee();
   const resetPermissionsMutation = useResetEmployeePermissions();
   const resendInviteMutation = useResendOnboardingInvite();
   const { can } = usePermissions();
   const canViewMembers = can("read_employee_basic");
   const canCreateMember = can("add_employee");
   const canUpdateMember = can("update_employee");
   const canDeactivateMember = can("deactivate_employee");
   const canGrantPermission = can("grant_permission");

   const canAccessMembers =
      canViewMembers ||
      canCreateMember ||
      canUpdateMember ||
      canDeactivateMember ||
      canGrantPermission;

   const [resetModalState, setResetModalState] = useState<{
      isOpen: boolean;
      member: Member | null;
   }>({
      isOpen: false,
      member: null,
   });
   const [deactivateModalState, setDeactivateModalState] = useState<{
      isOpen: boolean;
      member: Member | null;
   }>({
      isOpen: false,
      member: null,
   });
   const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
   });
   const [bulkDeleteModalState, setBulkDeleteModalState] = useState<{
      isOpen: boolean;
      members: Member[];
   }>({
      isOpen: false,
      members: [],
   });
   const [bulkResetModalState, setBulkResetModalState] = useState<{
      isOpen: boolean;
      members: Member[];
   }>({
      isOpen: false,
      members: [],
   });
   const [resendModalState, setResendModalState] = useState<{
      isOpen: boolean;
      member: Member | null;
   }>({
      isOpen: false,
      member: null,
   });
   const [permissionModalState, setPermissionModalState] = useState<{
      isOpen: boolean;
      member: Member | null;
   }>({
      isOpen: false,
      member: null,
   });

   const handleResetPermissions = useCallback((member: Member) => {
      setResetModalState({ isOpen: true, member });
   }, []);

   const handleDeactivateMember = useCallback((member: Member) => {
      setDeactivateModalState({ isOpen: true, member });
   }, []);

   const handleBulkDelete = useCallback((members: Member[]) => {
      setBulkDeleteModalState({ isOpen: true, members });
   }, []);

   const handleBulkReset = useCallback((members: Member[]) => {
      setBulkResetModalState({ isOpen: true, members });
   }, []);

   const handleOverridePermissions = useCallback((member: Member) => {
      setPermissionModalState({ isOpen: true, member });
   }, []);

   const handleViewProfile = useCallback(
      (member: Member) => {
         navigate(`/dashboard/members/profile/${member.id}`);
      },
      [navigate],
   );

   const handleConfirmReset = () => {
      const member = resetModalState.member;
      if (!member) {
         setResetModalState({ isOpen: false, member: null });
         return;
      }

      resetPermissionsMutation.mutate(member.id, {
         onSuccess: () => {
            toast.success(t("permissions.resetSuccess"));
            setResetModalState({ isOpen: false, member: null });
         },
         onError: () => {
            toast.error("Failed to reset permissions. Please try again.");
         },
      });
   };

   const handleConfirmDeactivate = () => {
      const member = deactivateModalState.member;
      if (!member) {
         setDeactivateModalState({ isOpen: false, member: null });
         return;
      }

      deactivateEmployeeMutation.mutate(member.id, {
         onSuccess: () => {
            toast.success(t("messages.deleteSuccess"));
            setDeactivateModalState({ isOpen: false, member: null });
         },
         onError: () => {
            toast.error("Failed to deactivate member. Please try again.");
         },
      });
   };

   const handleConfirmBulkDelete = () => {
      setBulkDeleteModalState({ isOpen: false, members: [] });
   };

   const handleConfirmBulkReset = () => {
      setBulkResetModalState({ isOpen: false, members: [] });
      toast.success(t("permissions.resetSuccess"));
   };

   const navigateToChat = useCallback(
      (member: Member) => {
         const searchValue = member.name || member.email || String(member.id);
         navigate("/dashboard/messages", {
            state: { searchQuery: searchValue },
         });
      },
      [navigate],
   );

   const handleSendMessage = useCallback(
      (members: Member[]) => {
         if (!members || members.length === 0) return;
         navigateToChat(members[0]);
      },
      [navigateToChat],
   );

   const handleEditDetails = useCallback(() => {}, []);

   const handleResendInvite = useCallback((member: Member) => {
      setResendModalState({ isOpen: true, member });
   }, []);

   const handleConfirmResendInvite = useCallback(() => {
      const member = resendModalState.member;
      if (!member?.onboardingId) {
         toast.error(t("messages.invitationResendFailed"));
         setResendModalState({ isOpen: false, member: null });
         return;
      }
      resendInviteMutation.mutate(member.onboardingId, {
         onSuccess: () => {
            toast.success(t("messages.invitationResent"));
            setResendModalState({ isOpen: false, member: null });
         },
         onError: () => {
            toast.error(t("messages.invitationResendFailed"));
         },
      });
   }, [resendInviteMutation, resendModalState.member, t]);

   const toDateParam = (value?: Date) => {
      if (!value) return undefined;
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
   };

   // Map sort option IDs to backend fields
   const sortParamMap: Record<string, "name" | "joined_at"> = {
      memberName: "name",
      joinedAt: "joined_at",
   };

   // ===== NEW TABLE ARCHITECTURE =====
   // Use table sorting hook
   const { sortConfig, handleSort } = useTableSort<Member>();

   // Use table filter hook
   const { filters, updateFilters, hasActiveFilters } =
      useTableFilter<MemberFilters>();

   const listFilters = useMemo(() => {
      const jobTitleIds = (filters.jobTitleIds || [])
         .map((id) => Number(id))
         .filter((id) => Number.isFinite(id));
      const roleIds = (filters.roleIds || [])
         .map((id) => Number(id))
         .filter((id) => Number.isFinite(id));

      return {
         page: pagination.pageIndex + 1,
         limit: pagination.pageSize,
         search: debouncedSearchQuery || undefined,
         status: filters.status?.length ? filters.status : undefined,
         job_title_id: jobTitleIds.length ? jobTitleIds : undefined,
         role_id: roleIds.length ? roleIds : undefined,
         joined_at_from: filters.joinedAtStart
            ? toDateParam(filters.joinedAtStart)
            : undefined,
         joined_at_to: filters.joinedAtEnd
            ? toDateParam(filters.joinedAtEnd)
            : undefined,
         permission_status:
            filters.isPermissionOverride === true
               ? "Override"
               : filters.isPermissionOverride === false
                 ? "Role"
                 : undefined,
         sort_by: sortConfig?.field
            ? sortParamMap[String(sortConfig.field)]
            : undefined,
         sort_order: sortConfig?.direction,
      };
   }, [
      filters.jobTitleIds,
      filters.roleIds,
      filters.status,
      filters.joinedAtStart,
      filters.joinedAtEnd,
      filters.isPermissionOverride,
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearchQuery,
      sortConfig?.field,
      sortConfig?.direction,
   ]);

   // Fetch employees data from API with pagination, search, filters, and sorting
   const {
      data: employeesData,
      isLoading,
      error,
   } = useListEmployees(listFilters, {
      enabled: canViewMembers,
   });

   // Fetch employee stats - only if user can view members
   const { data: statsData, isLoading: isStatsLoading } = useGetEmployeeStats({
      enabled: canViewMembers,
   });

   const { data: onboardingData } = useListOnboarding(undefined, {
      enabled: canViewMembers,
   });

   const onboardingByEmployeeId = useMemo(() => {
      const map = new Map<number, { onboarding_id: string; status: string }>();
      onboardingData?.data?.forEach((item) => {
         map.set(Number(item.employee_id), {
            onboarding_id: item.onboarding_id,
            status: item.status,
         });
      });
      return map;
   }, [onboardingData]);

   // Transform API data to Member format
   const members: Member[] = useMemo(() => {
      if (!employeesData?.data) {
         return [];
      }
      return employeesData.data.map((emp) => {
         const member = transformEmployeeToMember(emp);
         if (!can("read_role")) member.role = "Unauthorized";
         const onboardingRecord = onboardingByEmployeeId.get(Number(emp.id));
         if (member.status === "Invited" && onboardingRecord) {
            member.onboardingId = onboardingRecord.onboarding_id;
         }
         // if (!can("read_job_title")) member.jobTitle = "Unauthorized"; // Assuming job_title permission exists, verify if needed
         return member;
      });
   }, [employeesData, can, onboardingByEmployeeId]);

   // Fetch data using hooks - only when wizard is open
   const { data: jobTitlesData } = useListJobTitles(undefined, {
      enabled: isAddMemberModalOpen,
   });
   const { data: teamsData, isLoading: isTeamsLoading } = useListTeams();
   const { data: rolesData } = useListRoles(undefined, {
      enabled: isAddMemberModalOpen,
   });

   // Transform data to the format expected by the wizard
   const availableJobTitles =
      jobTitlesData?.data.map((jt) => ({
         id: jt.id.toString(),
         title: jt.title,
      })) || [];

   const availableTeams =
      teamsData?.data.map((team) => ({
         id: team.id.toString(),
         name: team.name,
      })) || [];

   const availableRoles =
      rolesData?.data.map((role) => ({
         id: role.id.toString(),
         title: role.name,
      })) || [];

   // Manager dropdown should include all employees
   const availableManagers = members.map((m) => ({
      id: m.id,
      name: m.name,
      avatar: m.avatar,
   }));

   // Handle filter apply
   const handleFiltersApply = useCallback(
      (newFilters: MemberFilters) => {
         updateFilters(newFilters);
         setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      },
      [updateFilters],
   );

   const processedMembers = members;

   // Calculate pageCount from server response for server-side pagination
   const pageCount = useMemo(() => {
      if (!employeesData?.pagination) return undefined;
      const { total, limit } = employeesData.pagination;
      return Math.ceil(total / limit);
   }, [employeesData?.pagination]);

   const isMemberDraftDirty = useMemo(() => {
      if (!memberDraft) return false;
      return Boolean(
         memberDraft.firstName ||
         memberDraft.lastName ||
         memberDraft.email ||
         memberDraft.phoneNumber ||
         memberDraft.country ||
         memberDraft.dateOfBirth ||
         memberDraft.gender ||
         memberDraft.maritalStatus ||
         memberDraft.nationalId ||
         memberDraft.address ||
         memberDraft.jobTitle ||
         memberDraft.team_ids?.length ||
         memberDraft.role ||
         memberDraft.manager ||
         memberDraft.employmentType ||
         memberDraft.startDate ||
         memberDraft.hoursPerWeek ||
         memberDraft.probationPeriod ||
         memberDraft.salary ||
         memberDraft.contractType ||
         memberDraft.documents?.length ||
         memberDraft.residencyStatus ||
         (memberDraft.residencyCountry &&
            memberDraft.residencyCountry !== "United Arab Emirates") ||
         memberDraft.residencyType ||
         memberDraft.residencyNumber ||
         memberDraft.residencyIssueDate ||
         memberDraft.residencyExpiryDate ||
         memberDraft.residencyDocument?.length ||
         memberDraft.profileImage,
      );
   }, [memberDraft]);

   const sortOptions: SortOption<string>[] = [
      { id: "memberName", label: t("table.memberName") },
      { id: "joinedAt", label: t("table.joinedAt") },
   ];

   const handleFilterClick = () => {
      // TODO: Add filter logic when filters are available
   };

   const handleAddMember = async () => {
      setIsAddMemberModalOpen(false);
      setMemberDraft(null);
   };

   const handlePaginationChange = useCallback(
      (updater: Updater<PaginationState>) => {
         setPagination((prev) => {
            const next =
               typeof updater === "function" ? updater(prev) : updater;

            // Ensure page-size changes always drive a new server request from page 1.
            if (next.pageSize !== prev.pageSize) {
               return { pageIndex: 0, pageSize: next.pageSize };
            }
            return next;
         });
      },
      [],
   );

   // Reset pagination to page 1 when search query changes
   useEffect(() => {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
   }, [debouncedSearchQuery]);

   // TODO: Consistency - Standardized to show full page layout with header.
   if (!canAccessMembers) {
      return (
         <NoPermissionMessage
            message={t("permissions.noAccess.title", "Access Restricted")}
            description={t(
               "permissions.noAccess.message",
               "You don't have permission to access the members module.",
            )}
         />
      );
   }

   return (
      <>
         {/* Members View - Table or Grid */}
         {/* KPI Cards */}
         {canViewMembers && (
            <>
               <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3 xl:gap-3 mb-6">
                  <KPICard
                     label={t("kpi.totalMembers")}
                     value={
                        isStatsLoading
                           ? "..."
                           : statsData?.total.toString() || "0"
                     }
                     icon={<Users className="fill-highlighted" />}
                  />
                  <KPICard
                     label={t("kpi.totalTeams")}
                     value={
                        isTeamsLoading
                           ? "..."
                           : teamsData?.total?.toString() || "0"
                     }
                     icon={<UsersGroupSimpleAlt className="fill-information" />}
                  />
                  <KPICard
                     label={t("kpi.active")}
                     value={
                        isStatsLoading
                           ? "..."
                           : statsData?.active.toString() || "0"
                     }
                     icon={<UserCheckCircleAlt className="fill-success" />}
                  />
                  <KPICard
                     label={t("kpi.inactive")}
                     value={
                        isStatsLoading
                           ? "..."
                           : statsData?.inactive.toString() || "0"
                     }
                     icon={<UserMinusCircleAlt />}
                  />
                  <KPICard
                     label={t("kpi.overridden")}
                     value={
                        isStatsLoading
                           ? "..."
                           : statsData?.overrides.toString() || "0"
                     }
                     icon={<UserGearAlt className="fill-warning" />}
                     tooltip={t("kpi.overriddenTooltip")}
                  />
               </div>
            </>
         )}

         <MembersToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onFilterClick={handleFilterClick}
            sortOptions={sortOptions}
            onSortChange={handleSort}
            viewType={viewType}
            onViewTypeChange={setViewType}
            onExportClick={() => setIsExportModalOpen(true)}
            onAddMemberClick={() => setIsAddMemberModalOpen(true)}
            onFiltersApply={handleFiltersApply}
         />

         {!canViewMembers ? (
            <NoPermissionMessage
               message={t(
                  "permissions.noReadAccess.title",
                  "Access Restricted",
               )}
               description={`${t(
                  "permissions.noReadAccess.message",
                  "You don't have permission to view the members list.",
               )} (Missing: ${formatPermissionName("read_employee_basic")})`}
               className="mt-12"
            />
         ) : isLoading ? (
            <LoadingState size="large" label={t("messages.loadingMembers")} />
         ) : error ? (
            // Check if error is 403 Forbidden
            (error as any)?.response?.status === 403 ? (
               <NoPermissionMessage
                  message={t(
                     "permissions.noReadAccess.title",
                     "Access Restricted",
                  )}
                  description={`${t(
                     "permissions.noReadAccess.message",
                     "You don't have permission to view the members list.",
                  )} (Missing: ${formatPermissionName("read_employee_basic")})`}
                  className="mt-12"
               />
            ) : (
               <div className="flex items-center justify-center py-12">
                  <p className="text-danger">{t("error")}</p>
               </div>
            )
         ) : members.length === 0 && !searchQuery && !hasActiveFilters ? (
            <MembersEmptyState />
         ) : processedMembers.length === 0 ? (
            <MembersNoResults />
         ) : viewType === "table" ? (
            <MembersTable
               data={processedMembers}
               globalFilter=""
               onViewProfile={handleViewProfile}
               onOverridePermissions={handleOverridePermissions}
               onResetPermissions={handleResetPermissions}
               onDeactivate={handleDeactivateMember}
               onResendInvite={handleResendInvite}
               onBulkDelete={handleBulkDelete}
               onBulkReset={handleBulkReset}
               onSendMessage={handleSendMessage}
               onEditDetails={handleEditDetails}
               pagination={pagination}
               onPaginationChange={handlePaginationChange}
               pageCount={pageCount}
            />
         ) : (
            <MembersGrid
               data={processedMembers}
               globalFilter=""
               onViewProfile={handleViewProfile}
               onSendMessage={(member) => handleSendMessage([member])}
               onOverridePermissions={handleOverridePermissions}
               onResetPermissions={handleResetPermissions}
               onDeactivate={handleDeactivateMember}
               onResendInvite={handleResendInvite}
            />
         )}

         {/* Export Modal */}
         <ExportMembersModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            members={processedMembers}
            selectedMembers={[]}
         />

         {/* Add Member Modal */}
         <Modal
            isOpen={isAddMemberModalOpen}
            onClose={() => {
               if (isMemberDraftDirty) {
                  setShowDiscardConfirm(true);
                  return;
               }
               setIsAddMemberModalOpen(false);
               setMemberDraft(null);
            }}
            title={t("addMember")}
            size="large">
            <AddMemberWizard
               onClose={() => {
                  if (isMemberDraftDirty) {
                     setShowDiscardConfirm(true);
                     return;
                  }
                  setIsAddMemberModalOpen(false);
                  setMemberDraft(null);
               }}
               onComplete={handleAddMember}
               onFormDataChange={setMemberDraft}
               availableJobTitles={availableJobTitles}
               availableTeams={availableTeams}
               availableRoles={availableRoles}
               availableManagers={availableManagers}
            />
         </Modal>
         <ConfirmModal
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={() => {
               setShowDiscardConfirm(false);
               setIsAddMemberModalOpen(false);
               setMemberDraft(null);
            }}
            title={tCommon("unsavedChanges.title")}
            description={tCommon("unsavedChanges.description")}
            confirmText={tCommon("unsavedChanges.confirm")}
            cancelText={tCommon("unsavedChanges.cancel")}
         />

         <ConfirmModal
            isOpen={resetModalState.isOpen}
            onClose={() => setResetModalState({ isOpen: false, member: null })}
            onConfirm={handleConfirmReset}
            title={t("modals.resetPermissions.title")}
            description={t("modals.resetPermissions.description")}
            confirmText={t("modals.resetPermissions.confirmButton")}
            cancelText={t("modals.resetPermissions.cancelButton")}
            variant="primary"
            icon="info"
            isLoading={resetPermissionsMutation.isPending}
         />
         <ConfirmModal
            isOpen={resendModalState.isOpen}
            onClose={() => setResendModalState({ isOpen: false, member: null })}
            onConfirm={handleConfirmResendInvite}
            title={t("modals.resendInvitation.title")}
            description={t("modals.resendInvitation.description", {
               name: resendModalState.member?.name || "",
            })}
            confirmText={t("modals.resendInvitation.confirmButton")}
            cancelText={t("modals.resendInvitation.cancelButton")}
            variant="primary"
            icon="info"
            isLoading={resendInviteMutation.isPending}
         />

         <ConfirmModal
            isOpen={deactivateModalState.isOpen}
            onClose={() =>
               setDeactivateModalState({ isOpen: false, member: null })
            }
            onConfirm={handleConfirmDeactivate}
            title={t("modals.deleteMember.title")}
            description={t("modals.deleteMember.description")}
            confirmText={t("modals.deleteMember.confirmButton")}
            cancelText={t("modals.deleteMember.cancelButton")}
            variant="error"
            icon="exclamation"
            isLoading={deactivateEmployeeMutation.isPending}
         />

         <ConfirmModal
            isOpen={bulkDeleteModalState.isOpen}
            onClose={() =>
               setBulkDeleteModalState({ isOpen: false, members: [] })
            }
            onConfirm={handleConfirmBulkDelete}
            title={t("modals.deleteMember.title")}
            description={t("modals.deleteMember.description")}
            confirmText={t("modals.deleteMember.confirmButton")}
            cancelText={t("modals.deleteMember.cancelButton")}
            variant="error"
            icon="exclamation"
         />

         <ConfirmModal
            isOpen={bulkResetModalState.isOpen}
            onClose={() =>
               setBulkResetModalState({ isOpen: false, members: [] })
            }
            onConfirm={handleConfirmBulkReset}
            title={t("modals.resetPermissions.title")}
            description={t("modals.resetPermissions.description")}
            confirmText={t("modals.resetPermissions.confirmButton")}
            cancelText={t("modals.resetPermissions.cancelButton")}
            variant="primary"
            icon="info"
         />

         {/* Permission Override Modal */}
         {permissionModalState.member && (
            <PermissionOverrideModal
               isOpen={permissionModalState.isOpen}
               onClose={() =>
                  setPermissionModalState({ isOpen: false, member: null })
               }
               employeeId={permissionModalState.member.id}
               employeeName={permissionModalState.member.name}
            />
         )}
      </>
   );
}

export default MembersContent;
