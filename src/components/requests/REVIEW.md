<!-- @format -->

# Requests Module - Code Review & Recommendations

## 📁 Current Structure Assessment

### ✅ **Strengths**

1. **Well-organized folder structure:**

   ```
   requests/
   ├── modals/          ✅ Separated modal components
   ├── columns/         ✅ Table column definitions
   ├── ui/              ✅ Reusable UI components
   ├── utils/           ✅ Utility functions
   ├── constants.ts     ✅ Shared constants
   └── index.ts         ✅ Barrel exports
   ```

2. **Good separation of concerns:**

   - Modals are separated from main components
   - Column definitions are isolated
   - Utilities are centralized
   - UI components are reusable

3. **Design system integration:**
   - ✅ Using `Modal`, `DetailCard`, `Button`, `BadgeTag`
   - ✅ Using `DataTable` from design system
   - ✅ Using `PageHeader`, `KPICard`
   - ✅ Using `SortDropdown`

## ⚠️ **Issues Found**

### 1. **Hardcoded Colors (Design System Violation)**

- **Location:** `columns/attendanceColumns.tsx`, `columns/overtimeColumns.tsx`, `columns/timeOffColumns.tsx`
- **Issue:** Using `bg-[#ffebed]` instead of design system color
- **Impact:** Breaks dark mode, inconsistent styling
- **Fix:** Replace with design system color token (e.g., `bg-error/10` or create a danger-light variant)

### 2. **Missing Button Component Usage**

- **Location:** `ui/RequestsToolbar.tsx` (line 52)
- **Issue:** Tab buttons use raw `<button>` instead of `Button` component
- **Impact:** Inconsistent button styling across the app

### 3. **Missing Search Input Component**

- **Location:** `ui/RequestsToolbar.tsx` (line 69)
- **Issue:** Using raw `<input>` instead of a reusable search component
- **Impact:** No consistent search input styling

### 4. **Inconsistent Border Color**

- **Location:** `ui/RequestsToolbar.tsx` (line 67)
- **Issue:** Using `border-stroke-sub-300` instead of `border-border`
- **Impact:** Inconsistent with design system

### 5. **Unused Type Prop**

- **Location:** `modals/RequestDetailModal.tsx`
- **Issue:** `type` prop is defined but never used
- **Impact:** Dead code, potential confusion

### 6. **Missing Type Exports**

- **Location:** `index.ts`
- **Issue:** `RequestModalType` is not exported
- **Impact:** Can't reuse the type elsewhere

## 🔧 **Recommended Improvements**

### **Priority 1: Critical (Design System Compliance)**

1. **Replace hardcoded colors:**

   ```tsx
   // ❌ Current
   className = "!p-1 !bg-[#ffebed] !border-0";

   // ✅ Should be
   className = "!p-1 !bg-error/10 !border-0";
   // OR create a danger-light variant in Button component
   ```

2. **Use Button component for tabs:**

   ```tsx
   // Create a Tabs component or use Button with variant="ghost"
   ```

3. **Create/Use SearchInput component:**
   ```tsx
   // Extract search input to reusable component
   // Or use design system Input component if available
   ```

### **Priority 2: Structure Improvements**

4. **Create shared components folder:**

   ```
   ui/
   ├── shared/          # Components used across multiple features
   │   ├── SearchInput.tsx
   │   └── Tabs.tsx
   └── requests/        # Request-specific components
       ├── AttachmentDisplay.tsx
       ├── GpsStatusBadge.tsx
       └── ...
   ```

5. **Extract common column patterns:**

   ```tsx
   // Create shared column components:
   // - MemberNameColumn
   // - StatusColumn (with approve/reject actions)
   // - DateColumn
   ```

6. **Create modal content builders:**
   ```tsx
   // Instead of duplicating field rendering:
   // - create FieldRow component
   // - create MemberInfoDisplay component
   ```

### **Priority 3: Code Quality**

7. **Add TypeScript strict types:**

   - Export `RequestModalType` from index.ts
   - Create proper type guards for request types

8. **Extract magic strings:**

   ```tsx
   // Move to constants.ts:
   // - Request statuses: "Pending", "Approved", "Rejected"
   // - Request types: "Clock-In", "Clock-Out", etc.
   // - GPS statuses: "In zone", "Out of zone"
   ```

9. **Create custom hooks:**
   ```tsx
   // Extract logic from RequestsContent:
   // - useRequestFilters()
   // - useRequestModals()
   // - useRequestData()
   ```

## 📋 **Action Items Checklist**

### **Immediate (Design System Compliance)**

- [ ] Replace `bg-[#ffebed]` with design system color
- [ ] Replace tab buttons with Button component
- [ ] Fix `border-stroke-sub-300` to `border-border`
- [ ] Remove unused `type` prop or use it

### **Short-term (Structure)**

- [ ] Create SearchInput component
- [ ] Create Tabs component (or use Button variants)
- [ ] Export `RequestModalType` from index.ts
- [ ] Extract magic strings to constants

### **Long-term (Code Quality)**

- [ ] Create shared column components
- [ ] Extract modal field rendering components
- [ ] Create custom hooks for request logic
- [ ] Add comprehensive TypeScript types

## 🎯 **Design System Best Practices**

### **✅ Currently Following:**

- Using design system components (Modal, Button, BadgeTag, etc.)
- Consistent folder structure
- Barrel exports for clean imports
- Separation of concerns

### **❌ Needs Improvement:**

- Hardcoded colors (use design tokens)
- Raw HTML elements instead of components
- Inconsistent border colors
- Missing reusable input components

## 📊 **Structure Score: 8.5/10**

**Breakdown:**

- Organization: 9/10 ✅
- Design System Usage: 7/10 ⚠️ (hardcoded colors, missing components)
- Code Reusability: 9/10 ✅
- Type Safety: 8/10 ⚠️ (missing exports)
- Maintainability: 9/10 ✅

## 🚀 **Next Steps**

1. **Fix design system violations** (Priority 1)
2. **Create missing reusable components** (Priority 2)
3. **Refactor for better code organization** (Priority 3)
4. **Add comprehensive documentation** (Nice to have)
