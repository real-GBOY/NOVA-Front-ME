/** @format */

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/designSystem/ui/data-table";
import { useTranslation } from "@/hooks/useTranslation";
import Checkbox from "@/designSystem/Checkbox";
import StatusTag from "@/designSystem/StatusTag";
import Dropdown, { DropdownItem } from "@/designSystem/Dropdown";
import AgentsFloatingActionBar from "./AgentsFloatingActionBar";
import AddAgentModal from "../modals/AddAgentModal";
import DeleteAgentModal from "../modals/DeleteAgentModal";
import { MoreVertical, Edit, Trash } from "@/Icons";
import {
	useDeleteAgent,
	useUpdateAgent,
	useCreateAgent,
	useListAgents,
} from "@/hooks/agents/useAgents";
import type { Agent } from "../types";
import type { CreateAgentRequest, UpdateAgentRequest } from "@/services/agentService";
import { PaginationState, Updater } from "@tanstack/react-table";
import toast from "@/utilities/toast";
import { StatusFilters } from "../../../shared/StatusFilterDropdown";
import LoadingState from "@/designSystem/LoadingState";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";

const getBackendErrorCode = (error: unknown): string | undefined => {
	if (typeof error === "object" && error !== null) {
		const err = error as {
			response?: { data?: { error?: string; code?: string } };
			error?: string;
			code?: string;
		};
		if (err.response?.data?.error) return err.response.data.error;
		if (err.response?.data?.code) return err.response.data.code;
		if (err.error) return err.error;
		if (err.code) return err.code;
	}
	return undefined;
};

const getAgentInvoiceCount = (agent?: Agent | null) => {
	if (!agent) return 0;
	const legacyCreated = (agent as unknown as { invoicesCreated?: number }).invoicesCreated;
	const invoicesCount = (agent as unknown as { invoices_count?: number }).invoices_count;
	return agent.invoices_created ?? invoicesCount ?? legacyCreated ?? 0;
};

interface AgentsTabProps {
	searchQuery: string;
	filters: StatusFilters;
	sortBy: string;
}

// Actions Cell Component
function ActionsCell({
	agent,
	onDelete,
	onEdit,
	canEdit,
	canDelete,
}: {
	agent: Agent;
	onDelete: (agent: Agent) => void;
	onEdit?: (agent: Agent) => void;
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
						label: t("invoiceProfiles.actions.edit"),
						icon: Edit,
						onClick: () => {
							onEdit?.(agent);
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
						label: t("invoiceProfiles.actions.delete"),
						icon: Trash,
						onClick: () => {
							onDelete(agent);
							setIsOpen(false);
						},
						variant: "danger" as const,
					},
			  ]
			: []),
	];

	if (dropdownItems.length === 0) return null;

	return (
		<>
			<button
				ref={buttonRef}
				type='button'
				aria-label={t("invoiceProfiles.actions.label")}
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
		</>
	);
}

function AgentsTab({ searchQuery, filters, sortBy }: AgentsTabProps) {
	const { t } = useTranslation("settings");
	const { can } = usePermissions();
	const canViewAgents = can("view_agents");
	const canUpdateAgent = can("update_agent");
	const canDeleteAgent = can("delete_agent");
	// Modal and Action States
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [agentsToDelete, setAgentsToDelete] = useState<Agent[]>([]);
	const [selectionResetSignal, setSelectionResetSignal] = useState(0);
	const [deleteModalState, setDeleteModalState] =
		useState<"idle" | "loading" | "success">("idle");

	// Pagination state
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(12);

	// Delete mutation
	const deleteAgent = useDeleteAgent();

	// Update mutation
	const updateAgent = useUpdateAgent();

	// Create mutation (for when modal is opened from tab)
	const createAgent = useCreateAgent();

	// Map sort options to backend format
	const sortConfig: Record<string, { field: string; order: "asc" | "desc" }> =
		{
			nameAsc: { field: "name", order: "asc" },
			nameDesc: { field: "name", order: "desc" },
			newest: { field: "created_at", order: "desc" },
			oldest: { field: "created_at", order: "asc" },
		};
	const { field: sortField, order: sortDirection } =
		sortConfig[sortBy] || sortConfig.newest;
	const selectedStatus = filters.status[0];
	const normalizedStatus = selectedStatus
		? selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)
		: undefined;

	// Reset page when filters or search change
	useEffect(() => {
		setPage(1);
	}, [searchQuery, filters.status, sortBy]);

	// Fetch agents with server-side pagination, search, filtering, and sorting
	const { data: agentsResponse, isLoading, error } = useListAgents(
		{
			page,
			limit: pageSize,
			search: searchQuery || undefined,
			status: normalizedStatus,
			sort_by: sortField,
			sort_order: sortDirection,
		},
		{ enabled: canViewAgents }
	);

	const agents = agentsResponse?.data || [];

	const totalPages = agentsResponse?.pagination?.total_pages || 1;

	// Pagination handler
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

	// Bulk actions handlers (must be before early return)
	const handleBulkDelete = useCallback((rows: Agent[]) => {
		setAgentsToDelete(rows);
		setIsDeleteModalOpen(true);
	}, []);

	const handleEditAgent = useCallback((agent: Agent) => {
		if (!canUpdateAgent) return;
		setSelectedAgent(agent);
		setIsModalOpen(true);
	}, [canUpdateAgent]);

	const handleDeleteAgent = useCallback(
		(agent: Agent) => {
			if (getAgentInvoiceCount(agent) > 0) {
				toast.error(t("invoiceProfiles.dependency.agentHasInvoices"));
				return;
			}
			setAgentsToDelete([agent]);
			setIsDeleteModalOpen(true);
		},
		[t]
	);

	const confirmDelete = useCallback(async () => {
		if (agentsToDelete.length === 0) return;
		setDeleteModalState("loading");

		try {
			await Promise.all(
				agentsToDelete.map((agent) =>
					deleteAgent.mutateAsync(agent.agent_id || agent.id!)
				)
			);

			const message =
				agentsToDelete.length > 1
					? t("invoiceProfiles.toast.agents.deleteMultipleSuccess", {
							count: agentsToDelete.length,
					  })
					: t("invoiceProfiles.toast.agents.deleteSuccess", {
							name: agentsToDelete[0].name || "",
					  });

			toast.success(message);
			setSelectionResetSignal((prev) => prev + 1);
			setDeleteModalState("success");
			setTimeout(() => {
				setIsDeleteModalOpen(false);
				setAgentsToDelete([]);
				setDeleteModalState("idle");
			}, 600);
		} catch (error) {
			let errorMessage = t("invoiceProfiles.toast.agents.deleteError");
			const backendError = getBackendErrorCode(error);
			if (backendError === "AGENT_HAS_INVOICES") {
				errorMessage = t("invoiceProfiles.dependency.agentHasInvoices");
			} else if (
				error &&
				typeof error === "object" &&
				"message" in error &&
				typeof (error as { message?: string }).message === "string"
			) {
				errorMessage =
					(error as { message?: string }).message ||
					errorMessage;
			}
			toast.error(errorMessage);
			setIsDeleteModalOpen(false);
			setAgentsToDelete([]);
			setDeleteModalState("idle");
		}
	}, [agentsToDelete, deleteAgent, t]);

	// Floating action bar
	const renderFloatingBar = useCallback(
		(selectedCount: number, selectedRows: Agent[]) => (
			<AgentsFloatingActionBar
				selectedCount={selectedCount}
				selectedRows={selectedRows}
				onDelete={handleBulkDelete}
				onEdit={handleEditAgent}
				canEdit={canUpdateAgent}
				canDelete={canDeleteAgent}
				resetSignal={selectionResetSignal}
			/>
		),
		[handleBulkDelete, handleEditAgent, selectionResetSignal, canUpdateAgent, canDeleteAgent]
	);

	const columns: ColumnDef<Agent>[] = useMemo(
		() => [
			// Selection checkbox column
			...(canDeleteAgent
				? [
						{
							id: "select",
							header: ({ table }: { table: { getIsAllPageRowsSelected: () => boolean; toggleAllPageRowsSelected: (value: boolean) => void } }) => (
								<div className='[&>div]:gap-0'>
									<Checkbox
										checked={table.getIsAllPageRowsSelected()}
										onChange={(e) =>
											table.toggleAllPageRowsSelected(e.target.checked)
										}
										className='m-0 mb-0.5 me-0.5'
									/>
								</div>
							),
							cell: ({ row }: { row: { original: Agent; getIsSelected: () => boolean; toggleSelected: (value: boolean) => void } }) => {
								const invoiceCount = getAgentInvoiceCount(row.original);
								const hasDependencies = invoiceCount > 0;
								const dependenciesText = `${invoiceCount} ${
									invoiceCount === 1
										? t("invoiceProfiles.dependency.invoice")
										: t("invoiceProfiles.dependency.invoices")
								}`;
								return (
									<div
										className='[&>div]:gap-0'
										title={
											hasDependencies
												? `${t("invoiceProfiles.dependency.cannotDelete")}: ${dependenciesText}`
												: undefined
										}>
										<Checkbox
											checked={row.getIsSelected()}
											onChange={(e) => row.toggleSelected(e.target.checked)}
											className='m-0 me-0.5'
										/>
									</div>
								);
							},
								size: 40,
						},
				  ]
				: []),
			// Agent Name column
			{
				accessorKey: "name",
				header: () => (
					<span className='text-sm text-text-strong'>
						{t("invoiceProfiles.table.agentName")}
					</span>
				),
				cell: ({ getValue }) => (
					<p className='text-sm text-text-strong'>{getValue() as string}</p>
				),
				size: 200,

			},
			// Agent Code column
			{
				accessorKey: "agent_code",
				header: () => (
					<span className='text-sm text-text-strong'>
						{t("invoiceProfiles.table.agentCode")}
					</span>
				),
				cell: ({ getValue }) => (
					<p className='text-sm text-text-strong'>{getValue() as string}</p>
				),
				size: 150,

			},
			// Contact Number column
			{
				accessorKey: "contact_number",
				header: () => (
					<span className='text-sm text-text-strong'>
						{t("invoiceProfiles.table.contactNumber")}
					</span>
				),
				cell: ({ row }) => {
					const contactNumber =
						row.original.contact_number || row.original.contactNumber || "";
					return contactNumber ? (
						<a
							href={`tel:${contactNumber}`}
							className='text-sm text-primary underline hover:opacity-80'>
							{contactNumber}
						</a>
					) : (
						<span className='text-sm text-text-sub'>-</span>
					);
				},
				size: 180,

			},
			// Email column
			{
				accessorKey: "email",
				header: () => (
					<span className='text-sm text-text-strong'>
						{t("invoiceProfiles.table.email")}
					</span>
				),
				cell: ({ getValue }) => {
					const email = getValue<string>() || "";
					return email ? (
						<a
							href={`mailto:${email}`}
							className='text-sm text-primary underline hover:opacity-80'>
							{email}
						</a>
					) : (
						<span className='text-sm text-text-sub'>-</span>
					);
				},
				size: 220,

			},
			// Status column
			{
				accessorKey: "status",
				header: () => (
					<span className='text-sm text-text-strong'>
						{t("invoiceProfiles.table.status")}
					</span>
				),
				cell: ({ getValue }) => {
					const status = getValue() as "Active" | "Inactive";
					const statusLower = status.toLowerCase() as "active" | "inactive";
					return (
						<StatusTag
							label={t(`invoiceProfiles.status.${statusLower}`)}
							variant={statusLower}
							className='border-border border flex items-center justify-center ps-1! pe-2! py-0.5!'
						/>
					);
				},
				size: 150,

			},
			// Actions column
			...(canUpdateAgent || canDeleteAgent
				? [
						{
							id: "actions",
							header: () => <div />,
							cell: ({ row }: { row: { original: Agent } }) => (
								<ActionsCell
									agent={row.original}
									onDelete={handleDeleteAgent}
									onEdit={handleEditAgent}
									canEdit={canUpdateAgent}
									canDelete={canDeleteAgent}
								/>
							),
							size: 64,
						},
				  ]
				: []),
		],
		[handleDeleteAgent, handleEditAgent, t, canUpdateAgent, canDeleteAgent]
	);

	// Show loader while fetching data (after all hooks)
	if (!canViewAgents) {
		return (
			<div className="p-6">
				<NoPermissionMessage
					message={`You don't have permission to view agents. Missing: ${formatPermissionName("view_agents")}`}
				/>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="w-full">
				<LoadingState size="medium" label={t("invoiceProfiles.agents.loading")} />
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='flex flex-col items-center gap-2'>
					<span className='text-error'>
						Error loading agents. Please try again.
					</span>
					{process.env.NODE_ENV === "development" && (
						<span className='text-xs text-text-sub'>
							{error instanceof Error ? error.message : String(error)}
						</span>
					)}
				</div>
			</div>
		);
	}

	return (
		<>
			<DataTable
				columns={columns}
				data={agents as Agent[]}
				enableRowSelection={canDeleteAgent}
				showPagination={true}
				pageSize={pageSize}
				pageCount={totalPages}
				pagination={{ pageIndex: page - 1, pageSize }}
				onPaginationChange={handlePaginationChange}
				manualPagination={true}
				translationNamespace='settings'
				renderFloatingBar={canDeleteAgent ? renderFloatingBar : undefined}
				resetSelectionSignal={selectionResetSignal}
			/>
			{canUpdateAgent && (
				<AddAgentModal
					isOpen={isModalOpen}
					onClose={() => {
						setIsModalOpen(false);
						setSelectedAgent(null);
					}}
					agent={selectedAgent}
					isLoading={
						selectedAgent ? updateAgent.isPending : createAgent.isPending
					}
					onSuccess={async (agentData) => {
						try {
							const statusValue = String(agentData.status || "").toLowerCase();
							const displayName =
								agentData.name ||
								selectedAgent?.name ||
								t("invoiceProfiles.table.agentName");

							if (selectedAgent) {
								// Update existing agent
								const agentId =
									selectedAgent.agent_id || selectedAgent.id;
								if (agentId) {
									const payload: UpdateAgentRequest = {
										name: agentData.name || undefined,
										contact_number: agentData.contactNumber || undefined,
										email: agentData.email || undefined,
										address: agentData.address || undefined,
										notes: agentData.notes || undefined,
										status: statusValue === "active" ? "Active" : "Inactive",
									};
									await updateAgent.mutateAsync({
										id: agentId,
										payload,
									});
									toast.success(
										t("invoiceProfiles.toast.agents.updateSuccess", {
											name: displayName,
										})
									);
								}
							} else {
								// Create new agent (shouldn't happen from tab, but handle it)
								const payload: CreateAgentRequest = {
									name: agentData.name || "",
									number: agentData.number || "",
									contact_number: agentData.contactNumber || "",
									email: agentData.email || "",
									address: agentData.address || undefined,
									notes: agentData.notes || undefined,
									status: statusValue === "active" ? "Active" : "Inactive",
								};
								await createAgent.mutateAsync(payload);
								toast.success(
									t("invoiceProfiles.toast.agents.createSuccess", {
										name: displayName,
									})
								);
							}
							setIsModalOpen(false);
							setSelectedAgent(null);
						} catch (error) {
							console.error("Error saving agent:", error);
							toast.error(t("invoiceProfiles.toast.agents.saveError"));
						}
					}}
				/>
			)}
			{canDeleteAgent && (
				<DeleteAgentModal
					isOpen={isDeleteModalOpen}
					onClose={() => {
						if (deleteModalState === "loading") return;
						setIsDeleteModalOpen(false);
						setAgentsToDelete([]);
						setDeleteModalState("idle");
					}}
					onConfirm={confirmDelete}
					count={agentsToDelete.length}
					isLoading={deleteModalState === "loading"}
					isSuccess={deleteModalState === "success"}
				/>
			)}
		</>
	);
}

export default AgentsTab;
