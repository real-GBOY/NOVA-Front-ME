/** @format */

import type { NavigateFunction } from "react-router-dom";
import type { CommandPaletteItem } from "@/components/commandPalette/types";
import { UserPlusCircleAlt, ClipboardText, InvoiceDollar } from "@/Icons";

export interface ActionContext {
	navigate: NavigateFunction;
	// Add more action handlers as needed
	onOpenAddMemberModal?: () => void;
	onOpenAddInvoiceModal?: () => void;
	onOpenAddVoucherModal?: () => void;
	onOpenAddContractModal?: () => void;
}

export const createQuickActions = (context: ActionContext): CommandPaletteItem[] => {
	const actions: CommandPaletteItem[] = [];

	// Add actions that require modals only if handlers are provided
	if (context.onOpenAddMemberModal) {
		actions.unshift({
			id: "action-add-member",
			type: "action",
			label: "commandPalette.actions.addNewMember",
			description: "commandPalette.descriptions.createMember",
			icon: UserPlusCircleAlt,
			category: "members",
			action: context.onOpenAddMemberModal,
		});
	}

	if (context.onOpenAddInvoiceModal) {
		actions.push({
			id: "action-add-invoice",
			type: "action",
			label: "commandPalette.actions.createInvoice",
			description: "commandPalette.descriptions.createInvoice",
			icon: InvoiceDollar,
			category: "invoices",
			action: context.onOpenAddInvoiceModal,
		});
	}

	if (context.onOpenAddVoucherModal) {
		actions.push({
			id: "action-add-voucher",
			type: "action",
			label: "commandPalette.actions.createVoucher",
			description: "commandPalette.descriptions.createVoucher",
			icon: InvoiceDollar,
			category: "vouchers",
			action: context.onOpenAddVoucherModal,
		});
	}

	if (context.onOpenAddContractModal) {
		actions.push({
			id: "action-add-contract",
			type: "action",
			label: "commandPalette.actions.createContract",
			description: "commandPalette.descriptions.createContract",
			icon: ClipboardText,
			category: "contracts",
			action: context.onOpenAddContractModal,
		});
	}

	return actions;
};
