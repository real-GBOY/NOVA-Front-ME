/** @format */

export type ValidationSummaryItem = {
   field: string;
   label: string;
   message: string;
};

type FormValidationSummaryProps = {
   items: ValidationSummaryItem[];
   title?: string;
   description?: string;
   className?: string;
   onSelectField?: (field: string) => void;
};

function ErrorIcon() {
   return (
      <svg
         aria-hidden="true"
         viewBox="0 0 20 20"
         className="h-4 w-4"
         fill="currentColor">
         <path
            fillRule="evenodd"
            d="M10 2.5A7.5 7.5 0 1 0 10 17.5 7.5 7.5 0 0 0 10 2.5Zm0 4a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 6.5Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
            clipRule="evenodd"
         />
      </svg>
   );
}

export default function FormValidationSummary({
   items,
   title,
   description,
   className = "",
   onSelectField,
}: FormValidationSummaryProps) {
   if (!items.length) return null;

   const count = items.length;
   const defaultTitle =
      count === 1 ? "Fix 1 field to continue" : `Fix ${count} fields to continue`;
   const defaultDescription = onSelectField
      ? "Click an item to jump to the field."
      : undefined;

   return (
      <div
         className={`rounded-2xl border border-danger/20 bg-danger/5 p-4 ${className}`}
         role="alert"
         aria-live="polite">
         <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-danger/10 text-danger">
               <ErrorIcon />
            </div>
            <div className="flex-1">
               <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-text-strong">
                     {title ?? defaultTitle}
                  </p>
                  <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger">
                     {count}
                  </span>
               </div>
               {(description ?? defaultDescription) && (
                  <p className="mt-1 text-xs text-text-sub">
                     {description ?? defaultDescription}
                  </p>
               )}
               <div className="mt-3 flex flex-col gap-1">
                  {items.map((item) => (
                     <button
                        key={item.field}
                        type="button"
                        onClick={() => onSelectField?.(item.field)}
                        aria-disabled={!onSelectField}
                        tabIndex={onSelectField ? 0 : -1}
                        className={`flex w-full items-start gap-2 rounded-lg px-2 py-1 text-start text-xs transition-colors ${
                           onSelectField ? "hover:bg-danger/10" : "cursor-default"
                        }`}>
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-danger" />
                        <span className="flex-1">
                           <span className="font-medium text-text-strong">
                              {item.label}
                           </span>
                           <span className="text-text-sub">
                              {item.message ? ` — ${item.message}` : ""}
                           </span>
                        </span>
                     </button>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
}
