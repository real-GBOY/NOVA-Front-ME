/** @format */

import type { Employee } from "@/services/employeeService";

// Transform API employee to table member format
export interface Member {
   id: string;
   name: string;
   email: string;
   avatar: string;
   avatarBg: string;
   jobTitle: string;
   contact: string;
   joinedAt: string;
   isPermissionOverride?: boolean;
   status: "Active" | "Inactive" | "Invited";
   role: string;
   roleIcon?: "warning" | null;
   onboardingId?: string;
}

// Helper function to transform API data
export const transformEmployeeToMember = (employee: Employee): Member => {
   const date = new Date(employee.joined_at);
   const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
   });

   // Generate a consistent avatar background color based on the employee's name
   const avatarColors = [
      "bg-bg-weak",
      "bg-information/20",
      "bg-danger/20",
      "bg-highlighted/20",
      "bg-warning/20",
      "bg-success/20",
   ];
   const colorIndex = employee.name.charCodeAt(0) % avatarColors.length;

   const transformed = {
      id: String(employee.id),
      name: employee.name,
      email: employee.email,
      avatar: employee.avatar || "/icons/defAvatar.png",
      avatarBg: avatarColors[colorIndex],
      jobTitle: employee.job_title || "-",
      contact: employee.contact || "-",
      joinedAt: formattedDate,
      isPermissionOverride: employee.permission_status === "Override",
      status: employee.status,
      role: employee.role.name,
      roleIcon: null,
   };

   return transformed;
};
