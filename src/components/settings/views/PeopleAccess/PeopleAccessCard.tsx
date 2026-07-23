/** @format */

import { useState, useRef } from "react";
import { MoreVertical, PenToSquare, Page, Trash } from "@/Icons";
import Dropdown, { DropdownItem } from "@/designSystem/Dropdown";
import MembersModal from "@/designSystem/MembersModal";

type PeopleAccessCardProps = {
	title: string;
	description: string;
	membersCount: number;
	tags?: string[];
	entityId?: number | string;
	entityType?: "role" | "jobTitle" | "team";
	onMembersClick?: () => void;
	onEdit?: () => void;
	onDuplicate?: () => void;
	onDelete?: () => void;
};

function PeopleAccessCard({
	title,
	description,
	membersCount,
	tags = [],
	entityId,
	entityType = "role",
	onMembersClick,
	onEdit,
	onDuplicate,
	onDelete,
}: PeopleAccessCardProps) {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [showAllTags, setShowAllTags] = useState(false);
	const menuButtonRef = useRef<HTMLButtonElement>(null);

	const visibleTags = showAllTags ? tags : tags.slice(0, 3);
	const remainingCount = tags.length - 3;

	const dropdownItems: DropdownItem[] = [];

	if (onEdit) {
		dropdownItems.push({
			id: "edit",
			label: "Edit",
			icon: PenToSquare,
			onClick: () => onEdit(),
		});
	}

	if (onDuplicate) {
		dropdownItems.push({
			id: "duplicate",
			label: "Duplicate",
			icon: Page,
			onClick: () => onDuplicate(),
		});
	}

	if (onDelete) {
		dropdownItems.push({
			id: "delete",
			label: "Delete",
			icon: Trash,
			onClick: () => onDelete(),
			variant: "danger",
		});
	}

	const hasActions = dropdownItems.length > 0;

	return (
		<>
			<div className='flex flex-col gap-5 p-5 w-full bg-bg-weak border border-border rounded-[20px]'>
				{/* Header */}
				<div className='flex gap-3 items-start w-full'>
					{/* Content */}
					<div className='flex flex-col gap-2 flex-1 min-w-0'>
						{/* Title */}
						<div className='flex gap-2 items-center w-full'>
							<p className='font-medium text-lg leading-6 text-text-strong tracking-[-0.015em] shrink-0'>
								{title}
							</p>
							<p
								className='flex-1 min-w-0 font-normal text-sm leading-5 text-primary tracking-[-0.006em] cursor-pointer'
								onClick={() => {
									onMembersClick?.();
									setIsModalOpen(true);
								}}>
								{membersCount} {membersCount === 1 ? "Member" : "Members"}
							</p>
						</div>
						{/* Description */}
						<p className='font-normal text-sm leading-5 text-text-sub tracking-[-0.006em] w-full'>
							{description}
						</p>
					</div>
					{/* Menu Button */}
					{hasActions && (
						<div className='relative'>
							<button
								ref={menuButtonRef}
								onClick={() => setIsDropdownOpen(!isDropdownOpen)}
								className={`flex items-center justify-center p-1.5 bg-background border border-border rounded-lg shrink-0 transition-colors hover:bg-bg-weak ${
									isDropdownOpen ? "bg-bg-weak" : ""
								}`}>
								<MoreVertical size={20} />
							</button>
							<Dropdown
								items={dropdownItems}
								isOpen={isDropdownOpen}
								onClose={() => setIsDropdownOpen(false)}
								anchorRef={menuButtonRef}
							/>
						</div>
					)}
				</div>

				{/* Tags */}
				{tags.length > 0 && (
					<div className='flex flex-wrap gap-2 items-start w-full overflow-y-auto flex-1'>
						{visibleTags.map((tag, index) => (
							<div
								key={index}
								className='px-2 py-1 bg-background border border-border rounded-lg'>
								<p className='font-medium text-xs leading-4 text-text-sub'>
									{tag}
								</p>
							</div>
						))}
						{!showAllTags && remainingCount > 0 && (
							<button
								onClick={() => setShowAllTags(true)}
								className='px-2 py-1 bg-background border border-border rounded-lg hover:bg-bg-weak transition-colors'>
								<p className='font-medium text-xs leading-4 text-primary'>
									+{remainingCount}
								</p>
							</button>
						)}
						{showAllTags && remainingCount > 0 && (
							<button
								onClick={() => setShowAllTags(false)}
								className='px-2 py-1 bg-background border border-border rounded-lg hover:bg-bg-weak transition-colors'>
								<p className='font-medium text-xs leading-4 text-primary'>
									Show less
								</p>
							</button>
						)}
					</div>
				)}
			</div>
			{isModalOpen && (
				<div className='fixed inset-0 z-50 flex items-center justify-center px-4'>
					<div
						className='absolute inset-0 bg-(--color-overlay)'
						onClick={() => setIsModalOpen(false)}
						aria-hidden='true'
					/>
					<div className='relative z-10'>
						<MembersModal
							onClose={() => setIsModalOpen(false)}
							entityId={entityId}
							entityName={title}
							entityType={entityType}
						/>
					</div>
				</div>
			)}
		</>
	);
}

export default PeopleAccessCard;
