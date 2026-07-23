/** @format */

import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import {
   useListEmployees,
   useGetEmployeeDetails,
   useGetEmployeeContract,
   useGetEmployeeDocuments,
   useGetEmployeeStats,
} from "@/hooks/employees/useEmployee";
import { useGetEmployeeById } from "@/hooks/employees/employee.queries";
import { useListJobTitles } from "@/hooks/jobTitles/useJobTitle";
import { useListTeams } from "@/hooks/teams/useTeam";
import { useListRoles } from "@/hooks/roles/useRole";
import {
   useGetAttendanceTimeline,
   useGetTimeOffSummary,
   useGetOvertimeSummary,
   useGetEmployeeAssets,
} from "@/hooks/employees/employee.queries";
import {
   useDeleteEmployee,
   useResetEmployeePermissions,
} from "@/hooks/employees/employee.mutations";
import { useContracts } from "@/hooks/contracts/useContracts";
import { useQueryClient } from "@tanstack/react-query";
import { employeeService } from "@/services/employeeService";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import type { ProfileMember } from "@/components/members/memberProfile/types";
import { sendHeartbeat, onConnect } from "@/services/chat/socketService";
import { useResendOnboardingInvite } from "@/hooks/onboarding/onboarding.mutations";
import { useListOnboarding } from "@/hooks/onboarding/onboarding.queries";

import MemberBreadcrumb from "@/components/members/memberProfile/MemberBreadcrumb";
import ProfileHeroCard from "@/components/members/memberProfile/ProfileHeroCard";
import SummaryCardsSection from "@/components/members/memberProfile/SummaryCardsSection";
import ProfileTabs from "@/components/members/memberProfile/ProfileTabs";
import ProfileInfoTab from "@/components/members/memberProfile/tabs/ProfileInfoTab";
import ContractTab from "@/components/members/memberProfile/tabs/Contract/ContractTab";
import ExtendContractModal from "@/components/members/memberProfile/tabs/Contract/ExtendContractModal";
import TimeManagementTab from "@/components/members/memberProfile/tabs/TimeManagmentTab/TimeManagementTab";
import DocumentsTab from "@/components/members/memberProfile/tabs/DocumentsTab/DocumentsTab";
import AssetsTab from "@/components/members/memberProfile/tabs/AssetsTab/AssetsTab";
import ResidencyTab from "@/components/members/memberProfile/tabs/ResidencyTab";
import PayrollsTab from "@/components/members/memberProfile/tabs/PayrollsTab";
import EditMemberWizard from "@/components/members/EditMemberWizard";
import Modal from "@/designSystem/Modal";
import { getDynamicSummaryCards } from "./memberProfile/constants/summaryCards";
import { getTabs } from "./memberProfile/constants/tabs";
import DirhamLabel from "@/designSystem/DirhamLabel";
import LoadingState from "@/designSystem/LoadingState";
import ConfirmModal from "@/designSystem/ConfirmModal";
import PermissionOverrideModal from "@/components/members/PermissionOverrideModal";
import toast from "@/utilities/toast";
import { getMemberStatusMeta } from "@/components/members/utils/memberStatus";

import { usePermissions } from "@/contexts/PermissionContext";
import { useLanguage } from "@/hooks/useLanguage";
import { getCurrentUserId } from "@/utils/auth";

const isUaeCountry = (value?: string | null) => {
   if (!value) return false;
   const normalized = value.trim().toLowerCase();
   return (
      normalized === "united arab emirates" ||
      normalized === "uae" ||
      normalized === "u.a.e."
   );
};

function MemberProfile() {
   const navigate = useNavigate();
   const { id } = useParams<{ id: string }>();
   const { t } = useTranslation("members");
   const [searchParams, setSearchParams] = useSearchParams();
   const queryClient = useQueryClient();
   const { can } = usePermissions();
   const { language } = useLanguage();
   const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
   const [socketLastUpdated, setSocketLastUpdated] = useState<
      string | undefined
   >(undefined);
   const [isResendModalOpen, setIsResendModalOpen] = useState(false);
   const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
   const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
   const canGrantPermission = can("grant_permission");
   const canUpdateEmployee = can("update_employee");
   const currentUserId = getCurrentUserId();
   const isOwnProfile = id ? String(currentUserId) === String(id) : false;
   // Show edit button only if user has update_employee permission AND is NOT viewing their own profile
   const canEditProfile = canUpdateEmployee && !isOwnProfile;

   // Fetch employee details from API
   const {
      data: employeeData,
      isLoading,
      error,
   } = useGetEmployeeDetails(id || "", {
      enabled: !!id,
   });

   // Fetch basic employee data as fallback for national_id
   const { data: basicEmployeeData } = useGetEmployeeById(id || "", {
      enabled: !!id && !!employeeData, // Only fetch if we have details data
   });

   const isFromUae = employeeData
      ? isUaeCountry(employeeData.personal.country)
      : false;
   const hasContract = employeeData
      ? employeeData.hasContract !== undefined
         ? employeeData.hasContract
         : Boolean(employeeData.contract)
      : true;
   const canViewContractTab =
      can("read_employee_contract") || can("manage_contracts");
   const canExtendContract = can("update_contract") || can("manage_contracts");
   const canViewShiftTab =
      can("manage_shifts") || can("update_employee") || isOwnProfile;

   const shouldFetchContract =
      !!id &&
      !!employeeData &&
      employeeData.hasContract !== false &&
      canViewContractTab;

   const { data: contractData } = useGetEmployeeContract(id || "", {
      enabled: shouldFetchContract,
   });

   // Fetch all contracts to get termination data (needed for summary card)
   const { useList } = useContracts();
   const { data: contractsListResponse } = useList();

   // Fetch summary data for dynamic cards
   const { data: attendanceTimeline } = useGetAttendanceTimeline(
      id || "",
      undefined,
      {
         enabled: !!id && can("view_attendance_requests"),
      },
   );

   const { data: timeOffSummary } = useGetTimeOffSummary(id || "", undefined, {
      enabled: !!id && can("view_vacation_requests"),
   });

   const { data: overtimeSummary } = useGetOvertimeSummary(id || "", undefined, {
      enabled: !!id && can("view_overtime_requests"),
   });

   // Fetch documents and assets for tab counts
   const { data: documentsResponse } = useGetEmployeeDocuments(
      id || "",
      undefined,
      {
         enabled: !!id && can("read_employee_documents"),
      },
   );

   const { data: assetsResponse } = useGetEmployeeAssets(id || "", undefined, {
      enabled: !!id && (can("read_asset") || can("read_assets")),
   });

   const { data: employeeStats } = useGetEmployeeStats();

   // Fetch employees list for profile navigation
   const { data: employeesList } = useListEmployees({
      page: 1,
      limit: 100,
   });

   // Fetch available options for edit wizard
   const { data: jobTitlesResponse } = useListJobTitles();
   const { data: teamsResponse } = useListTeams();
   const { data: rolesResponse } = useListRoles();
   const { data: managersListResponse } = useListEmployees({
      page: 1,
      limit: 100,
   });

   const availableJobTitles =
      jobTitlesResponse?.data?.map((jt) => ({
         id: String(jt.id),
         title: jt.title,
      })) || [];
   const availableTeams =
      teamsResponse?.data?.map((team) => ({
         id: String(team.id),
         name: team.name,
      })) || [];
   const availableRoles =
      rolesResponse?.data?.map((role) => ({
         id: String(role.id),
         title: role.name,
      })) || [];
   const availableManagers =
      managersListResponse?.data
         ?.filter((emp) => String(emp.id) !== String(id))
         .map((emp) => ({
            id: String(emp.id),
            name: emp.name || `${emp.email || ""}`,
            avatar: emp.avatar || undefined,
         })) || [];
   const { data: onboardingData } = useListOnboarding(undefined, {
      enabled: !!id,
   });
   const employees = employeesList?.data || [];
   const totalEmployees =
      employeeStats?.total ||
      employeesList?.pagination?.total ||
      employees.length ||
      1;

   const sortedEmployees = employees
      .map((employee) => ({
         ...employee,
         numericId: Number(employee.id),
      }))
      .filter((employee) => !Number.isNaN(employee.numericId))
      .sort((a, b) => a.numericId - b.numericId);

   // Get the actual status from the employees list
   const currentEmployee = sortedEmployees.find(
      (employee) => String(employee.id) === String(id),
   );

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

   const currentEmployeeIndex = sortedEmployees.findIndex(
      (employee) => String(employee.id) === String(id),
   );

   const currentNumericId = Number(id);
   let effectiveIndex = currentEmployeeIndex;

   if (effectiveIndex === -1 && !Number.isNaN(currentNumericId)) {
      const nextIndex = sortedEmployees.findIndex(
         (employee) => employee.numericId > currentNumericId,
      );
      if (nextIndex === -1 && sortedEmployees.length > 0) {
         effectiveIndex = sortedEmployees.length - 1;
      } else if (nextIndex > 0) {
         effectiveIndex = nextIndex - 1;
      } else if (nextIndex === 0) {
         effectiveIndex = 0;
      }
   }

   const currentEmployeePosition = effectiveIndex >= 0 ? effectiveIndex + 1 : 1;

   const isPrevDisabled = effectiveIndex <= 0;
   const isNextDisabled = effectiveIndex >= sortedEmployees.length - 1;

   const prevMemberId =
      effectiveIndex > 0 ? sortedEmployees[effectiveIndex - 1]?.id : undefined;
   const nextMemberId =
      effectiveIndex < sortedEmployees.length - 1
         ? sortedEmployees[effectiveIndex + 1]?.id
         : undefined;

   const buildProfilePath = (memberId: string | number) => {
      const query = searchParams.toString();
      return query
         ? `/dashboard/members/profile/${memberId}?${query}`
         : `/dashboard/members/profile/${memberId}`;
   };

   const handlePrevMember = () => {
      if (effectiveIndex > 0) {
         const target = sortedEmployees[effectiveIndex - 1];
         if (target) navigate(buildProfilePath(target.id));
      } else if (sortedEmployees.length > 0) {
         navigate(buildProfilePath(sortedEmployees[0].id));
      }
   };

   const handleNextMember = () => {
      if (effectiveIndex < sortedEmployees.length - 1) {
         const target = sortedEmployees[effectiveIndex + 1];
         if (target) navigate(buildProfilePath(target.id));
      } else if (sortedEmployees.length > 0) {
         navigate(
            buildProfilePath(sortedEmployees[sortedEmployees.length - 1].id),
         );
      }
   };

   // Track socket heartbeat timestamp for "last updated"
   useEffect(() => {
      const updateLastUpdatedFromSocket = () => {
         sendHeartbeat((response) => {
            if (response?.timestamp) {
               const formatted = new Intl.DateTimeFormat(
                  language === "ar" ? "ar" : undefined,
                  {
                     dateStyle: "medium",
                     timeStyle: "short",
                  },
               ).format(new Date(response.timestamp));
               setSocketLastUpdated(formatted);
            }
         });
      };

      updateLastUpdatedFromSocket();
      const cleanupConnect = onConnect(updateLastUpdatedFromSocket);

      return () => {
         cleanupConnect();
      };
   }, [language]);

   const memberName = employeeData
      ? `${employeeData.personal.first_name} ${employeeData.personal.last_name}`.trim()
      : undefined;

   // Read activeTabId from URL query parameter, default to "profile"
   const initialTabId = searchParams.get("activeTabId") || "profile";
   const [activeTabId, setActiveTabId] = useState<string>(initialTabId);

   // Permission override modal state
   const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
   const [isResetModalOpen, setIsResetModalOpen] = useState(false);

   // Reset permissions mutation
   const resetPermissionsMutation = useResetEmployeePermissions();
   const resendInviteMutation = useResendOnboardingInvite();
   const deactivateEmployeeMutation = useDeleteEmployee();

   const handleResetPermissions = () => {
      if (!id) return;
      resetPermissionsMutation.mutate(id, {
         onSuccess: () => {
            toast.success(t("permissions.resetSuccess"));
            setIsResetModalOpen(false);
         },
         onError: () => {
            toast.error(t("permissions.resetError"));
         },
      });
   };

   const handleResendInvite = () => {
      if (!id) return;
      setIsResendModalOpen(true);
   };

   const handleConfirmResendInvite = (onboardingId?: string) => {
      if (!onboardingId) {
         setIsResendModalOpen(false);
         return;
      }
      resendInviteMutation.mutate(onboardingId, {
         onSuccess: () => {
            toast.success(t("messages.invitationResent"));
            setIsResendModalOpen(false);
         },
         onError: () => {
            toast.error(t("messages.invitationResendFailed"));
         },
      });
   };

   const handleDeactivate = () => {
      if (!id) return;
      setIsDeactivateModalOpen(true);
   };

   const handleConfirmDeactivate = () => {
      if (!id) return;
      deactivateEmployeeMutation.mutate(id, {
         onSuccess: () => {
            toast.success(t("messages.deleteSuccess"));
            setIsDeactivateModalOpen(false);
            navigate("/dashboard/members");
         },
         onError: () => {
            toast.error("Failed to deactivate member. Please try again.");
         },
      });
   };

   // Update URL when tab changes
   const handleTabChange = (tabId: string) => {
      setActiveTabId(tabId);
      setSearchParams({ activeTabId: tabId });
   };

   const residencyData = {
      permits: employeeData?.residency_permits || [],
      supplementaryDocuments:
         employeeData?.supplementary_residency_documents || [],
   };
   const isResidencyLoading = isLoading;

   // Generate dynamic summary cards from API data
   const summaryCards = getDynamicSummaryCards(
      t,
      {
         attendanceTimeline,
         timeOffSummary,
         overtimeSummary,
         contract: canViewContractTab ? contractData : undefined,
         contractsList: canViewContractTab
            ? contractsListResponse?.data
            : undefined,
      },
      {
         onExtendDuration: () => setIsExtendModalOpen(true),
         canExtendContract,
      },
   ).filter((card) => {
      if (card.id === "contract") return canViewContractTab;
      return true;
   });

   // Get tabs with dynamic counts
   const documentsCount = documentsResponse?.data?.length || 0;
   const assetsCount = assetsResponse?.data?.length || 0;

   // Filter tabs based on permissions
   const allTabs = getTabs(t, { documentsCount, assetsCount });
   const tabs = allTabs.filter((tab) => {
      if (tab.id === "contract") return canViewContractTab;
      if (tab.id === "time")
         return (
            can("view_attendance_requests") ||
            can("view_vacation_requests") ||
            can("view_overtime_requests")
         );
      if (tab.id === "documents") return can("read_employee_documents");
      if (tab.id === "assets") return can("read_asset") || can("read_assets");
      if (tab.id === "payroll") return can("payroll.view_basic") && hasContract;
      if (tab.id === "residency") return !isFromUae;
      return true;
   });

   useEffect(() => {
      if (!tabs.some((tab) => tab.id === activeTabId)) {
         const fallbackTabId = tabs[0]?.id || "profile";
         setActiveTabId(fallbackTabId);
         setSearchParams({ activeTabId: fallbackTabId });
      }
   }, [activeTabId, tabs, setSearchParams]);

   // Build detail sections from API data
   const notProvidedLabel = t("fields.notProvided");
   const formatDateLabel = (date?: string | null) =>
      date ? new Date(date).toLocaleDateString("en-GB") : notProvidedLabel;
   const formatContractTypeLabel = (value?: string | null) => {
      if (!value) return undefined;
      return value
         .split(/[_\s]+/)
         .map((segment) =>
            segment ? `${segment[0].toUpperCase()}${segment.slice(1)}` : "",
         )
         .join(" ");
   };

   const birthDateValue = formatDateLabel(employeeData?.personal.birth_date);
   const ageValue =
      typeof employeeData?.personal.age === "number"
         ? String(employeeData.personal.age)
         : notProvidedLabel;
   const contractStartDateLabel = formatDateLabel(
      employeeData?.contract?.start_date,
   );
   const contractEndDateLabel = formatDateLabel(
      employeeData?.contract?.end_date,
   );

   const teamDisplayValue = (() => {
      if (!employeeData) return notProvidedLabel;
      if (employeeData.job.team_names?.length) {
         return employeeData.job.team_names.join(", ");
      }
      if (employeeData.job.teams?.length) {
         return employeeData.job.teams.map((team) => team.name).join(", ");
      }
      if (employeeData.job.team_ids.length > 0) {
         return employeeData.job.team_ids.join(", ");
      }
      return notProvidedLabel;
   })();

   const managerName = employeeData?.manager?.name || notProvidedLabel;
   const hasManager = Boolean(employeeData?.manager?.name);

   const getNamePrefix = (value?: string | null) =>
      value
         ? value
              .split(/\s+/)
              .filter(Boolean)
              .map((word) => word[0]?.toUpperCase())
              .join("")
         : "";

   const memberIdentifier =
      id && employeeData
         ? `${
              (
                 getNamePrefix(employeeData.job.role?.name) +
                 getNamePrefix(employeeData.job.job_title)
              ).trim() || "MEM"
           }-${id}`
         : notProvidedLabel;

   const memberSearchTerm =
      memberName ||
      employeeData?.personal.email ||
      employeeData?.personal.phone_number ||
      memberIdentifier;

   const detailSections = employeeData
      ? [
           {
              id: "personal",
              title: t("profile.details.personal.title"),
              items: [
                 {
                    label: t("fields.fullName"),
                    value: `${employeeData.personal.first_name} ${employeeData.personal.last_name}`,
                 },
                 {
                    label: t("fields.gender"),
                    value: employeeData.personal.gender
                       ? t(
                            `options.gender.${employeeData.personal.gender.toLowerCase()}`,
                         )
                       : notProvidedLabel,
                 },
                 {
                    label: t("fields.dob"),
                    value: birthDateValue,
                 },
                 {
                    label: t("fields.age"),
                    value: ageValue,
                 },
                 {
                    label: t("fields.nationality"),
                    value: employeeData.personal.country || notProvidedLabel,
                 },
                 // {
                 // 	label: t("fields.maritalStatus"),
                 // 	value: employeeData.personal.marital_status
                 // 		? t(
                 // 				`options.maritalStatus.${employeeData.personal.marital_status.toLowerCase()}`
                 // 		  )
                 // 		: notProvidedLabel,
                 // },
                 {
                    label: t("fields.location"),
                    value: employeeData.personal.country || notProvidedLabel,
                 },
              ],
           },
           ...(employeeData.contract
              ? [
                   {
                      id: "work",
                      title: t("profile.details.work.title"),
                      items: [
                         {
                            label: t("fields.jobTitle"),
                            value:
                               employeeData.job.job_title || notProvidedLabel,
                         },
                         {
                            label: t("fields.team"),
                            value: teamDisplayValue,
                         },
                         {
                            label: t("fields.manager"),
                            value: managerName,
                            badge: hasManager,
                         },
                         {
                            label: t("fields.role"),
                            value:
                               employeeData.job.role?.name || notProvidedLabel,
                         },
                         {
                            label: t("fields.permissions"),
                            value:
                               currentEmployee?.permission_status === "Override"
                                  ? t("permissions.override")
                                  : t("permissions.default"),
                            link: "#",
                            highlighted: true,
                            variant:
                               currentEmployee?.permission_status === "Override"
                                  ? "warningText"
                                  : "highlightedText",
                         },
                         {
                            label: t("fields.memberId"),
                            value: memberIdentifier,
                         },
                         {
                            label: t("fields.startDate"),
                            value: contractStartDateLabel,
                         },
                         {
                            label: t("fields.endDate"),
                            value: contractEndDateLabel,
                         },
                      ],
                   },
                ]
              : []),
           {
              id: "address",
              title: t("profile.details.address.title"),
              items: [
                 {
                    label: t("fields.address"),
                    value: employeeData.personal.address || notProvidedLabel,
                    link: employeeData.personal.address
                       ? `https://maps.google.com/?q=${encodeURIComponent(
                            employeeData.personal.address,
                         )}`
                       : undefined,
                    isExternalLink: !!employeeData.personal.address,
                 },
                 {
                    label: t("fields.country"),
                    value: employeeData.personal.country || notProvidedLabel,
                 },
              ],
           },
           {
              id: "contact",
              title: t("profile.details.contact.title"),
              items: [
                 {
                    label: t("fields.mobile"),
                    value:
                       employeeData.personal.phone_number || notProvidedLabel,
                    link: employeeData.personal.phone_number
                       ? `tel:${employeeData.personal.phone_number}`
                       : undefined,
                    highlighted: !!employeeData.personal.phone_number,
                    variant: "pill" as const,
                 },
                 {
                    label: t("fields.email"),
                    value: employeeData.personal.email || notProvidedLabel,
                    link: employeeData.personal.email
                       ? `mailto:${employeeData.personal.email}`
                       : undefined,
                    highlighted: !!employeeData.personal.email,
                    variant: "pill" as const,
                 },
              ],
           },
        ]
      : [];

   const compensationSections = employeeData
      ? [
           ...(employeeData.contract
              ? [
                   {
                      id: "compensation",
                      title: t("profile.details.compensation.title"),
                      items: [
                         {
                            label: t("fields.salary"),
                            value: employeeData.contract.salary ? (
                               <DirhamLabel
                                  value={employeeData.contract.salary}
                               />
                            ) : (
                               notProvidedLabel
                            ),
                         },
                         {
                            label: "Salary Cycle",
                            value: employeeData.contract.salary_cycle
                               ? employeeData.contract.salary_cycle
                                    .charAt(0)
                                    .toUpperCase() +
                                 employeeData.contract.salary_cycle.slice(1)
                               : notProvidedLabel,
                         },
                         {
                            label: t("fields.contractType"),
                            value:
                               formatContractTypeLabel(
                                  employeeData.contract.contract_type,
                               ) ||
                               formatContractTypeLabel(
                                  employeeData.contract.employment_type,
                               ) ||
                               notProvidedLabel,
                         },
                         {
                            label: "Contract Name",
                            value:
                               employeeData.contract.contract_name ||
                               notProvidedLabel,
                         },
                         {
                            label: "Overtime Hourly Rate",
                            value: employeeData.contract
                               .overtime_hourly_rate ? (
                               <DirhamLabel
                                  value={
                                     employeeData.contract.overtime_hourly_rate
                                  }
                               />
                            ) : (
                               notProvidedLabel
                            ),
                         },
                         {
                            label: "Probation Period",
                            value: employeeData.contract.probation_period
                               ? `${employeeData.contract.probation_period} Days`
                               : "No Probation",
                         },
                      ],
                   },
                ]
              : []),
        ]
      : [];

   const handleSendMessage = () => {
      if (memberSearchTerm) {
         navigate("/dashboard/messages", {
            state: { searchQuery: memberSearchTerm },
         });
         return;
      }
      navigate("/dashboard/messages");
   };

   // Prefetch neighbor profiles to reduce loading between navigation steps
   useEffect(() => {
      const neighborIds = [prevMemberId, nextMemberId].filter(Boolean);
      neighborIds.forEach((neighborId) => {
         // Convert to string to match useGetEmployeeDetails query key
         const idStr = String(neighborId);
         queryClient.prefetchQuery({
            queryKey: [...reactQueryKeys.employees.detail(idStr), "details"],
            queryFn: () => employeeService.getByIdDetails(idStr),
            staleTime: 1000 * 60 * 5, // 5 minutes - prevents refetching if data is fresh
         });
      });
   }, [prevMemberId, nextMemberId, queryClient]);

   const breadcrumbTitle = (
      <MemberBreadcrumb
         membersLink="/dashboard/members"
         memberName={memberName}
      />
   );

   // Show loading state
   if (isLoading) {
      return (
         <LoadingState size="large" label={t("loading.profile")} fullHeight />
      );
   }

   // Show error state
   if (error) {
      return (
         <div className="text-center">
            <p className="text-danger mb-4">{t("error")}</p>
            <button
               onClick={() => navigate("/dashboard/members")}
               className="px-4 py-2 bg-primary text-text-main rounded-lg hover:bg-primary/90 transition-colors">
               {t("backToMembers")}
            </button>
         </div>
      );
   }

   // Show not found state
   if (!employeeData) {
      return (
         <div className="text-center">
            <p className="text-text-sub mb-4">{t("memberNotFound")}</p>
            <button
               onClick={() => navigate("/dashboard/members")}
               className="px-4 py-2 bg-primary text-text-main rounded-lg hover:bg-primary/90 transition-colors">
               {t("backToMembers")}
            </button>
         </div>
      );
   }

   // Use API data directly - React Query handles caching
   const memberDetails: ProfileMember = {
      name: memberName || notProvidedLabel,
      title: employeeData.job.job_title || notProvidedLabel,
      team: teamDisplayValue,
      memberId: memberIdentifier,
      avatar:
         employeeData.personal.profile_picture_url || "/icons/defAvatar.png",
      permissionLabel:
         currentEmployee?.permission_status === "Override"
            ? t("permissions.override")
            : t("permissions.default"),
      roleLabel: employeeData.job.role?.name || notProvidedLabel,
   };

   const employeeStatus = currentEmployee?.status || "Active";
   const currentOnboardingId = id
      ? onboardingByEmployeeId.get(Number(id))?.onboarding_id
      : undefined;
   const { label: statusLabel, variant: statusVariant } = getMemberStatusMeta(
      employeeStatus,
      t,
   );
   const canResendInvite =
      employeeStatus === "Invited" && Boolean(currentOnboardingId);
   const canDeactivateMember =
      employeeStatus === "Active" && can("deactivate_employee");

   return (
      <>
         <div className="flex flex-col r-gap xl:gap-6">
            {breadcrumbTitle}
            {/* Member's Data Section */}
            <div className="flex flex-col r-gap xl:gap-6">
               <ProfileHeroCard
                  member={memberDetails}
                  statusLabel={statusLabel}
                  statusVariant={statusVariant}
                  currentPage={currentEmployeePosition}
                  totalPages={totalEmployees}
                  onSendMessage={handleSendMessage}
                  onPrev={handlePrevMember}
                  onNext={handleNextMember}
                  isPrevDisabled={isPrevDisabled}
                  isNextDisabled={isNextDisabled}
                  lastUpdated={socketLastUpdated}
                  onBack={() => navigate("/dashboard/members")}
                  onOverridePermissions={
                     canGrantPermission
                        ? () => setIsPermissionModalOpen(true)
                        : undefined
                  }
                  onResetPermissions={
                     canGrantPermission
                        ? () => setIsResetModalOpen(true)
                        : undefined
                  }
                  onResendInvite={
                     canResendInvite ? handleResendInvite : undefined
                  }
                  onDeactivate={
                     canDeactivateMember ? handleDeactivate : undefined
                  }
               />
               <SummaryCardsSection cards={summaryCards} />
            </div>

            {/* Container Section */}
            <div className="flex flex-col flex-1 r-gap xl:gap-6">
               <ProfileTabs
                  tabs={tabs}
                  activeTabId={activeTabId}
                  onTabChange={handleTabChange}
               />

               {/* Animated Tab Content */}
               <div className="relative w-full min-w-full">
                  <AnimatePresence mode="popLayout">
                     {activeTabId === "profile" && (
                        <motion.div
                           key="profile"
                           className="w-full min-w-full"
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -20 }}
                           transition={{ duration: 0.3, ease: "easeInOut" }}>
                           <ProfileInfoTab
                              detailSections={detailSections}
                              compensationSections={compensationSections}
                              canEdit={canEditProfile}
                              employeeId={id}
                              employeeData={employeeData}
                              availableJobTitles={availableJobTitles}
                              availableTeams={availableTeams}
                              availableRoles={availableRoles}
                              availableManagers={availableManagers}
                           />
                        </motion.div>
                     )}
                     {activeTabId === "contract" && (
                        <motion.div
                           key="contract"
                           className="w-full min-w-full"
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -20 }}
                           transition={{ duration: 0.3, ease: "easeInOut" }}>
                           <ContractTab
                              hasContract={employeeData?.hasContract}
                              workInfoSection={
                                 detailSections.find((s) => s.id === "work")!
                              }
                              contractInfo={employeeData.contract}
                              canEdit={canEditProfile}
                              employeeData={employeeData}
                              availableJobTitles={availableJobTitles}
                              availableTeams={availableTeams}
                              availableRoles={availableRoles}
                              availableManagers={availableManagers}
                           />
                        </motion.div>
                     )}
                    {activeTabId === "time" && (
                       <motion.div
                          key="time"
                          className="w-full min-w-full"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}>
                           <TimeManagementTab
                              employeeId={id || ""}
                              canViewShift={canViewShiftTab}
                           />
                        </motion.div>
                     )}
                     {activeTabId === "documents" && (
                        <motion.div
                           key="documents"
                           className="w-full min-w-full"
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -20 }}
                           transition={{ duration: 0.3, ease: "easeInOut" }}>
                           <DocumentsTab
                              title={t("profile.tabs.documents")}
                              employeeId={id || ""}
                           />
                        </motion.div>
                     )}
                     {activeTabId === "assets" && (
                        <motion.div
                           key="assets"
                           className="w-full min-w-full"
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -20 }}
                           transition={{ duration: 0.3, ease: "easeInOut" }}>
                           <AssetsTab
                              employeeId={id || ""}
                              title={t("profile.tabs.assets")}
                           />
                        </motion.div>
                     )}
                     {activeTabId === "payroll" && hasContract && (
                        <motion.div
                           key="payroll"
                           className="w-full min-w-full"
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -20 }}
                           transition={{ duration: 0.3, ease: "easeInOut" }}>
                           <PayrollsTab employeeId={id || ""} />
                        </motion.div>
                     )}
                     {activeTabId === "residency" && !isFromUae && (
                        <motion.div
                           key="residency"
                           className="w-full min-w-full"
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -20 }}
                           transition={{ duration: 0.3, ease: "easeInOut" }}>
                           <ResidencyTab
                              residencyData={residencyData || null}
                              isLoading={isResidencyLoading}
                              employeeId={id}
                              canEdit={canEditProfile}
                           />
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            </div>
         </div>

         {canExtendContract && (
            <ExtendContractModal
               isOpen={isExtendModalOpen}
               onClose={() => setIsExtendModalOpen(false)}
               currentEndDate={contractData?.duration?.end_date}
            />
         )}

         {/* Permission Override Modal */}
         {id && memberName && (
            <PermissionOverrideModal
               isOpen={isPermissionModalOpen}
               onClose={() => setIsPermissionModalOpen(false)}
               employeeId={id}
               employeeName={memberName}
            />
         )}

         {/* Reset Permissions Confirmation Modal */}
         <ConfirmModal
            isOpen={isResetModalOpen}
            onClose={() => setIsResetModalOpen(false)}
            onConfirm={handleResetPermissions}
            title={t("modals.resetPermissions.title")}
            description={t("modals.resetPermissions.description")}
            confirmText={t("modals.resetPermissions.confirmButton")}
            cancelText={t("modals.resetPermissions.cancelButton")}
            variant="primary"
            icon="info"
            isLoading={resetPermissionsMutation.isPending}
         />

         <ConfirmModal
            isOpen={isResendModalOpen}
            onClose={() => setIsResendModalOpen(false)}
            onConfirm={() => handleConfirmResendInvite(currentOnboardingId)}
            title={t("modals.resendInvitation.title")}
            description={t("modals.resendInvitation.description", {
               name: memberName || "",
            })}
            confirmText={t("modals.resendInvitation.confirmButton")}
            cancelText={t("modals.resendInvitation.cancelButton")}
            variant="primary"
            icon="info"
            isLoading={resendInviteMutation.isPending}
         />

         <ConfirmModal
            isOpen={isDeactivateModalOpen}
            onClose={() => setIsDeactivateModalOpen(false)}
            onConfirm={handleConfirmDeactivate}
            title={t("modals.deleteMember.title")}
            description={t("modals.deleteMember.description")}
            confirmText={t("modals.deleteMember.confirmButton")}
            cancelText={t("modals.deleteMember.cancelButton")}
            variant="error"
            icon="exclamation"
            isLoading={deactivateEmployeeMutation.isPending}
         />

         {/* Edit Member Wizard Modal */}
         {id && (
            <Modal
               isOpen={isEditProfileModalOpen}
               onClose={() => setIsEditProfileModalOpen(false)}
               title={t("editMember")}
               size="large"
               showCloseButton={true}>
               <EditMemberWizard
                  employeeId={id}
                  employeeData={employeeData}
                  basicEmployeeData={basicEmployeeData || null}
                  onClose={() => setIsEditProfileModalOpen(false)}
                  onComplete={() => {
                     setIsEditProfileModalOpen(false);
                     // Profile data will be refreshed automatically via React Query invalidation
                  }}
                  availableJobTitles={availableJobTitles}
                  availableTeams={availableTeams}
                  availableRoles={availableRoles}
                  availableManagers={availableManagers}
               />
            </Modal>
         )}
      </>
   );
}

export default MemberProfile;
