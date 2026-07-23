export const applyPrintWindowMeta = (
   printWindow: Window,
   title: string,
   pathPrefix = "print",
   pathSuffix?: string
) => {
   const safeTitle = title.trim() || "Print";
   const slug = safeTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
   const customSuffix = pathSuffix?.trim().replace(/\s+/g, "-");
   const resolvedSuffix = customSuffix ?? slug;
   const path = `/${pathPrefix}${
      resolvedSuffix ? `/${resolvedSuffix}` : ""
   }`;

   try {
      printWindow.document.title = safeTitle;
   } catch {
      // Ignore title errors for cross-browser safety.
   }

   try {
      printWindow.history.replaceState({}, safeTitle, path);
   } catch {
      // Some browsers may block history changes on print windows.
   }
};
