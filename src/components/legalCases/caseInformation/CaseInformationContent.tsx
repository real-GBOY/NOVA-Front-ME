/** @format */

import { useState } from "react";
import { Edit, AddLine } from "@/Icons";
import EditCaseSummaryModal from "./EditCaseSummaryModal";
import type { LegalCaseEvent } from "@/services/legalCasesService";
import { format } from "date-fns";

interface CaseInformationContentProps {
	summary?: string;
	events?: LegalCaseEvent[];
	onUpdateSummary?: (summary: string) => void;
	onAddEvent?: () => void;
	onEditEvent?: (event: LegalCaseEvent) => void;
	canUpdateCase?: boolean;
}

const DEFAULT_SUMMARY = "No summary available for this case.";

export default function CaseInformationContent({
	summary,
	events = [],
	onUpdateSummary,
	onAddEvent,
	onEditEvent,
	canUpdateCase = false,
}: CaseInformationContentProps) {
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [expandedDescriptions, setExpandedDescriptions] = useState<
		Record<number, boolean>
	>({});

	const toggleDescription = (eventId: number) => {
		setExpandedDescriptions((prev) => ({
			...prev,
			[eventId]: !prev[eventId],
		}));
	};

	return (
		<>
			{/* Case Summary */}
			<div className='bg-background border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-5'>
				<div className='flex items-center justify-between gap-2'>
					<h2 className='text-lg font-medium text-text-strong'>Case Summary</h2>
					{canUpdateCase && (
						<button
							onClick={() => setIsEditModalOpen(true)}
							className='flex items-center gap-1 text-primary text-sm font-medium cursor-pointer'>
							<Edit size={20} className='fill-primary' />
							<span>Edit</span>
						</button>
					)}
				</div>
				<div className='flex flex-col gap-3 overflow-hidden'>
					<div className='text-sm text-text-sub leading-5 whitespace-pre-wrap break-all'>
						{summary || DEFAULT_SUMMARY}
					</div>
				</div>
			</div>

			{canUpdateCase && (
				<EditCaseSummaryModal
					isOpen={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					initialValue={summary || ""}
					onUpdate={(newSummary) => {
						onUpdateSummary?.(newSummary);
						setIsEditModalOpen(false);
					}}
				/>
			)}

			{/* Timeline */}
			<div className='bg-background border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-5'>
				<div className='flex items-center justify-between gap-2'>
					<h2 className='text-lg font-medium text-text-strong'>Timeline</h2>
					{canUpdateCase && (
						<button
							onClick={onAddEvent}
							className='flex items-center gap-1 text-primary text-sm font-medium cursor-pointer'>
							<AddLine size={20} className='fill-primary' />
							<span>Add Update</span>
						</button>
					)}
				</div>
				<div className='flex flex-col gap-4'>
					{events.length === 0 && (
						<p className='text-sm text-text-soft py-4 text-center'>
							No timeline events recorded.
						</p>
					)}
					{events.map((event) => (
						<div
							key={event.id}
							className='bg-background border border-border rounded-2xl p-3 shadow-sm flex flex-col gap-4'>
							<div className='flex flex-col gap-2'>
								<div className='flex items-start justify-between gap-2'>
									<div className='flex-1 flex flex-col gap-1'>
										<h3 className='text-base font-medium text-text-strong'>
											{event.title}
										</h3>
										{event.description && (() => {
											const isExpanded = !!expandedDescriptions[event.id];
											const shouldTruncate = event.description.length > 180;
											return (
												<div className='max-w-full'>
													<p
														onClick={
															shouldTruncate
																? () => toggleDescription(event.id)
																: undefined
														}
														className={`text-sm text-text-sub max-w-full whitespace-pre-wrap break-all overflow-hidden ${
															shouldTruncate && !isExpanded ? "line-clamp-2 cursor-pointer" : ""
														}`}>
														{event.description}
													</p>
													{isExpanded && shouldTruncate && (
														<button
															type='button'
															onClick={() => toggleDescription(event.id)}
															className='mt-1 text-xs text-primary font-medium cursor-pointer'>
															See less
														</button>
													)}
												</div>
											);
										})()}
									</div>
									{canUpdateCase && (
										<button
											onClick={() => onEditEvent?.(event)}
											className='flex items-center gap-1 text-primary text-sm font-medium cursor-pointer'>
											<Edit size={20} className='fill-primary' />
											<span>Edit</span>
										</button>
									)}
								</div>
								<div className='flex items-center justify-between gap-2'>
									{/* Placeholder for "Added by" - backend needs to return this info */}
									<div className='flex items-center gap-2'>
										{/* <span className="text-xs text-text-sub">Added by</span>
                    <div className="flex items-center gap-1 bg-background border border-border rounded-lg px-1 py-1">
                      <div className="w-3 h-3 rounded-full bg-yellow-200 overflow-hidden">
                         <img src="/icons/defAvatar.png" alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs text-text-sub">System</span>
                    </div> */}
									</div>
									<div className='flex items-center gap-1 text-xs text-text-sub'>
										<span>
											{format(new Date(event.date), "dd MMMM, yyyy")}
										</span>
										{/* Time might not be available in date field depending on backend format */}
									</div>
								</div>
							</div>
							{/* Attachments placeholder - backend logic for event attachments needs verification */}
							{/* <div className="flex gap-2">
                 ...
              </div> */}
						</div>
					))}
				</div>
			</div>
		</>
	);
}
