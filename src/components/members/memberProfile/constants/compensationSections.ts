import { DetailSectionData } from "../types";

export const getCompensationSections = (
   t: (key: string) => string
): DetailSectionData[] => [
   {
      id: "compensation",
      title: t("profile.details.compensation.title"),
      items: [
         { label: t("fields.salary"), value: "12,000" },
         {
            label: t("fields.contractType"),
            value: t("options.contractType.fullTime"),
         },
         { label: t("fields.workHours"), value: "40" },
      ],
   },
   {
      id: "contact",
      title: t("profile.details.contact.title"),
      items: [
         {
            label: t("fields.mobile"),
            value: "+971 56 345 6789",
            link: "tel:+971563456789",
            highlighted: true,
            variant: "pill",
         },
         {
            label: t("fields.email"),
            value: "mohab.marwan72@gmail.com",
            link: "mailto:mohab.marwan72@gmail.com",
            highlighted: true,
            variant: "pill",
         },
      ],
   },
];
