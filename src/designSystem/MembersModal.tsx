/** @format */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CloseLine, Search2Line } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import { useGetRoleMembers } from "@/hooks/roles/role.queries";
import { useListEmployees } from "@/hooks/employees/employee.queries";
import LoadingState from "@/designSystem/LoadingState";

type Member = {
	id: number;
	name: string;
	email: string;
	avatar?: string | null;
	job_title?: string | null;
	contact?: string | null;
	joined_at?: string;
	permission_status?: string;
	status?: string;
};

type MembersModalProps = {
	onClose: () => void;
	entityId?: number | string;
	entityName?: string;
	entityType?: "role" | "jobTitle" | "team";
};

type AvatarProps = {
	image: string;
	className?: string;
};

function Avatar({ image, className = "" }: AvatarProps) {
	return (
		<div className={`relative rounded-full w-5 h-5 shrink-0 ${className}`}>
			<img
				src={image}
				alt='avatar'
				className='absolute inset-0 w-full h-full object-cover rounded-full'
			/>
		</div>
	);
}

function MemberRow({
	member,
	onViewDetails,
}: {
	member: Member;
	onViewDetails: (memberId: number) => void;
}) {
	const { t } = useTranslation("common");

	return (
		<div className='group flex items-center gap-2 p-2 rounded-lg border border-transparent bg-background transition-colors hover:bg-bg-weak'>
			<Avatar image={member.avatar || "/icons/defAvatar.png"} />
			<div className='flex-1 flex flex-col gap-0.5 min-w-0'>
				<span className='font-medium text-text-strong truncate'>
					{member.name}
				</span>
				<span className='text-xs text-text-soft truncate'>{member.email}</span>
			</div>
			<button
				onClick={() => onViewDetails(member.id)}
				className='text-primary font-medium hover:underline opacity-0 transition-opacity group-hover:opacity-100 shrink-0'>
				{t("actions.viewDetails")}
			</button>
		</div>
	);
}

export default function MembersModal({
	onClose,
	entityId,
	entityName,
	entityType = "role",
}: MembersModalProps) {
	const { t } = useTranslation("common");
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const isRole = entityType === "role";
	const isTeam = entityType === "team";
	const isJobTitle = entityType === "jobTitle";
	const teamId = isTeam && entityId ? Number(entityId) : undefined;
	const normalizedTitle = entityName?.toLowerCase().trim() || "";

	const handleViewDetails = (memberId: number) => {
		navigate(`/dashboard/members/profile/${memberId}`);
		onClose(); // Close the modal when navigating
	};

	// Fetch members for the role
	const {
		data: membersData,
		isLoading,
		error,
	} = useGetRoleMembers(entityId || 0, undefined, {
		enabled: isRole && !!entityId,
	});

	const {
		data: employeesData,
		isLoading: isEmployeesLoading,
		error: employeesError,
	} = useListEmployees(
		teamId && Number.isFinite(teamId)
			? { page: 1, limit: 100, team_id: teamId }
			: isJobTitle
			? { page: 1, limit: 100 }
			: { page: 1, limit: 100 },
		{ enabled: !isRole && (!!teamId || isJobTitle) }
	);

	// Filter members based on search query
	const filteredMembers = useMemo(() => {
		if (isRole) {
			if (!membersData?.data) return [];
			if (!searchQuery.trim()) return membersData.data;

			const query = searchQuery.toLowerCase();
			return membersData.data.filter(
				(member) =>
					member.name.toLowerCase().includes(query) ||
					member.email.toLowerCase().includes(query) ||
					(member.job_title && member.job_title.toLowerCase().includes(query))
			);
		}

		const employees = employeesData?.data || [];
		const baseMembers = isJobTitle
			? normalizedTitle
				? employees.filter(
						(member) =>
							member.job_title?.toLowerCase().trim() === normalizedTitle
				  )
				: []
			: employees;

		if (!searchQuery.trim()) return baseMembers;
		const query = searchQuery.toLowerCase();
		return baseMembers.filter(
			(member) =>
				member.name.toLowerCase().includes(query) ||
				member.email.toLowerCase().includes(query) ||
				(member.job_title && member.job_title.toLowerCase().includes(query))
		);
	}, [employeesData?.data, isJobTitle, isRole, membersData?.data, searchQuery, normalizedTitle]);

	const members = filteredMembers || [];
	const displayTitle = entityName
		? `${entityName} - ${t("nav.members")}`
		: t("nav.members");
	const isMembersLoading = isRole ? isLoading : isEmployeesLoading;
	const membersError = isRole ? error : employeesError;

	return (
		<div className='bg-background border border-border rounded-3xl w-[440px] max-w-full shadow-[0px_4px_32px_rgba(23,25,32,0.08)]'>
			<div className='border-b border-border px-5 py-4 flex items-center justify-between'>
				<span className='font-medium text-text-strong'>{displayTitle}</span>
				<button
					aria-label={t("aria.close")}
					className='p-1 rounded-sm hover:bg-bg-weak'
					onClick={onClose}>
					<CloseLine size={18} />
				</button>
			</div>

			<div className='p-4 flex flex-col gap-3'>
				<div className='border border-border rounded-xl px-3 py-2 flex items-center gap-2 bg-background'>
					<Search2Line size={18} />
					<input
						type='text'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder={t("memberPicker.searchPlaceholder")}
						className='flex-1 bg-transparent border-none outline-none text-text-soft placeholder:text-text-soft'
					/>
				</div>

				<div className='flex flex-col gap-1 max-h-[400px] overflow-y-auto'>
					{isMembersLoading ? (
						<LoadingState size="medium" label={t("common:loading.general")} />
					) : membersError ? (
						<div className='flex items-center justify-center py-8'>
							<span className='text-danger'>
								{t("common.error") || "Error loading members"}
							</span>
						</div>
					) : members.length === 0 ? (
						<div className='flex items-center justify-center py-8'>
							<span className='text-text-sub'>
								{searchQuery ? "No members found" : "No members"}
							</span>
						</div>
					) : (
						members.map((member) => (
							<MemberRow
								key={member.id}
								member={member}
								onViewDetails={handleViewDetails}
							/>
						))
					)}
				</div>
			</div>

			<div className='border-t border-border px-5 py-4 flex justify-end'>
				<button
					className='bg-primary text-text-main rounded-xl px-3 py-2 font-medium cursor-pointer'
					onClick={onClose}>
					{t("actions.done")}
				</button>
			</div>
		</div>
	);
}
