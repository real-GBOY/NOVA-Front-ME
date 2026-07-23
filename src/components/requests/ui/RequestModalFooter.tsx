/** @format */

import Button from "@/designSystem/Button";

type RequestModalFooterProps = {
	onCancel: () => void;
	cancelLabel: string;
	actionButton?: {
		label: string;
		onClick: () => void;
		variant?: "danger" | "primary";
		isLoading?: boolean;
	};
};

function RequestModalFooter({
	onCancel,
	cancelLabel,
	actionButton,
}: RequestModalFooterProps) {
	if (actionButton) {
		// Two-button layout: Cancel + Action
		return (
			<div className='flex items-center justify-end gap-3'>
				<Button variant='secondary' onClick={onCancel}>
					{cancelLabel}
				</Button>
				<Button
					variant={actionButton.variant || "primary"}
					onClick={actionButton.onClick}
					isLoading={actionButton.isLoading}>
					{actionButton.label}
				</Button>
			</div>
		);
	}

	// Single button layout: Cancel only
	return (
		<div className='flex justify-end'>
			<Button
				variant='secondary'
				onClick={onCancel}
				className='w-[4.125rem] h-9'>
				{cancelLabel}
			</Button>
		</div>
	);
}

export default RequestModalFooter;
