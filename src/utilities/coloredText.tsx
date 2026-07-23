/** @format */

import { ReactNode } from "react";

/**
 * Renders text in the brand primary (purple) color.
 */
export function renderColoredText(text: string): ReactNode {
   return <span style={{ color: "var(--color-primary)" }}>{text}</span>;
}
