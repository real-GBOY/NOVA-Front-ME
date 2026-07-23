/** @format */

import { useTranslation } from "@/hooks/useTranslation";

type SettingsPlaceholderProps = {
   tabTitle?: string;
};

function SettingsPlaceholder({ tabTitle }: SettingsPlaceholderProps) {
   const { t } = useTranslation("settings");
   const label =
      tabTitle && tabTitle.trim().length > 0
         ? tabTitle
         : t("placeholder.defaultTab");

   return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-bg-weak text-center">
         <p className="text-base font-semibold text-text-strong">
            {t("placeholder.comingSoon", { tab: label })}
         </p>
         <p className="mt-2 max-w-md text-sm font-normal text-text-soft">
            {t("placeholder.description")}
         </p>
      </div>
   );
}

export default SettingsPlaceholder;
