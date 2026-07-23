/** @format */

import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import AuthLayout from "@/layouts/AuthLayout";
import SettingsPage from "@/pages/settings";
import MemberProfilePage from "@/pages/dashboard/members/profile";
import MembersPage from "@/pages/dashboard/members";
import DashboardPage from "@/pages/dashboard";
import ReportsPage from "@/pages/dashboard/reports";
import HelpSupportPage from "@/pages/dashboard/helpSupport";
import TicketChatPage from "@/pages/dashboard/helpSupport/ticketChat";
import ContractsPage from "@/pages/dashboard/contracts";
import RequestsPage from "@/pages/dashboard/requests";
import VouchersPage from "@/pages/dashboard/vouchers";
import LegalCasesPage from "@/pages/dashboard/legalCases";
import LegalCaseDetailsPage from "@/pages/dashboard/legalCases/details";
import LoansAdvancesPage from "@/pages/dashboard/loansAdvances";
import CommunicationPage from "@/pages/dashboard/Messages/Messages";
import TermsAndConditionsPage from "@/pages/dashboard/termsAndConditions";

import UnauthorizedPage from "@/pages/UnauthorizedPage";
import NotFoundPage from "@/pages/NotFoundPage";
import LoginPage from "@/pages/auth/Login";
import ForgotPasswordPage from "@/pages/auth/ForgotPassword";
import VerificationCodePage from "@/pages/auth/VerificationCode";
import CompletePasswordPage from "@/pages/auth/CompletePassword";
import ResetPasswordPage from "@/pages/auth/ResetPassword";
import PermissionRoute from "./PermissionRoute";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import PayrollsPage from "@/pages/dashboard/payrolls";
import DocumentationPage from "@/pages/dashboard/documentation";

function AppRoutes() {
   return (
      <Routes>
         {/* Public Routes - Redirect to dashboard if already authenticated */}
         <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
               <Route path="/login" element={<LoginPage />} />
               <Route path="/forgot-password" element={<ForgotPasswordPage />} />
               <Route
                  path="/verification-code"
                  element={<VerificationCodePage />}
               />
               <Route
                  path="/complete-password"
                  element={<CompletePasswordPage />}
               />
               <Route
                  path="/reset-password"
                  element={<ResetPasswordPage />}
               />
            </Route>
         </Route>

         <Route
            path="/"
            element={<Navigate to="/dashboard/members" replace />}
         />

         {/* Protected Routes - Require authentication */}
         <Route element={<ProtectedRoute />}>
            {/* Dashboard Layout Routes */}
            <Route element={<DashboardLayout />}>
               <Route path="/dashboard">
                  <Route
                     index
                     element={
                        <PermissionRoute
                           permission="dashboard.view"
                           redirectPath="/dashboard/messages">
                           <DashboardPage />
                        </PermissionRoute>
                     }
                  />

                  {/* Members Routes */}
                  <Route path="members">
                     <Route index element={<MembersPage />} />
                     <Route
                        path="profile/:id"
                        element={
                           <PermissionRoute permission="read_employee_detailed" allowOwnProfile={true}>
                              <MemberProfilePage />
                           </PermissionRoute>
                        }
                     />
                  </Route>

                  <Route path="contracts" element={<ContractsPage />} />

                  <Route path="requests" element={<RequestsPage />} />
                  <Route path="payrolls" element={<PayrollsPage />} />
                  <Route
                     path="reports"
                     element={
                        <PermissionRoute permission="reports.view">
                           <ReportsPage />
                        </PermissionRoute>
                     }
                  />

                  <Route path="vouchers" element={<VouchersPage />} />

                  <Route path="legal-cases">
                     <Route index element={<LegalCasesPage />} />
                     <Route
                        path=":id"
                        element={
                           <PermissionRoute
                              permission="read_legal_case">
                              <LegalCaseDetailsPage />
                           </PermissionRoute>
                        }
                     />
                  </Route>

                  <Route
                     path="loans-advances"
                     element={<LoansAdvancesPage />}
                  />
                  <Route path="messages" element={<CommunicationPage />} />
                  <Route path="help-support">
                     <Route index element={<HelpSupportPage />} />
                     <Route path="ticket/:ticketId" element={<TicketChatPage />} />
                  </Route>
                  <Route path="terms-and-conditions" element={<TermsAndConditionsPage />} />
                  <Route path="documentation" element={<DocumentationPage />} />
               </Route>
            </Route>

            <Route path="/settings">
               <Route
                  index
                  element={<Navigate to="/settings/general" replace />}
               />
               <Route path=":tab" element={<SettingsPage />} />
            </Route>
         </Route>

         {/* Error Pages */}
         <Route path="/unauthorized" element={<UnauthorizedPage />} />
         <Route path="/403" element={<UnauthorizedPage />} />
         <Route path="/404" element={<NotFoundPage />} />

         {/* 404 Catch-all - must be last */}
         <Route path="*" element={<NotFoundPage />} />
      </Routes>
   );
}

export default AppRoutes;
