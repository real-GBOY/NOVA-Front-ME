# Responsive Design Guidelines

> [!IMPORTANT]
> - **Current desktop values stay EXACTLY as-is** - just prefix with `xl:`
> - Add responsive classes for mobile/tablet BEFORE the current values
> - Uses **Tailwind CSS v4**

---

## Breakpoints

| Prefix | Min Width | Target |
| ------ | --------- | ------ |
| (none) | 0px | Mobile phones |
| `sm:` | 640px | Large phones / Small tablets |
| `md:` | 768px | Tablets |
| `xl:` | 1280px | **Desktop (CURRENT - prefix existing values)** |

---

## The Approach

### Step 1: Prefix current values with `xl:`

Take the existing class and add `xl:` prefix:

```tsx
// Current
max-w-lg  →  xl:max-w-lg
p-6       →  xl:p-6  
gap-4     →  xl:gap-4
```

### Step 2: Add mobile/tablet values BEFORE

```tsx
// Final result
className="w-[95%] md:w-[85%] xl:max-w-lg"
//          │        │         └── Current (unchanged)
//          │        └── Tablet (new)
//          └── Mobile (new)
```

### This ensures:
- ✅ Desktop (xl:) uses EXACT current values
- ✅ No risk of accidentally changing desktop
- ✅ Only adding new responsive values

---

## Utility Classes (Mobile/Tablet Only)

These classes handle mobile/tablet. **Current values stay in the component with `xl:` prefix.**

```css
@layer components {
  /* ═══════════════════════════════════════════════════════════
     LAYOUT PATTERNS
     ═══════════════════════════════════════════════════════════ */
  
  /* Stack on mobile, row on tablet - use with existing xl: flex classes */
  .r-stack {
    @apply flex flex-col md:flex-row;
  }
  
  /* Stack until desktop */
  .r-stack-xl {
    @apply flex flex-col;
    /* Component adds: xl:flex-row */
  }
  
  /* ═══════════════════════════════════════════════════════════
     WIDTH (for smaller screens only)
     ═══════════════════════════════════════════════════════════ */
  
  /* Full width mobile, shrink on tablet - add xl:[current] in component */
  .r-w-responsive {
    @apply w-full md:w-auto;
  }
  
  /* Modal default width pattern */
  .r-modal-w {
    @apply w-[95vw] md:w-[85vw];
    /* Component adds: xl:max-w-lg or xl:w-[30rem] etc */
  }
  
  /* Modal medium width pattern */
  .r-modal-w-md {
    @apply w-full md:w-[80%];
    /* Component adds: xl:w-[30rem] */
  }
  
  /* Drawer width pattern */
  .r-drawer-w {
    @apply w-full md:w-100;
    /* Component adds: xl:max-w-[600px] */
  }
  
  /* ═══════════════════════════════════════════════════════════
     HEIGHT (for smaller screens only)
     ═══════════════════════════════════════════════════════════ */
  
  .r-modal-h {
    @apply max-h-[80vh] md:max-h-[85vh];
    /* Component adds: xl:max-h-[90vh] */
  }
  
  .r-modal-h-lg {
    @apply h-[95vh];
    /* Component adds: xl:h-[98vh] */
  }
  
  /* ═══════════════════════════════════════════════════════════
     SPACING (for smaller screens only)
     ═══════════════════════════════════════════════════════════ */
  
  /* Padding - component adds xl:[current] */
  .r-p-sm {
    @apply p-3 md:p-4;
    /* Component adds: xl:p-5 or xl:p-6 */
  }
  
  .r-px-sm {
    @apply px-4 md:px-5;
    /* Component adds: xl:px-6 */
  }
  
  .r-py-sm {
    @apply py-3 md:py-4;
    /* Component adds: xl:py-6 */
  }
  
  /* Gap - component adds xl:[current] */
  .r-gap-sm {
    @apply gap-2 md:gap-3;
    /* Component adds: xl:gap-4 */
  }
  
  .r-gap {
    @apply gap-3 md:gap-4;
    /* Component adds: xl:gap-6 */
  }
  
  /* ═══════════════════════════════════════════════════════════
     VISIBILITY
     ═══════════════════════════════════════════════════════════ */
  
  .r-hide-mobile {
    @apply hidden md:block;
  }
  
  .r-hide-mobile-flex {
    @apply hidden md:flex;
  }
  
  .r-show-mobile {
    @apply block md:hidden;
  }
  
  /* ═══════════════════════════════════════════════════════════
     GRIDS
     ═══════════════════════════════════════════════════════════ */
  
  /* Stats grid - add xl:grid-cols-4 in component if that's current */
  .r-grid-stats {
    @apply grid grid-cols-1 sm:grid-cols-2;
    /* Component adds: xl:grid-cols-4 */
  }
  
  /* Form grid */
  .r-grid-form {
    @apply grid grid-cols-1;
    /* Component adds: xl:grid-cols-2 */
  }
  
  /* ═══════════════════════════════════════════════════════════
     BUTTONS
     ═══════════════════════════════════════════════════════════ */
  
  .r-btn-group {
    @apply flex flex-col sm:flex-row gap-2;
  }
  
  .r-btn-full {
    @apply w-full sm:w-auto;
  }
  
  /* ═══════════════════════════════════════════════════════════
     TABLE
     ═══════════════════════════════════════════════════════════ */
  
  .r-table-scroll {
    @apply overflow-x-auto -mx-4;
    /* Component adds: xl:mx-0 */
  }
  
  /* ═══════════════════════════════════════════════════════════
     BORDER RADIUS (smaller on mobile)
     ═══════════════════════════════════════════════════════════ */
  
  .r-rounded {
    @apply rounded-xl md:rounded-2xl;
    /* Component adds: xl:rounded-2xl or xl:rounded-3xl */
  }
  
  /* ═══════════════════════════════════════════════════════════
     MIN-WIDTH (allow shrinking on mobile)
     ═══════════════════════════════════════════════════════════ */
  
  .r-min-w-0 {
    @apply min-w-0 sm:min-w-40;
    /* Component adds: xl:min-w-[200px] or xl:min-w-50 */
  }
}
```

---

## Usage Examples

### Modal

```tsx
// Current:
className="max-w-lg max-h-[90vh] rounded-2xl p-4 sm:p-6"

// Becomes:
className="r-modal-w r-modal-h r-rounded xl:max-w-lg xl:max-h-[90vh] xl:rounded-2xl p-4 sm:p-6"
//          └── responsive ────────────┘ └── current with xl: prefix ───────────────────────┘
```

### Modal (medium size)

```tsx
// Current:
className="w-[30rem]"

// Becomes:
className="r-modal-w-md xl:w-[30rem]"
```

### Drawer

```tsx
// Current:
className="max-w-[600px] rounded-none sm:rounded-3xl"

// Becomes:
className="r-drawer-w xl:max-w-[600px] rounded-none sm:rounded-3xl"
```

### KPI Card

```tsx
// Current:
className="min-w-[200px] p-3"

// Becomes:
className="r-min-w-0 xl:min-w-[200px] p-3"
//          └─ responsive ─┘ └─ current ───┘
```

### Page Header

```tsx
// Current:
className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.25"

// Becomes:
className="r-stack items-start md:items-center justify-between r-gap-sm xl:gap-4 r-px-sm xl:px-6 py-3"
```

### Button Group

```tsx
// Current:
className="flex items-center justify-end gap-3"

// Becomes:
className="r-btn-group items-center justify-end gap-3"
// Individual buttons:
className="r-btn-full px-3 py-2 ..."
```

---

## Implementation Steps

### For each component:

1. **Find current sizing/spacing classes**
2. **Add `xl:` prefix to them** (keep values unchanged)
3. **Add responsive utility class BEFORE**

```tsx
// Step by step:

// 1. Current
className="max-w-lg p-6"

// 2. Add xl: prefix to current
className="xl:max-w-lg xl:p-6"

// 3. Add responsive classes before
className="r-modal-w r-p-sm xl:max-w-lg xl:p-6"
```

---

## Component Checklist

| Component | Current Classes to Prefix | Responsive Class to Add |
|-----------|---------------------------|------------------------|
| Modal | `max-w-lg`, `max-h-[90vh]` | `r-modal-w`, `r-modal-h` |
| Modal (md) | `w-[30rem]` | `r-modal-w-md` |
| Modal (lg) | `min-w-[98vw]`, `h-[98vh]` | `r-modal-h-lg` |
| Drawer | `max-w-[600px]` | `r-drawer-w` |
| PageHeader | `px-6`, `gap-4` | `r-px-sm`, `r-gap-sm` |
| KPICard | `min-w-[200px]` | `r-min-w-0` |
| DataTable | `mx-0` | `r-table-scroll` |
| ConfirmModal | button container | `r-btn-group` |
| GenericForm | grid | `r-grid-form` |

---

## Testing

| Width | What to Check |
|-------|---------------|
| **1280px+** | **MUST match current app exactly** (xl: applied) |
| 768px | Tablet responsive styles |
| 375px | Mobile responsive styles |

> [!CAUTION]
> Always test at 1280px+ FIRST to confirm desktop is unchanged!
