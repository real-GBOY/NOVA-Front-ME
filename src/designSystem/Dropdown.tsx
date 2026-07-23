/** @format */

import useLanguage from "@/hooks/useLanguage";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type DropdownItem = {
   id: string;
   label: string;
   icon: React.ComponentType<{
      size?: number;
      className?: string;
      isRTL?: boolean;
   }>;
   onClick: () => void;
   variant?: "default" | "danger" | "primary";
   disabled?: boolean;
   tooltip?: {
      label: string;
   };
};

type DropdownProps = {
   items: DropdownItem[];
   isOpen: boolean;
   onClose: () => void;
   anchorRef: React.RefObject<HTMLElement>;
   className?: string;
   zIndex?: string;
   variant?: "default" | "match-width";
   dataScope?: string;
};

function Dropdown({
   items,
   isOpen,
   onClose,
   anchorRef,
   className,
   zIndex,
   variant = "default",
   dataScope,
}: DropdownProps) {
   const dropdownRef = useRef<HTMLDivElement>(null);
   const rafRef = useRef<number>();
   const { isRTL } = useLanguage();
   const [position, setPosition] = useState<{
      top: number;
      left: number | string;
      right: number | string;
      width?: number;
   }>({ top: 0, left: 0, right: "auto" });
   const [isPositioned, setIsPositioned] = useState(false);

  // Calculate dropdown position based on anchor element
   useEffect(() => {
      if (isOpen && anchorRef.current) {
         setIsPositioned(false);
         const spacing = 4;

         const updatePosition = () => {
            if (!anchorRef.current) return;
            const anchorRect = anchorRef.current.getBoundingClientRect();
            const dropdownHeight = dropdownRef.current?.offsetHeight ?? 0;

            if (!dropdownHeight) {
               rafRef.current = requestAnimationFrame(updatePosition);
               return;
            }

            const spaceBelow = window.innerHeight - anchorRect.bottom - spacing;
            const spaceAbove = anchorRect.top - spacing;
            const shouldOpenUp =
               spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

            const top = shouldOpenUp
               ? anchorRect.top - spacing - dropdownHeight
               : anchorRect.bottom + spacing;

            const updatedPosition = isRTL
               ? {
                    top,
                    left: anchorRect.left,
                    right: "auto",
                    width:
                       variant === "match-width"
                          ? anchorRect.width
                          : undefined,
                 }
               : {
                    top,
                    left: "auto",
                    right: window.innerWidth - anchorRect.right,
                    width:
                       variant === "match-width"
                          ? anchorRect.width
                          : undefined,
                 };

            setPosition(updatedPosition);
            setIsPositioned(true);
            rafRef.current = undefined;
         };

         updatePosition();
         window.addEventListener("scroll", updatePosition, true);
         window.addEventListener("resize", updatePosition);

         return () => {
            if (rafRef.current) {
               cancelAnimationFrame(rafRef.current);
            }
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
         };
      }
   }, [isOpen, anchorRef, isRTL, variant]);

   useEffect(() => {
      if (!isOpen) {
         setIsPositioned(false);
      }
   }, [isOpen]);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node) &&
            anchorRef.current &&
            !anchorRef.current.contains(event.target as Node)
         ) {
            onClose();
         }
      };

      const handleEscape = (event: KeyboardEvent) => {
         if (event.key === "Escape") {
            onClose();
         }
      };

      if (isOpen) {
         document.addEventListener("mousedown", handleClickOutside);
         document.addEventListener("keydown", handleEscape);
      }

      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
         document.removeEventListener("keydown", handleEscape);
      };
   }, [isOpen, onClose, anchorRef]);

   if (!isOpen) return null;

   const dropdownContent = (
      <div
         ref={dropdownRef}
         data-dropdown-root="true"
         data-dropdown-scope={dataScope}
         className={`bg-background border border-border rounded-2xl p-2 shadow-lg ${
            zIndex || "z-50"
         } ${className || ""}`}
         style={{
            position: "fixed",
            top: `${position.top}px`,
            left:
               typeof position.left === "number"
                  ? `${position.left}px`
                  : position.left,
            right:
               typeof position.right === "number"
                  ? `${position.right}px`
                  : position.right,
            width: position.width ? `${position.width}px` : undefined,
            minWidth: position.width ? undefined : "14rem",
            opacity: isPositioned ? 1 : 0,
            pointerEvents: isPositioned ? "auto" : "none",
         }}>
         <div className="flex flex-col gap-1">
            {items.map((item) => {
               const Icon = item.icon;
               const isDanger = item.variant === "danger";
               const isPrimary = item.variant === "primary";
               const isDisabled = item.disabled;

               return (
                  <button
                     key={item.id}
                     onClick={() => {
                        if (isDisabled) return;
                        item.onClick();
                        onClose();
                     }}
                     disabled={isDisabled}
                     title={item.tooltip?.label}
                     className={`flex items-center gap-2 px-2 py-1.5 rounded-lg w-full transition-colors cursor-pointer ${
                        isDisabled
                           ? "opacity-60 cursor-not-allowed text-text-sub"
                           : isDanger
                           ? "text-danger hover:bg-danger/10"
                           : isPrimary
                           ? "text-primary hover:bg-primary/10"
                           : "text-text-strong hover:bg-bg-weak"
                     }`}>
                     <Icon
                        size={20}
                        className={
                           isDanger
                              ? "fill-danger"
                              : isPrimary
                              ? "fill-primary"
                              : ""
                        }
                        isRTL={isRTL}
                     />
                     <span
                        className="font-normal text-sm leading-5 tracking-[-0.084px]"
                        title={item.tooltip?.label}>
                        {item.label}
                     </span>
                  </button>
               );
            })}
         </div>
      </div>
   );

   return createPortal(dropdownContent, document.body);
}

export default Dropdown;
