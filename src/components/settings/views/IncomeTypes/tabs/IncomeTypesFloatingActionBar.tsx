/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import FloatingActionBar, {
   FloatingAction,
} from "@/designSystem/FloatingActionBar";
import { IncomeType } from "../../types";

interface IncomeTypesFloatingActionBarProps {
   selectedCount: number;
   selectedRows: IncomeType[];
   onEdit: (incomeType: IncomeType) => void;
   onDelete: (incomeTypes: IncomeType[]) => void;
   resetSignal?: number;
}

export default function IncomeTypesFloatingActionBar({
   selectedCount,
   selectedRows,
   onEdit,
   onDelete,
   resetSignal,
}: IncomeTypesFloatingActionBarProps) {
   const { t } = useTranslation("settings");

   if (selectedCount === 0) return null;

   const actions: FloatingAction[] = [
      {
         label: t("incomeTypes.actions.edit") || "Edit",
         onClick: () => onEdit(selectedRows[0]),
         disabled: selectedCount !== 1, // Can only edit one at a time
      },
      {
         label: t("incomeTypes.actions.delete") || "Delete",
         onClick: () => onDelete(selectedRows),
         variant: "danger",
      },
   ];

   return (
      <FloatingActionBar
         selectedCount={selectedCount}
         actions={actions}
         resetSignal={resetSignal}
      />
   );
}
