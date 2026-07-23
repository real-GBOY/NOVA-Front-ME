/** @format */

interface EmptyStateProps {
	message: string;
	error?: string;
}

export default function EmptyState({ message, error }: EmptyStateProps) {
	return (
		<div className='h-full flex-1 flex flex-col bg-bg-weak rounded-[18px] border border-border p-3 min-w-0 items-center justify-center'>
			<p className='text-text-weak'>{message}</p>
			{error && <p className='text-xs text-text-soft mt-2'>{error}</p>}
		</div>
	);
}
