/** @format */

import { ComponentType, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/hooks/useLanguage";
import Button from "@/designSystem/Button";
import StatusTag, { StatusTagProps } from "@/designSystem/StatusTag";
import Dropdown, { DropdownItem } from "@/designSystem/Dropdown";
import {
   ArrowLeftSLine,
   ArrowRightSLine,
   ChatText,
   MoreVertical,
   ArrowRotateLeft,
   LockCircle,
   Trash,
   MailLineAuth,
} from "@/Icons";
import ArrowLeftSmall from "@/Icons/arrow-left-small";
import { ProfileMember } from "./types";

interface ProfileHeroCardProps {
   member: ProfileMember;
   statusLabel: string;
   statusVariant?: StatusTagProps["variant"];
   lastUpdatedLabel?: string;
   lastUpdated?: string;
   paginationLabel?: string;
   currentPage?: number;
   totalPages?: number;
   isPrevDisabled?: boolean;
   isNextDisabled?: boolean;
   onPrev?: () => void;
   onNext?: () => void;
   onSendMessage?: () => void;
   onBack?: () => void;
   onOverridePermissions?: () => void;
   onResetPermissions?: () => void;
   onResendInvite?: () => void;
   onDeactivate?: () => void;
}

function ProfileHeroCard({
   member,
   statusLabel,
   statusVariant = "active",
   lastUpdatedLabel,
   lastUpdated,
   paginationLabel,
   currentPage = 1,
   totalPages = 1,
   isPrevDisabled,
   isNextDisabled,
   onPrev,
   onNext,
   onSendMessage,
   onBack,
   onOverridePermissions,
   onResetPermissions,
   onResendInvite,
   onDeactivate,
}: ProfileHeroCardProps) {
   const { t } = useTranslation("members");
   const { isRTL } = useLanguage();
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const moreButtonRef = useRef<HTMLButtonElement>(null);
   const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

   // Use provided labels or fall back to translations
   const displayLastUpdatedLabel =
      lastUpdatedLabel || t("profile.hero.lastUpdated");
   const displayLastUpdated = lastUpdated || t("profile.hero.lastUpdatedValue");
   const displayPaginationLabel =
      paginationLabel ||
      t("profile.hero.pagination", { current: currentPage, total: totalPages });

   const dropdownItems = useMemo(() => {
      const items: DropdownItem[] = [];

      if (onResendInvite) {
         items.push({
            id: "resend-invite",
            label: t("actions.resendInvitation"),
            icon: MailLineAuth,
            onClick: onResendInvite,
         });
      }

      if (onOverridePermissions) {
         items.push({
            id: "override",
            label: t("actions.overridePermissions"),
            icon: LockCircle,
            onClick: onOverridePermissions,
         });
      }

      if (onResetPermissions) {
         items.push({
            id: "reset",
            label: t("actions.resetPermissions"),
            icon: ArrowRotateLeft,
            onClick: onResetPermissions,
         });
      }

      if (onDeactivate) {
         items.push({
            id: "deactivate",
            label: t("actions.deactivate"),
            icon: Trash,
            variant: "danger",
            onClick: onDeactivate,
         });
      }

      return items;
   }, [
      t,
      onResendInvite,
      onOverridePermissions,
      onResetPermissions,
      onDeactivate,
   ]);

   const statusBackgroundClass = useMemo(() => {
      switch (statusVariant) {
         case "active":
            return "bg-success/10";
         case "warning":
            return "bg-warning/10";
         case "inactive":
            return "bg-bg-weak";
         case "error":
            return "bg-danger/10";
         default:
            return "bg-bg-weak";
      }
   }, [statusVariant]);

   return (
      <section>
         <div className="r-stack r-gap-sm xl:flex-wrap xl:items-center xl:justify-between xl:gap-8">
            {/* Left side - Back button and profile info */}
            <div className="flex items-center gap-3 xl:flex-wrap xl:items-center xl:gap-4 ">
               <BackButton onClick={onBack} />

               {/* Avatar and name */}
               <div className="flex items-center gap-3 xl:gap-4">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-bg-weak xl:h-12 xl:w-12">
                     <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-full w-full object-cover"
                     />
                  </div>
                  <div className="flex flex-col gap-1">
                     <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-medium leading-5 text-text-strong sm:text-base xl:text-base xl:leading-6">
                           {member.name}
                        </h2>
                        <StatusTag
                           label={statusLabel}
                           variant={statusVariant}
                           className={`rounded-md ${statusBackgroundClass} px-1.5 py-0.5 xl:rounded-lg xl:px-2 xl:py-0.5`}
                        />
                     </div>
                     <div className="flex flex-col gap-0.5 xl:hidden">
                        <p className="text-xs font-normal leading-4 text-text-soft">
                           {displayLastUpdatedLabel}
                        </p>
                        <p className="text-sm font-medium leading-5 text-text-strong">
                           {displayLastUpdated}
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Divider */}
            <div className="hidden xl:block xl:h-6 xl:w-px xl:rounded-full xl:bg-stroke-sub-300"></div>

            {/* Center - Last Updated */}
            <div className="hidden xl:flex xl:flex-1 xl:items-center xl:gap-8 xl:min-w-0 xl:w-auto">
               <div className="flex flex-col gap-1">
                  <p className="text-sm font-normal leading-5 text-text-soft">
                     {displayLastUpdatedLabel}
                  </p>
                  <p className="text-base font-medium leading-6 text-text-strong">
                     {displayLastUpdated}
                  </p>
               </div>
            </div>

            {/* Right side - Navigation and actions */}
            <div className="flex w-full flex-col r-gap-sm xl:w-auto xl:flex-row xl:items-center xl:gap-5">
               {/* Navigation row */}
               <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 xl:gap-3">
                     <ArrowNavButton
                        icon={isRTL ? ArrowRightSLine : ArrowLeftSLine}
                        label={t("profile.hero.previousMember")}
                        disabled={isPrevDisabled}
                        onClick={onPrev}
                     />
                     <ArrowNavButton
                        icon={isRTL ? ArrowLeftSLine : ArrowRightSLine}
                        label={t("profile.hero.nextMember")}
                        disabled={isNextDisabled}
                        onClick={onNext}
                     />
                     <span className="text-xs font-medium text-text-soft sm:text-sm xl:text-sm">
                        {displayPaginationLabel}
                     </span>
                  </div>
                  <button
                     ref={mobileMenuButtonRef}
                     type="button"
                     onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                     className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-text-sub transition-colors hover:bg-bg-weak xl:hidden"
                     aria-label={t("actions.moreOptions")}>
                     <MoreVertical size={20} />
                  </button>
                  <Dropdown
                     items={dropdownItems}
                     isOpen={isMobileMenuOpen}
                     onClose={() => setIsMobileMenuOpen(false)}
                     anchorRef={mobileMenuButtonRef}
                  />
               </div>

               {/* Divider */}
               <div className="hidden xl:block xl:h-6 xl:w-px xl:rounded-full xl:bg-stroke-sub-300"></div>

               {/* Action buttons */}
               <div className="flex w-full flex-col r-gap-sm sm:flex-row sm:items-center xl:w-auto xl:flex-row xl:items-center xl:gap-3">
                  <div className="hidden xl:flex xl:items-center xl:gap-3">
                     <button
                        ref={moreButtonRef}
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-text-sub transition-colors hover:bg-bg-weak">
                        <MoreVertical size={20} />
                     </button>
                     <Dropdown
                        items={dropdownItems}
                        isOpen={isDropdownOpen}
                        onClose={() => setIsDropdownOpen(false)}
                        anchorRef={moreButtonRef}
                     />
                  </div>

                  <Button
                     className="r-btn-full bg-primary px-3 py-2 text-sm font-medium text-text hover:bg-primary-dark whitespace-nowrap gap-1 xl:rounded-lg xl:px-2.5 xl:py-2.5"
                     onClick={onSendMessage}>
                     <ChatText size={20} className="fill-background" />
                     <span className="px-1">
                        {t("profile.hero.sendMessage")}
                     </span>
                  </Button>
               </div>
            </div>
         </div>
      </section>
   );
}

function ArrowNavButton({
   icon: Icon,
   label,
   disabled = false,
   onClick,
}: {
   icon: ComponentType<{ size?: number }>;
   label: string;
   disabled?: boolean;
   onClick?: () => void;
}) {
   return (
      <button
         type="button"
         disabled={disabled}
         aria-label={label}
         onClick={() => {
            if (disabled) return;
            onClick?.();
         }}
         className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-text-sub transition-colors hover:bg-bg-weak hover:text-text-strong disabled:opacity-50 disabled:cursor-not-allowed xl:h-10 xl:w-10">
         <Icon size={20} />
      </button>
   );
}

function BackButton({
   label,
   onClick,
}: {
   label?: string;
   onClick?: () => void;
}) {
   const { t } = useTranslation("members");
   const { isRTL } = useLanguage();
   const displayLabel = label || t("profile.hero.backToMembers");

   return (
      <button
         type="button"
         aria-label={displayLabel}
         onClick={onClick}
         className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-text-strong transition-colors hover:bg-bg-weak xl:h-10 xl:w-10">
         <ArrowLeftSmall className={`fill-current`} isRTL={isRTL} size={20} />
      </button>
   );
}

export default ProfileHeroCard;
