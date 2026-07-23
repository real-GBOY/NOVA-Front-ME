/** @format */

import { InputHTMLAttributes, forwardRef } from "react";

interface ToggleProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "style"> {
	label?: string;
	description?: string;
	labelClassName?: string;
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
	({ label, description, labelClassName, id, className, ...props }, ref) => {
		const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

		return (
			<div className='flex items-start justify-between gap-4'>
				<div className='flex flex-col gap-1 flex-1'>
					{label && (
						<label
							htmlFor={toggleId}
							className={`text-sm font-medium text-text-strong cursor-pointer ${
								labelClassName || ""
							}`}>
							{label}
						</label>
					)}
					{description && (
						<p className='text-sm text-text-sub'>{description}</p>
					)}
				</div>
				<label
					htmlFor={toggleId}
					className='relative inline-flex items-center cursor-pointer'>
					<input
						ref={ref}
						type='checkbox'
						id={toggleId}
						className='sr-only peer'
						{...props}
					/>
					<div
						className={`
                  relative
                  w-11 h-6
                  bg-bg-weak
                  peer-focus:outline-none
                  peer-focus:ring-2
                  peer-focus:ring-primary/20
                  rounded-full
                  peer-checked:bg-primary
                  transition-colors
                  duration-200
                  peer-checked:[&>div]:translate-x-5
                  ${className || ""}
               `}>
						<div
							className={`
                     absolute
                     top-[2px]
                     left-[2px]
                     bg-background
                     rounded-full
                     h-5
                     w-5
                     transition-transform
                     duration-200
                     shadow-sm
                  `}
						/>
					</div>
				</label>
			</div>
		);
	}
);

Toggle.displayName = "Toggle";

export default Toggle;
