/** @format */

import { useState } from "react";
import Toggle from "@/designSystem/Toggle";
import Checkbox from "@/designSystem/Checkbox";
import SortDropdown from "@/designSystem/SortDropdown";
import { useTranslation } from "@/hooks/useTranslation";
import NotificationsSettingsHeader from "./components/NotificationsSettingsHeader";

type ReminderTimingOption = "7-days" | "14-days" | "30-days" | "60-days";

function NotificationsSettingsView() {
   const { t } = useTranslation("settings");

   // Channels state
   const [inAppNotifications, setInAppNotifications] = useState(true);

   // Events state
   const [newRequestSubmitted, setNewRequestSubmitted] = useState(false);
   const [requestApprovedOrRejected, setRequestApprovedOrRejected] =
      useState(false);
   const [contractEndingSoon, setContractEndingSoon] = useState(false);
   const [announcementPublished, setAnnouncementPublished] = useState(false);
   const [newMessageReceived, setNewMessageReceived] = useState(false);

   // Reminder timing state
   const [contractExpiryReminder, setContractExpiryReminder] =
      useState<ReminderTimingOption>("30-days");
   const [pendingRequestReminder, setPendingRequestReminder] =
      useState<ReminderTimingOption>("7-days");

   const reminderTimingOptions: Array<{
      id: ReminderTimingOption;
      label: string;
   }> = [
      { id: "7-days", label: t("notificationsSettings.reminderTiming.7days") },
      {
         id: "14-days",
         label: t("notificationsSettings.reminderTiming.14days"),
      },
      {
         id: "30-days",
         label: t("notificationsSettings.reminderTiming.30days"),
      },
      {
         id: "60-days",
         label: t("notificationsSettings.reminderTiming.60days"),
      },
   ];

   const handleSave = () => {};

   const handleCancel = () => {
      // TODO: Reset form to original values
   };

   return (
      <div className="flex flex-col gap-6">
         <NotificationsSettingsHeader
            onSave={handleSave}
            onCancel={handleCancel}
         />
         {/* Reminder Timing Section */}
         <div className="flex flex-col gap-6">
            <h3 className="text-base font-semibold text-text-strong">
               {t("notificationsSettings.reminderTiming.title")}
            </h3>
            <div className="h-px w-full bg-border rounded-full flex-none self-stretch" />
            <div className="flex flex-row gap-6">
               <div className="flex flex-col gap-1.5 flex-1">
                  <h4 className="text-base font-semibold text-text-strong">
                     {t(
                        "notificationsSettings.reminderTiming.contractExpiry.label"
                     )}
                  </h4>

                  <div className="w-full">
                     <SortDropdown
                        label={
                           reminderTimingOptions.find(
                              (opt) => opt.id === contractExpiryReminder
                           )?.label || ""
                        }
                        options={reminderTimingOptions}
                        onSelect={(id) =>
                           setContractExpiryReminder(id as ReminderTimingOption)
                        }
                     />
                  </div>
               </div>

               <div className="flex flex-col gap-1.5 flex-1">
                  <h4 className="text-base font-semibold text-text-strong">
                     {t(
                        "notificationsSettings.reminderTiming.pendingRequest.label"
                     )}
                  </h4>

                  <div className="w-full">
                     <SortDropdown
                        label={
                           reminderTimingOptions.find(
                              (opt) => opt.id === pendingRequestReminder
                           )?.label || ""
                        }
                        options={reminderTimingOptions}
                        onSelect={(id) =>
                           setPendingRequestReminder(id as ReminderTimingOption)
                        }
                     />
                  </div>
               </div>
            </div>
         </div>
         <div className="rounded-2xl bg-elevated pt-0 pr-6 pb-6 pl-0 flex flex-col gap-8">
            {/* Channels Section */}
            <div className="flex flex-col gap-6">
               <h3 className="text-base font-semibold text-text-strong">
                  {t("notificationsSettings.channels.title")}
               </h3>
               <div className="h-px w-full bg-border rounded-full flex-none self-stretch" />
               <div className="flex flex-col gap-6">
                  <Toggle
                     label={t("notificationsSettings.channels.inApp.label")}
                     description={t(
                        "notificationsSettings.channels.inApp.description"
                     )}
                     checked={inAppNotifications}
                     onChange={(e) => setInAppNotifications(e.target.checked)}
                     labelClassName="text-base font-semibold"
                  />
               </div>
            </div>

            {/* Events Section */}
            <div className="flex flex-col gap-6">
               <h3 className="text-base font-semibold text-text-strong">
                  {t("notificationsSettings.events.title")}
               </h3>
               <div className="h-px w-full bg-border rounded-full flex-none self-stretch" />
               <div className="flex flex-col gap-6">
                  <div className="flex items-start justify-between gap-4">
                     <div className="flex flex-col gap-1.5 flex-1">
                        <h4 className="text-base font-semibold text-text-strong">
                           {t("notificationsSettings.events.newRequest.label")}
                        </h4>
                        <p className="text-sm text-text-sub leading-relaxed">
                           {t(
                              "notificationsSettings.events.newRequest.description"
                           )}
                        </p>
                     </div>
                     <Checkbox
                        checked={newRequestSubmitted}
                        onChange={(e) =>
                           setNewRequestSubmitted(e.target.checked)
                        }
                     />
                  </div>

                  <div className="flex items-start justify-between gap-4">
                     <div className="flex flex-col gap-1.5 flex-1">
                        <h4 className="text-base font-semibold text-text-strong">
                           {t(
                              "notificationsSettings.events.requestDecision.label"
                           )}
                        </h4>
                        <p className="text-sm text-text-sub leading-relaxed">
                           {t(
                              "notificationsSettings.events.requestDecision.description"
                           )}
                        </p>
                     </div>
                     <Checkbox
                        checked={requestApprovedOrRejected}
                        onChange={(e) =>
                           setRequestApprovedOrRejected(e.target.checked)
                        }
                     />
                  </div>

                  <div className="flex items-start justify-between gap-4">
                     <div className="flex flex-col gap-1.5 flex-1">
                        <h4 className="text-base font-semibold text-text-strong">
                           {t(
                              "notificationsSettings.events.contractEnding.label"
                           )}
                        </h4>
                        <p className="text-sm text-text-sub leading-relaxed">
                           {t(
                              "notificationsSettings.events.contractEnding.description"
                           )}
                        </p>
                     </div>
                     <Checkbox
                        checked={contractEndingSoon}
                        onChange={(e) =>
                           setContractEndingSoon(e.target.checked)
                        }
                     />
                  </div>

                  <div className="flex items-start justify-between gap-4">
                     <div className="flex flex-col gap-1.5 flex-1">
                        <h4 className="text-base font-semibold text-text-strong">
                           {t(
                              "notificationsSettings.events.announcement.label"
                           )}
                        </h4>
                        <p className="text-sm text-text-sub leading-relaxed">
                           {t(
                              "notificationsSettings.events.announcement.description"
                           )}
                        </p>
                     </div>
                     <Checkbox
                        checked={announcementPublished}
                        onChange={(e) =>
                           setAnnouncementPublished(e.target.checked)
                        }
                     />
                  </div>

                  <div className="flex items-start justify-between gap-4">
                     <div className="flex flex-col gap-1.5 flex-1">
                        <h4 className="text-base font-semibold text-text-strong">
                           {t("notificationsSettings.events.newMessage.label")}
                        </h4>
                        <p className="text-sm text-text-sub leading-relaxed">
                           {t(
                              "notificationsSettings.events.newMessage.description"
                           )}
                        </p>
                     </div>
                     <Checkbox
                        checked={newMessageReceived}
                        onChange={(e) =>
                           setNewMessageReceived(e.target.checked)
                        }
                     />
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

export default NotificationsSettingsView;
