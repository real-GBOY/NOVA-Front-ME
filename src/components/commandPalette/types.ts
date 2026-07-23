/** @format */

export type QuickActionCategory =
   | "all"
   | "members"
   | "invoices"
   | "vouchers"
   | "legalCases"
   | "contracts"
   | "settings";

export type CommandPaletteItemType =
   | "navigation"
   | "action"
   | "member"
   | "invoice"
   | "voucher"
   | "case"
   | "contract"
   | "setting"
   | "recent";

export interface CommandPaletteItemMetadata {
   entityId?: number | string;
   subtitle?: string;
   badge?: string;
   timestamp?: string;
}

export interface CommandPaletteItem {
   id: string;
   type: CommandPaletteItemType;
   label: string;
   description?: string;
   icon: React.ComponentType<{ size?: number; className?: string }>;
   category: QuickActionCategory;
   path?: string;
   action?: () => void;
   shortcut?: string;
   metadata?: CommandPaletteItemMetadata;
   rank?: number;
}

export interface QuickAction {
   id: string;
   label: string;
   icon: React.ComponentType<{ size?: number; className?: string }>;
   shortcut: string;
   onAction: () => void;
   category?: QuickActionCategory;
}

export interface CommandPaletteProps {
   isOpen: boolean;
   onClose: () => void;
}

export interface CategoryConfig {
   id: QuickActionCategory;
   label: string;
   icon: React.ComponentType<{ size?: number; className?: string }>;
}
