/** @format */

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PeopleAccessCard from "./PeopleAccessCard";
import RoleTable from "./RoleTable";
import JobTitleTable from "./JobTitleTable";
import TeamTable from "./TeamTable";
import PeopleAccessTabs from "./PeopleAccessTabs";
import { RolesPermissions, UsersGroup, CardJobTitles } from "@/Icons";
import Modal from "@/designSystem/Modal";
import AddRoleWizard from "../AddRoleWizard";
import { RoleFormData } from "../AddRoleWizard/types";
import AddJobTitleWizard from "../AddJobTitleWizard";
import { JobTitleFormData } from "../AddJobTitleWizard/types";
import AddTeamWizard from "../AddTeamWizard";
import { TeamFormData } from "../AddTeamWizard/types";
import ConfirmModal from "@/designSystem/ConfirmModal";
import MembersModal from "@/designSystem/MembersModal";
import RolesPermissionsHeader from "./RolesPermissionsHeader";
import { toast } from "@/utilities/toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useRole } from "@/hooks/roles/useRole";
import { useJobTitle } from "@/hooks/jobTitles/useJobTitle";
import { useTeam } from "@/hooks/teams/useTeam";
import LoadingState from "@/designSystem/LoadingState";
import type { Role as BackendRole } from "@/services/roleService";
import type { JobTitle as BackendJobTitle } from "@/services/jobTitleService";
import type { Team as BackendTeam } from "@/services/teamService";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";
import { useDebounce } from "@/hooks/useDebounce";

function PeopleAccessView() {
   const { t } = useTranslation("settings");
   const { can } = usePermissions();
   const [searchParams, setSearchParams] = useSearchParams();
   const tabParam = searchParams.get("tab");

   // Permission checks
   const canReadRole = can("read_role");
   const canCreateRole = can("create_role");
   const canUpdateRole = can("update_role");
   const canDeleteRole = can("delete_role");
   const canReadRoleMembers = can("read_role_member");

   const canReadJobTitle = can("read_job_title");
   const canCreateJobTitle = can("create_job_title");
   const canUpdateJobTitle = can("update_job_title");
   const canDeleteJobTitle = can("delete_job_title");

   const canReadTeam = can("read_team");
   const canCreateTeam = can("create_team");
   const canUpdateTeam = can("update_team");
   const canDeleteTeam = can("delete_team");

   const canAccessRoles =
      canReadRole ||
      canCreateRole ||
      canUpdateRole ||
      canDeleteRole ||
      canReadRoleMembers;
   const canAccessJobTitles =
      canReadJobTitle ||
      canCreateJobTitle ||
      canUpdateJobTitle ||
      canDeleteJobTitle;
   const canAccessTeams =
      canReadTeam || canCreateTeam || canUpdateTeam || canDeleteTeam;

   const tabs = useMemo(
      () =>
         [
            {
               id: "roles",
               label: t("rolesPermissions.title"),
               icon: RolesPermissions,
               canAccess: canAccessRoles,
            },
            {
               id: "jobs",
               label: t("peopleAccess.jobTitles"),
               icon: CardJobTitles,
               canAccess: canAccessJobTitles,
            },
            {
               id: "teams",
               label: t("peopleAccess.teams"),
               icon: UsersGroup,
               canAccess: canAccessTeams,
            },
         ].filter((tab) => tab.canAccess),
      [t, canAccessRoles, canAccessJobTitles, canAccessTeams],
   );

   const activeTab = tabs.some((tab) => tab.id === tabParam)
      ? tabParam
      : tabs[0]?.id;

   // Set default tab query param if not specified
   useEffect(() => {
      if (!tabs.length) return;
      if (!tabParam || !tabs.some((tab) => tab.id === tabParam)) {
         setSearchParams({ tab: tabs[0].id }, { replace: true });
      }
   }, [tabParam, setSearchParams, tabs]);

   const [viewType, setViewType] = useState<"table" | "grid">("table");
   const [jobTitlesViewType, setJobTitlesViewType] = useState<"table" | "grid">(
      "grid",
   );
   const [teamsViewType, setTeamsViewType] = useState<"table" | "grid">("grid");
   const [roleSearchQuery, setRoleSearchQuery] = useState("");
   const [jobTitleSearchQuery, setJobTitleSearchQuery] = useState("");
   const [teamSearchQuery, setTeamSearchQuery] = useState("");
   const debouncedRoleSearchQuery = useDebounce(roleSearchQuery, 400);
   const debouncedJobTitleSearchQuery = useDebounce(jobTitleSearchQuery, 400);
   const debouncedTeamSearchQuery = useDebounce(teamSearchQuery, 400);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isJobTitleModalOpen, setIsJobTitleModalOpen] = useState(false);
   const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
   const [showWarningModal, setShowWarningModal] = useState(false);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
   const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
   const [editingJobTitleId, setEditingJobTitleId] = useState<number | null>(
      null,
   );
   const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
   const [membersModalState, setMembersModalState] = useState<{
      isOpen: boolean;
      entityId?: number | string;
      entityName?: string;
      entityType?: "role" | "jobTitle" | "team";
   }>({ isOpen: false });
   const wizardFormDataRef = useRef<RoleFormData | null>(null);
   const jobTitleWizardFormDataRef = useRef<JobTitleFormData | null>(null);
   const teamWizardFormDataRef = useRef<TeamFormData | null>(null);

   const showRoles = activeTab === "roles";
   const showJobTitles = activeTab === "jobs";
   const showTeams = activeTab === "teams";

   // Hooks for roles and permissions
   const {
      useListRoles,
      useGetRoleById,
      useCreateRole,
      useUpdateRole,
      useUpdateRolePermissions,
      useDeleteRole,
      useDuplicateRole,
   } = useRole();
   const roleFilterParams = useMemo(
      () => ({
         search: debouncedRoleSearchQuery || undefined,
      }),
      [debouncedRoleSearchQuery],
   );

   const {
      data: rolesData,
      isLoading: isLoadingRoles,
      error: rolesError,
   } = useListRoles(roleFilterParams, {
      enabled: canReadRole,
   });
   const { data: editingRoleData, isLoading: isLoadingEditingRole } =
      useGetRoleById(editingRoleId || 0, {
         enabled: canReadRole && editingRoleId !== null,
      });
   const createRoleMutation = useCreateRole();
   const updateRoleMutation = useUpdateRole();
   const updateRolePermissionsMutation = useUpdateRolePermissions();
   const deleteRoleMutation = useDeleteRole();
   const duplicateRoleMutation = useDuplicateRole();

   // Hooks for job titles
   const {
      useListJobTitles,
      useGetJobTitleById,
      useCreateJobTitle,
      useUpdateJobTitle,
      useDeleteJobTitle,
   } = useJobTitle();
   const jobTitleFilterParams = useMemo(
      () => ({
         search: debouncedJobTitleSearchQuery || undefined,
      }),
      [debouncedJobTitleSearchQuery],
   );

   const {
      data: jobTitlesData,
      isLoading: isLoadingJobTitles,
      error: jobTitlesError,
      refetch: refetchJobTitles,
   } = useListJobTitles(jobTitleFilterParams, {
      enabled: canReadJobTitle,
   });
   const { data: editingJobTitleData, isLoading: isLoadingEditingJobTitle } =
      useGetJobTitleById(editingJobTitleId || 0, {
         enabled: canReadJobTitle && editingJobTitleId !== null,
      });
   const createJobTitleMutation = useCreateJobTitle();
   const updateJobTitleMutation = useUpdateJobTitle();
   const deleteJobTitleMutation = useDeleteJobTitle();

   // Hooks for teams
   const {
      useListTeams,
      useGetTeamById,
      useCreateTeam,
      useUpdateTeam,
      useDeleteTeam,
   } = useTeam();
   const teamFilterParams = useMemo(
      () => ({
         search: debouncedTeamSearchQuery || undefined,
      }),
      [debouncedTeamSearchQuery],
   );

   const {
      data: teamsData,
      isLoading: isLoadingTeams,
      error: teamsError,
      refetch: refetchTeams,
   } = useListTeams(teamFilterParams, {
      enabled: canReadTeam,
   });
   const { data: editingTeamData, isLoading: isLoadingEditingTeam } =
      useGetTeamById(editingTeamId || 0, {
         enabled: canReadTeam && editingTeamId !== null,
      });
   const createTeamMutation = useCreateTeam();
   const updateTeamMutation = useUpdateTeam();
   const deleteTeamMutation = useDeleteTeam();

   // Transform backend roles to component format
   const rawRoleCards = useMemo(() => {
      if (!rolesData?.data) return [];
      return rolesData.data.map((role: BackendRole) => {
         // Extract job titles from both assigned and default_for arrays
         const getJobTitleName = (jt: unknown) => {
            if (typeof jt === "string") return jt;
            if (typeof jt === "number") return String(jt);
            if (jt && typeof jt === "object") {
               const j = jt as Record<string, unknown>;
               const name = j.name ?? j.title ?? j.id;
               if (typeof name === "string") return name;
               if (typeof name === "number") return String(name);
               return JSON.stringify(j);
            }
            return String(jt);
         };

         const assignedJobTitles =
            role.job_titles?.assigned?.map((jobTitle: unknown) =>
               getJobTitleName(jobTitle),
            ) || [];

         const defaultForJobTitles =
            role.job_titles?.default_for?.map((jobTitle: unknown) =>
               getJobTitleName(jobTitle),
            ) || [];

         // Also cross-reference with jobTitlesData to find job titles that have this role
         // This ensures we capture all job titles related to this role
         const relatedJobTitlesFromData =
            jobTitlesData?.data
               ?.filter((jobTitle: BackendJobTitle) => {
                  // Check if this job title has this role (either as default or assigned)
                  return jobTitle.roles?.some(
                     (jobTitleRole) => jobTitleRole.id === role.id,
                  );
               })
               .map((jobTitle: BackendJobTitle) => jobTitle.title) || [];

         // Combine and deduplicate job titles
         const allJobTitles = [
            ...new Set([
               ...assignedJobTitles,
               ...defaultForJobTitles,
               ...relatedJobTitlesFromData,
            ]),
         ];

         // Collect Job Title IDs for filtering
         const assignedIds = role.assigned_job_titles || [];
         const defaultForIds = role.default_for_job_titles || [];
         const relatedIdsFromData =
            jobTitlesData?.data
               ?.filter((jobTitle: BackendJobTitle) => {
                  return jobTitle.roles?.some(
                     (jobTitleRole) => jobTitleRole.id === role.id,
                  );
               })
               .map((jobTitle: BackendJobTitle) => String(jobTitle.id)) || [];

         const allJobTitleIds = [
            ...new Set([
               ...assignedIds.map(String),
               ...defaultForIds.map(String),
               ...relatedIdsFromData,
            ]),
         ];

         return {
            id: role.id,
            title: role.name,
            description: role.description || "",
            membersCount: role.member_count || 0,
            jobTitles: allJobTitles,
            jobTitleIds: allJobTitleIds,
         };
      });
   }, [rolesData, jobTitlesData]);

   const roleCards = rawRoleCards;

   // Helper to extract error message safely from unknown
   const getErrorMessage = (error: unknown, fallback = "An error occurred") => {
      if (!error) return fallback;
      if (typeof error === "string") return error;
      if (typeof error === "object") {
         const e = error as Record<string, unknown>;
         const response = e.response as Record<string, unknown> | undefined;
         const data = response?.data as Record<string, unknown> | undefined;
         const msg = data?.message ?? e.message;
         if (typeof msg === "string") return msg;
         return fallback;
      }
      return fallback;
   };

   // Transform backend job titles to component format
   // Note: Backend returns roles array that includes both junction table roles
   // and the default role (with is_default: true flag)
   const rawJobTitleCards = useMemo(() => {
      if (!jobTitlesData?.data) return [];
      return jobTitlesData.data.map((jobTitle: BackendJobTitle) => {
         // Collect all role names associated with this job title (including default and assigned)
         const tags = jobTitle.roles?.map((role) => role.name) || [];

         return {
            id: jobTitle.id,
            title: jobTitle.title,
            description: jobTitle.description || "",
            membersCount: jobTitle.member_count || 0,
            tags,
         };
      });
   }, [jobTitlesData]);

   const jobTitleCards = rawJobTitleCards;

   // Transform backend teams to component format
   const rawTeamCards = useMemo(() => {
      if (!teamsData?.data) return [];

      return teamsData.data.map((team: BackendTeam) => {
         // Extract job title names from the job_titles array
         const jobTitles = team.job_titles?.map((jt) => jt.title) || [];

         return {
            id: team.id,
            title: team.name,
            description: team.description || "",
            membersCount: team.member_count || 0,
            jobTitles: jobTitles,
         };
      });
   }, [teamsData]);

   const teamCards = rawTeamCards;

   // Check if there are unsaved changes
   const hasUnsavedChanges = () => {
      if (!wizardFormDataRef.current) return false;
      const data = wizardFormDataRef.current;
      return !!(
         data.name ||
         data.description ||
         (data.jobTitles && data.jobTitles.length > 0) ||
         data.permissions.length > 0
      );
   };

   const handleCloseModal = () => {
      if (hasUnsavedChanges()) {
         setShowWarningModal(true);
      } else {
         setIsModalOpen(false);
         setEditingRoleId(null);
         wizardFormDataRef.current = null;
      }
   };

   const handleDiscardChanges = () => {
      setShowWarningModal(false);
      setIsModalOpen(false);
      setEditingRoleId(null);
      wizardFormDataRef.current = null;
   };

   const handleStayAndContinue = () => {
      setShowWarningModal(false);
   };

   const handleAddRole = async (data: RoleFormData) => {
      try {
         // Send ALL selected permissions (not just changes)
         // The form maintains all selected permissions in data.permissions
         const permissionIds = (data.permissions || []).map((permission) => ({
            permission_id: permission.permission_id,
            scope: permission.scope,
         }));

         // Map job title IDs to numbers (if they're strings)
         const assignedJobTitles = data.jobTitles
            ?.map((id) => (typeof id === "string" ? parseInt(id, 10) : id))
            .filter((id): id is number => !isNaN(id));

         if (editingRoleId) {
            // Update existing role
            // First update role basic info
            await updateRoleMutation.mutateAsync({
               id: editingRoleId,
               payload: {
                  role_name: data.name,
                  description: data.description || undefined,
               },
            });

            // Then update permissions (service automatically includes read_role)
            await updateRolePermissionsMutation.mutateAsync({
               id: editingRoleId,
               payload: {
                  permission_ids: permissionIds,
               },
            });

            // Show success toast
            toast.success(`The role "${data.name}" is updated successfully`);
         } else {
            // Create new role (service automatically includes read_role)
            const payload = {
               role_name: data.name,
               description: data.description || undefined,
               permission_ids: permissionIds,
               ...(assignedJobTitles && assignedJobTitles.length > 0
                  ? { assigned_job_titles: assignedJobTitles }
                  : {}),
            };

            await createRoleMutation.mutateAsync(payload);

            // Show success toast
            toast.success(`The role "${data.name}" is created successfully`);
         }

         setIsModalOpen(false);
         setEditingRoleId(null);
         wizardFormDataRef.current = null;
      } catch (error: unknown) {
         // Show error toast
         const errorMessage = getErrorMessage(
            error,
            editingRoleId ? "Failed to update role" : "Failed to create role",
         );
         toast.error(errorMessage);
      }
   };

   const handleFormDataChange = (data: RoleFormData) => {
      wizardFormDataRef.current = data;
   };

   // Handle role actions
   const handleEditRole = (roleTitle: string) => {
      const role = roleCards.find((r) => r.title === roleTitle);
      if (role) {
         setEditingRoleId(role.id);
         setIsModalOpen(true);
      }
   };

   const handleDuplicateRole = async (roleTitle: string) => {
      const role = roleCards.find((r) => r.title === roleTitle);
      if (!role) return;

      try {
         // Duplicate the role (API automatically adds "(Copy)" to the name)
         const duplicateResponse = await duplicateRoleMutation.mutateAsync(
            role.id,
         );

         // Get the duplicated role's ID
         const duplicatedRoleId = duplicateResponse.id;

         // Open the duplicated role in edit mode
         setEditingRoleId(duplicatedRoleId);
         setIsModalOpen(true);

         toast.success(
            `The role "${roleTitle}" has been duplicated successfully`,
         );
      } catch (error: unknown) {
         const errorMessage = getErrorMessage(
            error,
            "Failed to duplicate role",
         );
         toast.error(errorMessage);
      }
   };

   const handleDeleteRole = (roleTitle: string) => {
      setRoleToDelete(roleTitle);
      setShowDeleteModal(true);
   };

   const handleConfirmDelete = async () => {
      if (!roleToDelete) return;

      // Check if it's a role, job title, or team
      const role = roleCards.find((r) => r.title === roleToDelete);
      const jobTitle = jobTitleCards.find((jt) => jt.title === roleToDelete);
      const team = teamCards.find((t) => t.title === roleToDelete);

      if (role) {
         // Delete role
         try {
            await deleteRoleMutation.mutateAsync(role.id);
            toast.success(
               t("rolesPermissions.messages.deleteSuccess", {
                  name: roleToDelete,
               }),
            );
            setShowDeleteModal(false);
            setRoleToDelete(null);
         } catch (error: unknown) {
            const errorMessage = getErrorMessage(
               error,
               "Failed to delete role",
            );
            toast.error(errorMessage);
         }
      } else if (jobTitle) {
         // Delete job title
         try {
            await deleteJobTitleMutation.mutateAsync(jobTitle.id);
            toast.success(
               `The job title "${roleToDelete}" has been deleted successfully`,
            );
            setShowDeleteModal(false);
            setRoleToDelete(null);
         } catch (error: unknown) {
            const errorMessage = getErrorMessage(
               error,
               "Failed to delete job title",
            );
            toast.error(errorMessage);
         }
      } else if (team) {
         // Delete team
         try {
            await deleteTeamMutation.mutateAsync(team.id);
            toast.success(
               `The team "${roleToDelete}" has been deleted successfully`,
            );
            setShowDeleteModal(false);
            setRoleToDelete(null);
         } catch (error: unknown) {
            const errorMessage = getErrorMessage(
               error,
               "Failed to delete team",
            );
            toast.error(errorMessage);
         }
      }
   };

   const handleCancelDelete = () => {
      setShowDeleteModal(false);
      setRoleToDelete(null);
   };

   // Handle job title actions
   const handleEditJobTitle = (jobTitleTitle: string) => {
      const jobTitle = jobTitleCards.find((jt) => jt.title === jobTitleTitle);
      if (jobTitle) {
         setEditingJobTitleId(jobTitle.id);
         setIsJobTitleModalOpen(true);
      }
   };

   const handleDuplicateJobTitle = async (jobTitleTitle: string) => {
      const jobTitle = jobTitleCards.find((jt) => jt.title === jobTitleTitle);
      if (!jobTitle) return;

      try {
         // Fetch the job title data
         const jobTitleData = jobTitlesData?.data?.find(
            (jt: BackendJobTitle) => jt.id === jobTitle.id,
         );

         if (!jobTitleData) {
            toast.error("Job title data not found");
            return;
         }

         // Get all role IDs (convert to strings as required by API)
         const roleIds =
            jobTitleData.roles?.map((role) => role.id.toString()) || [];

         // Create a new job title with "(Copy)" appended to the name
         const duplicatePayload = {
            title: `${jobTitleData.title} (Copy)`,
            description: jobTitleData.description || null,
            roles: roleIds.length > 0 ? roleIds : null,
         };

         const duplicateResponse =
            await createJobTitleMutation.mutateAsync(duplicatePayload);

         // Refetch job titles to get the new one
         await refetchJobTitles();

         // Open the duplicated job title in edit mode
         setEditingJobTitleId(duplicateResponse.id);
         setIsJobTitleModalOpen(true);

         toast.success(
            `The job title "${jobTitleTitle}" has been duplicated successfully`,
         );
      } catch (error: unknown) {
         const errorMessage = getErrorMessage(
            error,
            "Failed to duplicate job title",
         );
         toast.error(errorMessage);
      }
   };

   const handleDeleteJobTitle = (jobTitleTitle: string) => {
      setRoleToDelete(jobTitleTitle);
      setShowDeleteModal(true);
   };

   // Handle team actions
   const handleEditTeam = (teamTitle: string) => {
      const team = teamCards.find((t) => t.title === teamTitle);
      if (team) {
         setEditingTeamId(team.id);
         setIsTeamModalOpen(true);
      }
   };

   const handleDuplicateTeam = async (teamTitle: string) => {
      const team = teamCards.find((t) => t.title === teamTitle);
      if (!team) return;

      try {
         // Fetch the team data
         const teamData = teamsData?.data?.find(
            (t: BackendTeam) => t.id === team.id,
         );

         if (!teamData) {
            toast.error("Team data not found");
            return;
         }

         // Extract job title IDs from the team's job_titles array
         const jobTitleIds = teamData.job_titles?.map((jt) => jt.id) || [];

         // Create a new team with "(Copy)" appended to the name
         const duplicatePayload = {
            name: `${teamData.name} (Copy)`,
            description: teamData.description || null,
            ...(jobTitleIds.length > 0 ? { job_titles: jobTitleIds } : {}),
         };

         const duplicateResponse =
            await createTeamMutation.mutateAsync(duplicatePayload);

         // Refetch teams to get the new one
         await refetchTeams();

         // Open the duplicated team in edit mode
         setEditingTeamId(duplicateResponse.id);
         setIsTeamModalOpen(true);

         toast.success(
            `The team "${teamTitle}" has been duplicated successfully`,
         );
      } catch (error: unknown) {
         const errorMessage = getErrorMessage(
            error,
            "Failed to duplicate team",
         );
         toast.error(errorMessage);
      }
   };

   const handleDeleteTeam = (teamTitle: string) => {
      setRoleToDelete(teamTitle);
      setShowDeleteModal(true);
   };

   const handleAddJobTitle = () => {
      setEditingJobTitleId(null);
      setIsJobTitleModalOpen(true);
      jobTitleWizardFormDataRef.current = null;
   };

   const hasJobTitleUnsavedChanges = () => {
      if (!jobTitleWizardFormDataRef.current) return false;
      const data = jobTitleWizardFormDataRef.current;
      return !!(
         data.name ||
         data.description ||
         (data.roles && data.roles.length > 0)
      );
   };

   const handleCloseJobTitleModal = () => {
      if (hasJobTitleUnsavedChanges()) {
         setShowWarningModal(true);
      } else {
         setIsJobTitleModalOpen(false);
         setEditingJobTitleId(null);
         jobTitleWizardFormDataRef.current = null;
      }
   };

   const handleDiscardJobTitleChanges = () => {
      setShowWarningModal(false);
      setIsJobTitleModalOpen(false);
      setEditingJobTitleId(null);
      jobTitleWizardFormDataRef.current = null;
   };

   const handleJobTitleFormDataChange = (data: JobTitleFormData) => {
      jobTitleWizardFormDataRef.current = data;
   };

   const handleSubmitJobTitle = async (data: JobTitleFormData) => {
      try {
         if (editingJobTitleId) {
            // Update existing job title
            // Get the default role ID from the roles array
            const defaultRoleId =
               data.roles && data.roles.length > 0
                  ? parseInt(data.roles[0], 10)
                  : null;

            const payload = {
               title: data.name,
               description: data.description || null,
               default_role_id: defaultRoleId,
            };

            await updateJobTitleMutation.mutateAsync({
               id: editingJobTitleId,
               payload,
            });

            // Explicitly refetch job titles to ensure UI updates immediately
            await refetchJobTitles();

            // Show success toast
            toast.success(
               `The job title "${data.name}" is updated successfully`,
            );
         } else {
            // Create new job title
            const payload = {
               title: data.name,
               description: data.description || null,
               roles: data.roles && data.roles.length > 0 ? data.roles : null,
            };

            await createJobTitleMutation.mutateAsync(payload);

            // Explicitly refetch job titles to ensure UI updates immediately
            await refetchJobTitles();

            // Show success toast
            toast.success(
               `The job title "${data.name}" is created successfully`,
            );
         }

         setIsJobTitleModalOpen(false);
         setEditingJobTitleId(null);
         jobTitleWizardFormDataRef.current = null;
      } catch (error: unknown) {
         // Show error toast
         const errorMessage = getErrorMessage(
            error,
            editingJobTitleId
               ? "Failed to update job title"
               : "Failed to create job title",
         );
         toast.error(errorMessage);
      }
   };

   // Transform editing role data to RoleFormData format
   const editingRoleFormData = useMemo<RoleFormData | undefined>(() => {
      if (!editingRoleData) return undefined;

      const permissionSelections =
         editingRoleData.permissions
            ?.map((permission) => {
               const permissionId =
                  typeof permission.id === "number"
                     ? permission.id
                     : permission.permission_id;
               if (typeof permissionId !== "number") return null;
               return {
                  permission_id: permissionId,
                  scope:
                     permission.scope || permission.scope_default || "DEFAULT",
               };
            })
            .filter(
               (
                  permission,
               ): permission is { permission_id: number; scope: string } =>
                  !!permission,
            ) || [];

      // Extract job title IDs from assigned_job_titles or job_titles.assigned
      // We need to ensure the IDs match the format used in availableJobTitles (string IDs)
      const jobTitleIds: string[] = [];

      // First, try assigned_job_titles array (array of numbers)
      if (
         editingRoleData.assigned_job_titles &&
         editingRoleData.assigned_job_titles.length > 0
      ) {
         editingRoleData.assigned_job_titles.forEach((id: number) => {
            const idStr = id.toString();
            if (!jobTitleIds.includes(idStr)) {
               jobTitleIds.push(idStr);
            }
         });
      }

      // Also check job_titles.assigned (might be objects or IDs)
      if (
         editingRoleData.job_titles?.assigned &&
         editingRoleData.job_titles.assigned.length > 0
      ) {
         editingRoleData.job_titles.assigned.forEach((jt: unknown) => {
            let id: number | undefined;
            if (typeof jt === "number") {
               id = jt;
            } else if (jt && typeof jt === "object") {
               // Could be { id, job_title_id, title, etc. }
               const job = jt as Record<string, unknown>;
               const maybeId = job.id ?? job.job_title_id;
               if (typeof maybeId === "number") id = maybeId;
               else if (typeof maybeId === "string") {
                  const parsed = parseInt(maybeId, 10);
                  if (!isNaN(parsed)) id = parsed;
               }
            } else if (typeof jt === "string") {
               // Try to parse if it's a string number
               const parsed = parseInt(jt, 10);
               if (!isNaN(parsed)) id = parsed;
            }

            if (id) {
               const idStr = id.toString();
               if (!jobTitleIds.includes(idStr)) {
                  jobTitleIds.push(idStr);
               }
            }
         });
      }

      // Also cross-reference with jobTitlesData to find job titles that have this role
      // This ensures we capture all job titles related to this role
      if (jobTitlesData?.data && editingRoleData.id) {
         jobTitlesData.data.forEach((jobTitle: BackendJobTitle) => {
            // Check if this job title has this role assigned
            const hasRole = jobTitle.roles?.some(
               (jobTitleRole) => jobTitleRole.id === editingRoleData.id,
            );
            if (hasRole) {
               const idStr = jobTitle.id.toString();
               if (!jobTitleIds.includes(idStr)) {
                  jobTitleIds.push(idStr);
               }
            }
         });
      }

      return {
         name: editingRoleData.name,
         description: editingRoleData.description || "",
         permissions: permissionSelections,
         jobTitles: jobTitleIds.length > 0 ? jobTitleIds : [],
      };
   }, [editingRoleData, jobTitlesData]);

   // Transform editing job title data to JobTitleFormData format
   const editingJobTitleFormData = useMemo<JobTitleFormData | undefined>(() => {
      if (!editingJobTitleData) return undefined;

      // Get all role IDs assigned to this job title (convert to strings as required by form)
      const roleIds =
         editingJobTitleData.roles?.map((role) => role.id.toString()) || [];

      return {
         name: editingJobTitleData.title,
         description: editingJobTitleData.description || "",
         roles: roleIds,
      };
   }, [editingJobTitleData]);

   // Transform editing team data to TeamFormData format
   const editingTeamFormData = useMemo<TeamFormData | undefined>(() => {
      if (!editingTeamData) return undefined;

      // Extract job title IDs from the team's job_titles array
      const jobTitleIds =
         editingTeamData.job_titles?.map((jt) => jt.id.toString()) || [];

      return {
         name: editingTeamData.name,
         description: editingTeamData.description || "",
         jobTitles: jobTitleIds,
      };
   }, [editingTeamData]);

   // Get available roles for the dropdown (from backend data)
   // This is used in AddJobTitleWizard for the Default Role dropdown
   const availableRoles = useMemo(
      () =>
         roleCards.map((role) => ({
            id: role.id.toString(),
            title: role.title,
         })),
      [roleCards],
   );

   // Get available job titles for the team wizard
   const availableJobTitles = useMemo(
      () =>
         jobTitleCards.map((jobTitle) => ({
            id: jobTitle.id.toString(),
            title: jobTitle.title,
         })),
      [jobTitleCards],
   );

   // Team handlers
   const handleAddTeam = () => {
      setEditingTeamId(null);
      setIsTeamModalOpen(true);
      teamWizardFormDataRef.current = null;
   };

   const hasTeamUnsavedChanges = () => {
      if (!teamWizardFormDataRef.current) return false;
      const data = teamWizardFormDataRef.current;
      return !!(
         data.name ||
         data.description ||
         (data.jobTitles && data.jobTitles.length > 0)
      );
   };

   const handleCloseTeamModal = () => {
      if (hasTeamUnsavedChanges()) {
         setShowWarningModal(true);
      } else {
         setIsTeamModalOpen(false);
         setEditingTeamId(null);
         teamWizardFormDataRef.current = null;
      }
   };

   const handleDiscardTeamChanges = () => {
      setShowWarningModal(false);
      setIsTeamModalOpen(false);
      setEditingTeamId(null);
      teamWizardFormDataRef.current = null;
   };

   const handleTeamFormDataChange = (data: TeamFormData) => {
      teamWizardFormDataRef.current = data;
   };

   const handleSubmitTeam = async (data: TeamFormData) => {
      try {
         // Map job title IDs to numbers (if they're strings)
         const jobTitleIds = data.jobTitles
            ?.map((id) => {
               if (typeof id === "string") {
                  const parsed = parseInt(id, 10);
                  return isNaN(parsed) ? null : parsed;
               }
               return typeof id === "number" ? id : null;
            })
            .filter((id): id is number => id !== null);

         // Prepare API payload
         const payload = {
            name: data.name,
            description: data.description || null,
            ...(jobTitleIds && jobTitleIds.length > 0
               ? { job_titles: jobTitleIds }
               : {}),
         };

         if (editingTeamId) {
            // Update existing team
            await updateTeamMutation.mutateAsync({
               id: editingTeamId,
               payload,
            });

            // Explicitly refetch teams to ensure UI updates immediately
            await refetchTeams();

            // Show success toast
            toast.success(`The team "${data.name}" is updated successfully`);
         } else {
            // Create new team
            await createTeamMutation.mutateAsync(payload);

            // Explicitly refetch teams to ensure UI updates immediately
            await refetchTeams();

            // Show success toast
            toast.success(`The team "${data.name}" is created successfully`);
         }

         setIsTeamModalOpen(false);
         setEditingTeamId(null);
         teamWizardFormDataRef.current = null;
      } catch (error: unknown) {
         // Show error toast
         const errorMessage = getErrorMessage(
            error,
            editingTeamId ? "Failed to update team" : "Failed to create team",
         );
         toast.error(errorMessage);
      }
   };

   return (
      <div className="flex flex-col gap-6">
         {!tabs.length ? (
            <div className="p-6">
               <NoPermissionMessage
                  message={t("permissions.noAccess.title", "Access Restricted")}
                  description={t(
                     "permissions.noAccess.message",
                     "You don't have permission to access this section.",
                  )}
               />
            </div>
         ) : (
            <PeopleAccessTabs
               tabs={tabs}
               activeTab={activeTab || ""}
               onTabChange={(tab) =>
                  setSearchParams({ tab }, { replace: false })
               }
            />
         )}

         <div className="flex flex-col gap-6">
            {showRoles && (
               <RolesPermissionsHeader
                  onAddRole={() => {
                     setEditingRoleId(null);
                     setIsModalOpen(true);
                     wizardFormDataRef.current = null;
                  }}
                  onSearch={setRoleSearchQuery}
                  onViewTypeChange={setViewType}
                  viewType={viewType}
                  addButtonPermission="create_role"
               />
            )}
            {showJobTitles && (
               <RolesPermissionsHeader
                  onAddRole={handleAddJobTitle}
                  onSearch={setJobTitleSearchQuery}
                  onViewTypeChange={setJobTitlesViewType}
                  viewType={jobTitlesViewType}
                  searchPlaceholder={t("peopleAccess.searchJobTitle")}
                  title={t("peopleAccess.jobTitles")}
                  description={t("peopleAccess.description")}
                  addButtonText={t("peopleAccess.addJobTitle")}
                  addButtonPermission="create_job_title"
               />
            )}
            {showTeams && (
               <RolesPermissionsHeader
                  onAddRole={handleAddTeam}
                  onSearch={setTeamSearchQuery}
                  onViewTypeChange={setTeamsViewType}
                  viewType={teamsViewType}
                  searchPlaceholder={t("peopleAccess.searchTeam")}
                  title={t("peopleAccess.teams")}
                  description={t("peopleAccess.description")}
                  addButtonText={t("peopleAccess.addTeam")}
                  addButtonPermission="create_team"
               />
            )}
            {/* Add/Edit Role Modal */}
            <Modal
               isOpen={isModalOpen}
               onClose={handleCloseModal}
               title={
                  editingRoleId
                     ? t("rolesPermissions.modals.editRole")
                     : t("rolesPermissions.modals.addRole")
               }
               size="large">
               {isLoadingEditingRole && editingRoleId ? (
                  <div className="flex items-center justify-center py-12">
                     <p className="text-text-sub">
                        {t("rolesPermissions.modals.loadingRole")}
                     </p>
                  </div>
               ) : (
                  <AddRoleWizard
                     key={editingRoleId || "new-role"}
                     onSubmit={handleAddRole}
                     onCancel={handleCloseModal}
                     availableJobTitles={availableJobTitles}
                     onFormDataChange={handleFormDataChange}
                     initialData={editingRoleFormData}
                  />
               )}
            </Modal>
            {/* Add/Edit Job Title Modal */}
            <Modal
               isOpen={isJobTitleModalOpen}
               onClose={handleCloseJobTitleModal}
               title={editingJobTitleId ? "Edit Job Title" : "Add Job Title"}
               size="large">
               {isLoadingEditingJobTitle && editingJobTitleId ? (
                  <div className="flex items-center justify-center py-12">
                     <p className="text-text-sub">Loading job title data...</p>
                  </div>
               ) : (
                  <AddJobTitleWizard
                     key={editingJobTitleId || "new-job-title"}
                     onSubmit={handleSubmitJobTitle}
                     onCancel={handleCloseJobTitleModal}
                     availableRoles={availableRoles}
                     onFormDataChange={handleJobTitleFormDataChange}
                     initialData={editingJobTitleFormData}
                  />
               )}
            </Modal>
            {/* Add/Edit Team Modal */}
            <Modal
               isOpen={isTeamModalOpen}
               onClose={handleCloseTeamModal}
               title={editingTeamId ? "Edit Team" : "Add Team"}
               size="large">
               {isLoadingEditingTeam && editingTeamId ? (
                  <div className="flex items-center justify-center py-12">
                     <p className="text-text-sub">Loading team data...</p>
                  </div>
               ) : (
                  <AddTeamWizard
                     key={editingTeamId || "new-team"}
                     onSubmit={handleSubmitTeam}
                     onCancel={handleCloseTeamModal}
                     availableJobTitles={availableJobTitles}
                     onFormDataChange={handleTeamFormDataChange}
                     initialData={editingTeamFormData}
                  />
               )}
            </Modal>
            {/* Warning Modal for unsaved changes */}
            <ConfirmModal
               isOpen={showWarningModal}
               onClose={handleStayAndContinue}
               onConfirm={
                  isTeamModalOpen
                     ? handleDiscardTeamChanges
                     : isJobTitleModalOpen
                       ? handleDiscardJobTitleChanges
                       : handleDiscardChanges
               }
               title={
                  isTeamModalOpen
                     ? t("peopleAccess.modals.leaveTeamSetup")
                     : isJobTitleModalOpen
                       ? t("peopleAccess.modals.leaveJobTitleSetup")
                       : t("rolesPermissions.modals.leaveSetup")
               }
               description={t("rolesPermissions.modals.leaveDescription")}
               confirmText={t("rolesPermissions.modals.discardChanges")}
               cancelText={t("rolesPermissions.modals.stayContinue")}
               variant="error"
            />

            {/* Delete Role Modal */}
            <ConfirmModal
               isOpen={showDeleteModal}
               onClose={handleCancelDelete}
               onConfirm={handleConfirmDelete}
               title={t("rolesPermissions.modals.deleteRole")}
               description={t("rolesPermissions.modals.deleteDescription")}
               confirmText={t("rolesPermissions.modals.deleteConfirm")}
               cancelText={t("common.cancel")}
               variant="error"
            />
            {/* Members Modal for Table View */}
            {membersModalState.isOpen && (
               <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                  <div
                     className="absolute inset-0 bg-(--color-overlay)"
                     onClick={() => setMembersModalState({ isOpen: false })}
                     aria-hidden="true"
                  />
                  <div className="relative z-10">
                     <MembersModal
                        onClose={() => setMembersModalState({ isOpen: false })}
                        entityId={membersModalState.entityId}
                        entityName={membersModalState.entityName}
                        entityType={membersModalState.entityType}
                     />
                  </div>
               </div>
            )}
            <AnimatePresence mode="wait">
               {showRoles ? (
                  <motion.div
                     key="roles"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     transition={{ duration: 0.3, ease: "easeInOut" }}>
                     {!canReadRole ? (
                        <div className="p-6">
                           <NoPermissionMessage
                              message={`You don't have permission to view roles. Missing: ${formatPermissionName("read_role")}`}
                           />
                        </div>
                     ) : isLoadingRoles ? (
                        <LoadingState
                           size="large"
                           label={t("roles.loadingRoles")}
                        />
                     ) : rolesError ? (
                        <div className="flex items-center justify-center py-12">
                           <p className="text-danger">
                              Error loading roles. Please try again.
                           </p>
                        </div>
                     ) : roleCards.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                           <p className="text-text-sub">No roles found.</p>
                        </div>
                     ) : viewType === "grid" ? (
                        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
                           {roleCards.map((role, index) => (
                              <motion.div
                                 key={role.id}
                                 initial={{ opacity: 0, scale: 0.95 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 transition={{
                                    duration: 0.2,
                                    delay: index * 0.03,
                                    ease: "easeOut",
                                 }}
                                 className="break-inside-avoid">
                                 <PeopleAccessCard
                                    title={role.title}
                                    description={role.description}
                                    membersCount={role.membersCount}
                                    tags={role.jobTitles}
                                    entityId={role.id}
                                    entityType="role"
                                    onEdit={
                                       canUpdateRole
                                          ? () => handleEditRole(role.title)
                                          : undefined
                                    }
                                    onDuplicate={
                                       canCreateRole
                                          ? () =>
                                               handleDuplicateRole(role.title)
                                          : undefined
                                    }
                                    onDelete={
                                       canDeleteRole
                                          ? () => handleDeleteRole(role.title)
                                          : undefined
                                    }
                                 />
                              </motion.div>
                           ))}
                        </div>
                     ) : (
                        <RoleTable
                           roles={roleCards}
                           onEdit={canUpdateRole ? handleEditRole : undefined}
                           onDuplicate={
                              canCreateRole ? handleDuplicateRole : undefined
                           }
                           onDelete={
                              canDeleteRole ? handleDeleteRole : undefined
                           }
                           onMembersClick={(roleTitle) => {
                              const role = roleCards.find(
                                 (r) => r.title === roleTitle,
                              );
                              if (role) {
                                 setMembersModalState({
                                    isOpen: true,
                                    entityId: role.id,
                                    entityName: role.title,
                                    entityType: "role",
                                 });
                              }
                           }}
                        />
                     )}
                  </motion.div>
               ) : activeTab === "jobs" ? (
                  <motion.div
                     key="jobs"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     transition={{ duration: 0.3, ease: "easeInOut" }}>
                     {!canReadJobTitle ? (
                        <div className="p-6">
                           <NoPermissionMessage
                              message={`You don't have permission to view job titles. Missing: ${formatPermissionName("read_job_title")}`}
                           />
                        </div>
                     ) : isLoadingJobTitles ? (
                        <LoadingState
                           size="large"
                           label={t("jobTitles.loadingJobTitles")}
                        />
                     ) : jobTitlesError ? (
                        <div className="flex items-center justify-center py-12">
                           <p className="text-danger">
                              Error loading job titles. Please try again.
                           </p>
                        </div>
                     ) : jobTitleCards.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                           <p className="text-text-sub">No job titles found.</p>
                        </div>
                     ) : jobTitlesViewType === "grid" ? (
                        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
                           {jobTitleCards.map((jobTitle, index) => (
                              <motion.div
                                 key={jobTitle.id}
                                 initial={{ opacity: 0, scale: 0.95 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 transition={{
                                    duration: 0.2,
                                    delay: index * 0.03,
                                    ease: "easeOut",
                                 }}
                                 className="break-inside-avoid">
                                 <PeopleAccessCard
                                    title={jobTitle.title}
                                    description={jobTitle.description}
                                    membersCount={jobTitle.membersCount}
                                    tags={jobTitle.tags || []}
                                    entityId={jobTitle.id}
                                    entityType="jobTitle"
                                    onEdit={
                                       canUpdateJobTitle
                                          ? () =>
                                               handleEditJobTitle(
                                                  jobTitle.title,
                                               )
                                          : undefined
                                    }
                                    onDuplicate={
                                       canCreateJobTitle
                                          ? () =>
                                               handleDuplicateJobTitle(
                                                  jobTitle.title,
                                               )
                                          : undefined
                                    }
                                    onDelete={
                                       canDeleteJobTitle
                                          ? () =>
                                               handleDeleteJobTitle(
                                                  jobTitle.title,
                                               )
                                          : undefined
                                    }
                                 />
                              </motion.div>
                           ))}
                        </div>
                     ) : (
                        <JobTitleTable
                           jobTitles={jobTitleCards}
                           onEdit={
                              canUpdateJobTitle ? handleEditJobTitle : undefined
                           }
                           onDuplicate={
                              canCreateJobTitle
                                 ? handleDuplicateJobTitle
                                 : undefined
                           }
                           onDelete={
                              canDeleteJobTitle
                                 ? handleDeleteJobTitle
                                 : undefined
                           }
                           onMembersClick={(jobTitle) => {
                              const selected = jobTitleCards.find(
                                 (jt) => jt.title === jobTitle,
                              );
                              if (selected) {
                                 setMembersModalState({
                                    isOpen: true,
                                    entityId: selected.id,
                                    entityName: selected.title,
                                    entityType: "jobTitle",
                                 });
                              }
                           }}
                        />
                     )}
                  </motion.div>
               ) : activeTab === "teams" ? (
                  <motion.div
                     key="teams"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     transition={{ duration: 0.3, ease: "easeInOut" }}>
                     {!canReadTeam ? (
                        <div className="p-6">
                           <NoPermissionMessage
                              message={`You don't have permission to view teams. Missing: ${formatPermissionName("read_team")}`}
                           />
                        </div>
                     ) : isLoadingTeams ? (
                        <LoadingState
                           size="large"
                           label={t("teams.loadingTeams")}
                        />
                     ) : teamsError ? (
                        <div className="flex items-center justify-center py-12">
                           <p className="text-danger">
                              Error loading teams. Please try again.
                           </p>
                        </div>
                     ) : teamCards.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                           <p className="text-text-sub">No teams found.</p>
                        </div>
                     ) : teamsViewType === "grid" ? (
                        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
                           {teamCards.map((team, index) => (
                              <motion.div
                                 key={team.id}
                                 initial={{ opacity: 0, scale: 0.95 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 transition={{
                                    duration: 0.2,
                                    delay: index * 0.03,
                                    ease: "easeOut",
                                 }}
                                 className="break-inside-avoid">
                                 <PeopleAccessCard
                                    title={team.title}
                                    description={team.description}
                                    membersCount={team.membersCount}
                                    tags={team.jobTitles}
                                    entityId={team.id}
                                    entityType="team"
                                    onEdit={
                                       canUpdateTeam
                                          ? () => handleEditTeam(team.title)
                                          : undefined
                                    }
                                    onDuplicate={
                                       canCreateTeam
                                          ? () =>
                                               handleDuplicateTeam(team.title)
                                          : undefined
                                    }
                                    onDelete={
                                       canDeleteTeam
                                          ? () => handleDeleteTeam(team.title)
                                          : undefined
                                    }
                                 />
                              </motion.div>
                           ))}
                        </div>
                     ) : (
                        <TeamTable
                           teams={teamCards}
                           onEdit={canUpdateTeam ? handleEditTeam : undefined}
                           onDuplicate={
                              canCreateTeam ? handleDuplicateTeam : undefined
                           }
                           onDelete={
                              canDeleteTeam ? handleDeleteTeam : undefined
                           }
                           onMembersClick={(teamTitle) => {
                              const selected = teamCards.find(
                                 (team) => team.title === teamTitle,
                              );
                              if (selected) {
                                 setMembersModalState({
                                    isOpen: true,
                                    entityId: selected.id,
                                    entityName: selected.title,
                                    entityType: "team",
                                 });
                              }
                           }}
                        />
                     )}
                  </motion.div>
               ) : null}
            </AnimatePresence>
         </div>
      </div>
   );
}

export default PeopleAccessView;
