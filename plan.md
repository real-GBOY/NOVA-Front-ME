# Responsive Continuation Plan (Design System First)

Goal: make mobile/tablet responsive behavior consistent by updating reusable design system components, while preserving desktop sizing with `xl:` per `src/designSystem/responsiveGuidelines.md`.

## Phase 1: Baseline & Guardrails
- Confirm `xl:` desktop values stay unchanged for all touched components.
- Identify the most-used design system components in the app (layout, containers, headers, sidebars, drawers, tables).
- Add only mobile/tablet classes (or `r-*` utilities) ahead of existing values.

## Phase 2: Layout Foundations
- Audit and update:
  - `src/designSystem/PageHeader.tsx`
  - `src/designSystem/Sidebar/*`
  - `src/designSystem/Drawer.tsx`
  - `src/designSystem/IconButton.tsx`
  - `src/designSystem/Button.tsx`
- Ensure all layout wrappers allow shrinking (`min-w-0`) and prevent horizontal overflow.

## Phase 3: Content Containers & Tables
- Add responsive wrappers for tables/cards:
  - `r-table-scroll` on container shells
  - `r-min-w-0` on cards, rows, and flex children
- Standardize spacing on common components:
  - `r-px-sm`, `r-py-sm`, `r-gap-sm` before `xl:` values

## Phase 4: Forms, Modals, and Drawers
- Apply `r-modal-w`, `r-modal-h`, `r-modal-w-md`, `r-drawer-w` where applicable.
- Confirm modal/drawer content scrolls correctly on small screens.

## Phase 5: QA & Stabilization
- Verify at widths: 1280+ (desktop), 768 (tablet), 375 (mobile).
- Fix any overflow/spacing regressions while keeping `xl:` values intact.

## Working Rules
- Do not change desktop sizing; prefix existing classes with `xl:`.
- Add responsive classes before `xl:` values.
- Prefer updating design system components instead of one-off screen fixes.
