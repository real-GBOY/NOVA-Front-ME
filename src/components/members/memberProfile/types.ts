/** @format */

import { ReactElement, ReactNode } from "react";

export type SummaryTone = "success" | "warning" | "info" | "neutral";
export type SummaryLevel = "low" | "medium" | "high";

export interface SummaryCardData {
   id: string;
   title: string;
   value: string | ReactElement;
   icon: ReactElement;
   badge?: {
      label: string;
      tone: SummaryTone;
      level?: SummaryLevel;
   };
   helper?: string;
}

export interface TabItem {
   id: string;
   label: string;
   count?: number;
   isActive?: boolean;
}

export interface DetailItem {
   label: string;
   value: string | ReactNode;
   muted?: boolean;
   link?: string;
   badge?: boolean;
   highlighted?: boolean;
   variant?: "default" | "pill" | "highlightedText" | "warningText";
   isExternalLink?: boolean;
}

export interface DetailSectionData {
   id: string;
   title: string;
   items: DetailItem[];
}

export interface ProfileMember {
   name: string;
   title: string;
   team: string;
   memberId: string;
   avatar: string;
   permissionLabel: string;
   roleLabel: string;
}
