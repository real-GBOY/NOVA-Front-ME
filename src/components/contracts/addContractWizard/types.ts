/** @format */

export type { ContractFormData } from "@/utilities/schemas/contractSchema";

export type AddContractWizardProps = {
   onClose?: () => void;
   onComplete?: (data: ContractFormData) => void | Promise<void>;
   onFormDataChange?: (data: ContractFormData) => void;
   initialData?: Partial<ContractFormData>;
   availableMembers?: Array<{ id: string; label: string; subLabel?: string }>;
   availableContractTypes?: Array<{ id: string; label: string }>;
   availableSalaryCycles?: Array<{ id: string; label: string }>;
   availableAssets?: Array<{ id: string; label: string; avatar?: string }>;
};

export const STEPS = [
   {
      id: 1,
      key: "assignMember",
   },
   {
      id: 2,
      key: "compensationAssets",
   },
   {
      id: 3,
      key: "policyLimits",
   },
   {
      id: 4,
      key: "review",
   },
] as const;
