import {
   Eye,
   ChatText,
   ArrowRotateLeft,
   Trash,
   MoreVertical,
   LockCircle,
   MailLineAuth,
} from "@/Icons";
import Dropdown from "@/designSystem/Dropdown";
import { useTranslation } from "@/hooks/useTranslation";
import { useCallback, useMemo, useRef, useState } from "react";
import { usePermissions } from "@/contexts/PermissionContext";

export interface MemberActionsMenuProps {
   onViewProfile?: () => void;
   onSendMessage?: () => void;
   onResendInvite?: () => void;
   onOverridePermissions?: () => void;
   onResetPermissions?: () => void;
   onDeactivate?: () => void;
}

export default function MemberActionsMenu({
   onViewProfile,
   onSendMessage,
   onResendInvite,
   onOverridePermissions,
   onResetPermissions,
   onDeactivate,
}: MemberActionsMenuProps) {
   const { t } = useTranslation("members");
   const { can } = usePermissions();
   const menuButtonRef = useRef<HTMLButtonElement>(null);
   const [isMenuOpen, setIsMenuOpen] = useState(false);

   const handleMenuClose = useCallback(() => {
      setIsMenuOpen(false);
   }, []);

   const handleActionClick = useCallback((action?: () => void) => {
      action?.();
      setIsMenuOpen(false);
   }, []);

   const dropdownItems = useMemo(() => {
      const items = [];

      if (onViewProfile) {
         items.push({
            id: "view-profile",
            label: t("actions.viewProfile"),
            icon: Eye,
            onClick: () => handleActionClick(onViewProfile),
         });
      }

      if (onSendMessage) {
         items.push({
            id: "send-message",
            label: t("actions.sendMessage"),
            icon: ChatText,
            onClick: () => handleActionClick(onSendMessage),
         });
      }

      if (onResendInvite) {
         items.push({
            id: "resend-invite",
            label: t("actions.resendInvitation"),
            icon: MailLineAuth,
            onClick: () => handleActionClick(onResendInvite),
         });
      }

      // Permission-gated actions
      if (can("grant_permission") && onOverridePermissions) {
         items.push({
            id: "override-permissions",
            label: t("actions.overridePermissions"),
            icon: LockCircle,
            onClick: () => handleActionClick(onOverridePermissions),
         });
      }

      if (can("grant_permission") && onResetPermissions) {
         items.push({
            id: "reset-permissions",
            label: t("actions.resetPermissions"),
            icon: ArrowRotateLeft,
            onClick: () => handleActionClick(onResetPermissions),
         });
      }

      if (can("deactivate_employee") && onDeactivate) {
         items.push({
            id: "deactivate",
            label: t("actions.deactivate"),
            icon: Trash,
            variant: "danger" as const,
            onClick: () => handleActionClick(onDeactivate),
         });
      }

      return items;
   }, [
      t,
      can,
      handleActionClick,
      onViewProfile,
      onSendMessage,
      onResendInvite,
      onOverridePermissions,
      onResetPermissions,
      onDeactivate,
   ]);

   return (
      <div className="relative">
         <button
            ref={menuButtonRef}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            data-row-menu-trigger
            className={`shrink-0 bg-background border border-border rounded-lg p-1.5 hover:bg-bg-weak transition-colors ${
               isMenuOpen ? "bg-bg-weak" : ""
            }`}
            aria-label={t("actions.moreOptions")}>
            <MoreVertical size={20} />
         </button>
         <Dropdown
            items={dropdownItems}
            isOpen={isMenuOpen}
            onClose={handleMenuClose}
            anchorRef={menuButtonRef}
         />
      </div>
   );
}
