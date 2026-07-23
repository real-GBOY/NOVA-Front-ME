/** @format */

import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import BadgeTag from "@/designSystem/BadgeTag";
import Avatar from "@/designSystem/Avatar";
import LoadingState from "@/designSystem/LoadingState";
import { useTranslation } from "@/hooks/useTranslation";
import { useTickets } from "@/hooks/support/useTickets";
import MemberTag1 from "@/components/contracts/MemberTag1";
import { buildMediaUrl } from "@/components/communication/utils";
import type { Ticket } from "./types";

type TicketDetailsModalProps = {
   ticket: Ticket | null;
   isOpen: boolean;
   onClose: () => void;
   canResolve?: boolean;
};

function TicketDetailsModal({
   ticket,
   isOpen,
   onClose,
   canResolve = false,
}: TicketDetailsModalProps) {
   const { t } = useTranslation("helpSupport");
   const { useGetTicketById, useUpdateTicketStatus } = useTickets();

   // Fetch full ticket details when modal opens
   const { data: ticketDetails, isLoading } = useGetTicketById(
      ticket?.ticket_id || 0,
      {
         enabled: isOpen && !!ticket?.ticket_id,
      }
   );

   const updateStatusMutation = useUpdateTicketStatus();

   if (!ticket) return null;

   // Use detailed data if available, otherwise fall back to list data
   const displayTicket = ticketDetails || ticket;

   const getStatusVariant = (
      status: Ticket["status"]
   ): "success" | "info" | "warning" => {
      const variantMap: Record<
         Ticket["status"],
         "success" | "info" | "warning"
      > = {
         Resolved: "success",
         In_Progress: "info",
         Open: "warning",
      };
      return variantMap[status] || "warning";
   };

   // Convert status to translation key
   const getStatusKey = (status: Ticket["status"]) => {
      return status === "In_Progress"
         ? "inProgress"
         : String(status || "").toLowerCase();
   };

   const resolveAttachmentUrl = (url?: string | null) => {
      if (!url) return null;
      return url.startsWith("http") ? url : buildMediaUrl(url);
   };

   const getAttachmentLabel = (
      attachment: NonNullable<typeof ticketDetails>["attachments"][number],
      index: number
   ) => {
      return (
         attachment?.file_name ||
         (attachment?.file_id ? `File ${attachment.file_id}` : null) ||
         `Attachment ${index + 1}`
      );
   };

   const handleMarkAsResolved = async () => {
      if (!canResolve) {
         console.error("User doesn't have permission to resolve tickets");
         return;
      }

      if (displayTicket.status !== "Resolved") {
         try {
            const payload = {
               status: "Resolved" as const,
               resolution_notes: "Marked as resolved from details modal",
            };
            await updateStatusMutation.mutateAsync({
               id: displayTicket.ticket_id,
               payload,
            });
            onClose();
         } catch (error) {
            console.error("Failed to update ticket status:", error);
         }
      }
   }; // Generate random background color for default avatar
   const getRandomColor = (name: string) => {
      const colors = [
         "bg-blue-500",
         "bg-green-500",
         "bg-purple-500",
         "bg-pink-500",
         "bg-orange-500",
         "bg-teal-500",
         "bg-indigo-500",
      ];
      const index = name.charCodeAt(0) % colors.length;
      return colors[index];
   };

   // Get initials from name
   const getInitials = (name: string) => {
      const names = name.split(" ");
      if (names.length >= 2) {
         return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
   };

   return (
      <Modal
         isOpen={isOpen}
         onClose={onClose}
         title={t("details.title")}
         size="medium"
         showHeaderDivider={false}
         footer={
            <div className="flex items-center justify-end gap-3 w-full">
               <Button
                  variant="secondary"
                  onClick={onClose}
                  className="px-3 py-2 text-sm">
                  {t("details.cancel")}
               </Button>
               {displayTicket.status !== "Resolved" && canResolve && (
                  <Button
                     onClick={handleMarkAsResolved}
                     disabled={updateStatusMutation.isPending}
                     className="px-3 py-2 text-sm">
                     {updateStatusMutation.isPending
                        ? t("details.updating")
                        : t("details.markAsResolved")}
                  </Button>
               )}
            </div>
         }>
         {isLoading ? (
            <LoadingState
               size="medium"
               label={t("loading")}
               minHeight="200px"
            />
         ) : (
            <div className="bg-bg-weak border border-border rounded-2xl p-3 flex flex-col gap-4 shadow-subtle">
               {/* Ticket ID */}
               <div className="flex flex-col gap-2">
                  <label className="text-sm text-text-sub">
                     {t("details.ticketId")}
                  </label>
                  <p className="text-base font-normal text-text-strong">
                     {displayTicket.ticket_code}
                  </p>
               </div>

               {/* Requested By */}
               {ticketDetails?.requested_by ? (
                  <div className="flex flex-col gap-2">
                     <label className="text-sm text-text-sub">
                        {t("details.requestedBy")}
                     </label>

                     <div className="flex items-center gap-2">
                        {displayTicket.requested_by?.avatar_url ? (
                           <Avatar
                              alt={displayTicket.requested_by.name}
                              src={displayTicket.requested_by.avatar_url}
                              size="sm"
                           />
                        ) : (
                           <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${getRandomColor(
                                 displayTicket.requested_by?.name ?? "?"
                              )}`}>
                              {getInitials(
                                 displayTicket.requested_by?.name ?? "?"
                              )}
                           </div>
                        )}

                        <div>
                           <p className="text-sm text-text-strong">
                              {displayTicket.requested_by?.name}
                           </p>
                           {displayTicket.requested_by?.job_title && (
                              <p className="text-xs text-text-soft">
                                 {displayTicket.requested_by.job_title}
                              </p>
                           )}
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="flex flex-col gap-2">
                     <label className="text-sm text-text-sub">
                        {t("details.requestedBy")}
                     </label>
                     <p className="text-sm text-text-sub">-</p>
                  </div>
               )}

               {/* CC */}
               <div className="flex flex-col gap-2">
                  <label className="text-sm text-text-sub">
                     {t("details.cc")}
                  </label>
                  {ticketDetails?.cc_employees?.length ? (
                     <div className="flex flex-wrap gap-2">
                        {ticketDetails.cc_employees.map((employee) => (
                           <MemberTag1
                              key={employee.employee_id}
                              name={employee.name}
                              jobTitle={employee.job_title}
                              avatar={employee.avatar_url}
                              variant="tag"
                              size="xs"
                              showJobTitle={false}
                           />
                        ))}
                     </div>
                  ) : (
                     <p className="text-sm text-text-sub">-</p>
                  )}
               </div>

               {/* Subject */}
               <div className="flex flex-col gap-2">
                  <label className="text-sm text-text-sub">
                     {t("details.subject")}
                  </label>
                  <p className="text-base font-normal text-text-strong">
                     {displayTicket.subject}
                  </p>
               </div>

               {/* Description */}
               {ticketDetails?.description && (
                  <div className="flex flex-col gap-2">
                     <label className="text-sm text-text-sub">
                        {t("details.description")}
                     </label>
                     <p className="text-base font-normal text-text-strong whitespace-pre-wrap">
                        {ticketDetails.description}
                     </p>
                  </div>
               )}

               {/* Attachments */}
               <div className="flex flex-col gap-2">
                  <label className="text-sm text-text-sub">
                     {t("details.attachments", "Attachments")}
                  </label>
                  {ticketDetails?.attachments?.length ? (
                     <div className="flex flex-col gap-2">
                        {ticketDetails.attachments.map((attachment, index) => {
                           const url =
                              resolveAttachmentUrl(attachment.file_url) || "";
                           const label = getAttachmentLabel(
                              attachment,
                              index
                           );
                           return url ? (
                              <a
                                 key={`${attachment.file_id ?? label}-${index}`}
                                 href={url}
                                 target="_blank"
                                 rel="noreferrer"
                                 className="text-sm text-primary underline underline-offset-2">
                                 {label}
                              </a>
                           ) : (
                              <p
                                 key={`${attachment.file_id ?? label}-${index}`}
                                 className="text-sm text-text-sub">
                                 {label}
                              </p>
                           );
                        })}
                     </div>
                  ) : (
                     <p className="text-sm text-text-sub">-</p>
                  )}
               </div>

               {/* Category */}
               <div className="flex flex-col gap-2">
                  <label className="text-sm text-text-sub">
                     {t("details.category")}
                  </label>
                  <p className="text-base font-normal text-text-strong capitalize">
                     {displayTicket.category}
                  </p>
               </div>

               {/* Priority */}
               {ticketDetails && (
                  <div className="flex flex-col gap-2">
                     <label className="text-sm text-text-sub">
                        {t("details.priority")}
                     </label>
                     <p className="text-base font-normal text-text-strong capitalize">
                        {ticketDetails.priority}
                     </p>
                  </div>
               )}

               {/* Type */}
               {ticketDetails && (
                  <div className="flex flex-col gap-2">
                     <label className="text-sm text-text-sub">
                        {t("details.type")}
                     </label>
                     <p className="text-base font-normal text-text-strong capitalize">
                        {ticketDetails.type}
                     </p>
                  </div>
               )}

               {/* Status */}
               <div className="flex flex-col gap-2">
                  <label className="text-sm text-text-sub">
                     {t("details.status")}
                  </label>
                  <BadgeTag
                     label={t(`status.${getStatusKey(displayTicket.status)}`)}
                     variant={getStatusVariant(displayTicket.status)}
                     size="sm"
                  />
               </div>
            </div>
         )}
      </Modal>
   );
}

export default TicketDetailsModal;
