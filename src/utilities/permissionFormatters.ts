/**
 * Formats a permission key into a human-readable string.
 * Example: "read_employee_basic" -> "Read Employee Basic"
 */
export const formatPermissionName = (permission: string): string => {
   if (!permission) return "";
   return permission
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
};
