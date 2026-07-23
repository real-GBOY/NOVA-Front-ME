/** @format */

import { MemberFormData } from "@/utilities/schemas/memberSchema";

export type AddMemberWizardProps = {
   onClose?: () => void;
   onComplete?: (data: MemberFormData) => void;
   onFormDataChange?: (data: MemberFormData) => void;
   initialData?: Partial<MemberFormData>;
   availableJobTitles?: { id: string; title: string }[];
   availableTeams?: { id: string; name: string }[];
   availableRoles?: { id: string; title: string }[];
   availableManagers?: { id: string; name: string; avatar?: string }[];
};

export const STEPS = [
   { id: 1, key: "basic" },
   { id: 2, key: "work" },
   { id: 3, key: "residency" },
   { id: 4, key: "review" },
] as const;

export type { MemberFormData };
