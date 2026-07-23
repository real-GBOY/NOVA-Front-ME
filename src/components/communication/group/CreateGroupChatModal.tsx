/** @format */

import { useState, useMemo } from "react";
import { Search2Line, AddLine, CloseLine, Xmark } from "@/Icons";
import { getChatUsers } from "@/services/chat/chatService";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserId } from "@/utils/auth";

interface Member {
	id: string;
	name: string;
	jobTitle: string;
	avatar?: string;
	isCurrentUser?: boolean;
}

interface CreateGroupChatModalProps {
	isOpen: boolean;
	onClose: () => void;
	onNext?: (selectedMembers: Member[]) => void;
}

function CreateGroupChatModal({
	isOpen,
	onClose,
	onNext,
}: CreateGroupChatModalProps) {
	const currentUserId = getCurrentUserId();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);

	// Fetch users from backend
	const { data: usersData, isLoading } = useQuery({
		queryKey: ["chat", "users", searchQuery],
		queryFn: () => getChatUsers(searchQuery || undefined),
		enabled: isOpen,
	});

	// Transform API users to Member format
	const members = useMemo<Member[]>(() => {
		if (!usersData?.data) return [];
		return usersData.data.map((user) => ({
			id: user.employee_id.toString(),
			name: user.full_name || `${user.first_name} ${user.last_name}`,
			jobTitle: user.job_title || "",
			avatar: user.profile_picture_url || undefined,
			isCurrentUser: user.employee_id === currentUserId,
		}));
	}, [usersData, currentUserId]);

	// Filter members based on search query and exclude already selected members
	const filteredMembers = useMemo<Member[]>(() => {
		const selectedIds = new Set(selectedMembers.map((m) => m.id));
		return members.filter((member) => !selectedIds.has(member.id));
	}, [members, selectedMembers]);

	const handleRemoveSelected = (memberId: string) => {
		setSelectedMembers(selectedMembers.filter((m) => m.id !== memberId));
	};

	const handleAddMember = (member: Member) => {
		// Check if member is already selected
		if (!selectedMembers.find((m) => m.id === member.id)) {
			setSelectedMembers([...selectedMembers, member]);
		}
	};

	const handleAddFromSearch = () => {
		// Add the first filtered member if available
		if (filteredMembers.length > 0) {
			handleAddMember(filteredMembers[0]);
			setSearchQuery("");
		}
	};

	if (!isOpen) return null;

	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-sm'
			onClick={onClose}>
			<div
				className='flex flex-col items-start p-0 w-[440px] h-[432px] bg-background border border-border rounded-[24px] shadow-[0px_16px_32px_-12px_rgba(14,18,27,0.1)] overflow-hidden'
				onClick={(e) => e.stopPropagation()}>
				{/* Modal Header */}
				<div className='flex flex-row items-center pl-5 pr-4 py-4 gap-3 w-full h-[52px] bg-background border-b border-border relative rounded-t-[24px]'>
					<h2 className='text-sm font-medium text-text-strong leading-5 tracking-[-0.006em] flex-1'>
						Create a group chat
					</h2>
					<button
						onClick={onClose}
						className='absolute right-4 top-4 flex flex-row justify-center items-center p-0.5 w-6 h-6 rounded-md'>
						<CloseLine size={20} className='fill-text-sub' />
					</button>
				</div>

				{/* Content */}
				<div className='flex flex-col items-start p-4 gap-4 w-full h-[312px] bg-background overflow-y-auto scrollbar-hide'>
					{/* Search and Add Section */}
					<div className='flex flex-col items-start p-0 gap-3 w-full flex-shrink-0'>
						<div className='flex flex-row items-start gap-4 w-full'>
							{/* Search Input */}
							<div className='flex flex-col items-start p-0 gap-1 flex-1'>
								<div className='flex flex-row items-center px-3 py-[10px] gap-2 w-full h-10 bg-background border border-border rounded-[10px] shadow-subtle'>
									<Search2Line
										size={20}
										className='fill-text-soft flex-shrink-0'
									/>
									<input
										type='text'
										placeholder='Add members by name, ID or email'
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className='flex-1 bg-transparent text-sm font-normal text-text-soft leading-5 tracking-[-0.006em] placeholder:text-text-soft focus:outline-none'
									/>
								</div>
							</div>

							{/* Add Button */}
							<button
								onClick={handleAddFromSearch}
								disabled={filteredMembers.length === 0}
								className='flex flex-row justify-center items-center px-[10px] py-[10px] gap-1 w-[53px] h-10 bg-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed'>
								<span className='text-sm font-medium text-text-main leading-5 tracking-[-0.006em]'>
									Add
								</span>
							</button>
						</div>

						{/* Selected Members Tags */}
						{selectedMembers.length > 0 && (
							<div className='flex flex-row items-start gap-2 flex-wrap'>
								{selectedMembers.map((member) => (
									<div
										key={member.id}
										className='flex flex-row justify-center items-center p-1 gap-1 bg-background border border-border rounded-lg'>
										<AddLine
											size={16}
											className='fill-text-soft flex-shrink-0'
										/>
										<img
											src={member.avatar || "/icons/defAvatar.png"}
											alt={member.name}
											className='w-4 h-4 rounded-full flex-shrink-0 object-cover'
											onError={(e) => {
												const target = e.target as HTMLImageElement;
												if (target.src !== "/icons/defAvatar.png") {
													target.src = "/icons/defAvatar.png";
												}
											}}
										/>
										<span className='text-xs font-medium text-text-sub leading-4'>
											{member.name}
										</span>
										<button
											onClick={() => handleRemoveSelected(member.id)}
											className='ml-1 cursor-pointer hover:opacity-60 transition-opacity'>
											<Xmark size={12} className='fill-text-sub' />
										</button>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Members List */}
					<div className='flex flex-col items-start p-0 gap-4 w-full'>
						<h3 className='text-sm font-normal text-text-soft leading-5 tracking-[-0.006em]'>
							Members
						</h3>
						<div className='flex flex-col justify-center items-center gap-4 w-full'>
							{isLoading ? (
								<div className='w-full text-center py-4'>
									<span className='text-sm font-normal text-text-soft leading-5'>
										Loading members...
									</span>
								</div>
							) : filteredMembers.length > 0 ? (
								filteredMembers.map((member) => (
									<div
										key={member.id}
										onClick={() => handleAddMember(member)}
										className='flex flex-row items-center gap-3 w-full cursor-pointer hover:bg-bg-weak rounded-lg p-1 -m-1 transition-colors'>
										<img
											src={member.avatar || "/icons/defAvatar.png"}
											alt={member.name}
											className='w-10 h-10 rounded-full flex-shrink-0 object-cover'
											onError={(e) => {
												const target = e.target as HTMLImageElement;
												if (target.src !== "/icons/defAvatar.png") {
													target.src = "/icons/defAvatar.png";
												}
											}}
										/>
										<div className='flex flex-col items-start p-0 gap-1 flex-1'>
											<div className='flex flex-row items-center gap-1'>
												<span className='text-sm font-medium text-text-strong leading-5 tracking-[-0.006em]'>
													{member.name}
												</span>
												{member.isCurrentUser && (
													<span className='text-xs font-normal text-text-soft leading-4'>
														(You)
													</span>
												)}
											</div>
											<span className='text-xs font-normal text-text-soft leading-4'>
												{member.jobTitle}
											</span>
										</div>
									</div>
								))
							) : (
								<div className='w-full text-center py-4'>
									<span className='text-sm font-normal text-text-soft leading-5'>
										No members found
									</span>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Modal Footer */}
				<div className='flex flex-row items-center pl-5 pr-5 py-4 gap-3 w-full h-[68px] bg-background border-t border-border rounded-b-[24px]'>
					<div className='flex flex-row justify-end items-center gap-3 flex-1'>
						<button
							onClick={onClose}
							className='flex flex-row justify-center items-center px-2 py-2 gap-1 w-[66px] h-9 bg-background border border-border rounded-xl shadow-subtle'>
							<span className='text-sm font-medium text-text-sub leading-5 tracking-[-0.006em]'>
								Cancel
							</span>
						</button>
						<button
							onClick={() => onNext?.(selectedMembers)}
							disabled={selectedMembers.length === 0}
							className='flex flex-row justify-center items-center px-2 py-2 gap-1 w-[53px] h-9 bg-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:opacity-90 transition-opacity'>
							<span className='text-sm font-medium text-text-main leading-5 tracking-[-0.006em]'>
								Next
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default CreateGroupChatModal;
