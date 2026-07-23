import { DetailSectionData } from "../types";

export const getDetailSections = (t: (key: string) => string): DetailSectionData[] => [
   {
      id: "personal",
      title: t("profile.details.personal.title"),
      items: [
         { label: t("fields.fullName"), value: "Mohab" },
         { label: t("fields.gender"), value: t("options.gender.male") },
         { label: t("fields.dob"), value: "18/11/2002" },
         { label: t("fields.age"), value: "23" },
         { label: t("fields.nationality"), value: "Egyptian" },
         {
            label: t("fields.maritalStatus"),
            value: t("options.maritalStatus.single"),
         },
         { label: t("fields.location"), value: "Egypt/Monufia" },
      ],
   },
   {
      id: "work",
      title: t("profile.details.work.title"),
      items: [
         { label: t("fields.jobTitle"), value: "Product Designer" },
         { label: t("fields.team"), value: "Design Team" },
         {
            label: t("fields.manager"),
            value: "Ali Osama Hassan",
            badge: true,
         },
         { label: t("fields.role"), value: "Admin" },
         {
            label: t("fields.permissions"),
            value: "Default",
            link: "#",
            highlighted: true,
            variant: "highlightedText",
         },
         { label: t("fields.memberId"), value: "#AD442" },
         { label: t("fields.startDate"), value: "16/11/2025" },
         { label: t("fields.endDate"), value: "1/12/2025" },
      ],
   },
   {
      id: "address",
      title: t("profile.details.address.title"),
      items: [
         {
            label: t("fields.address"),
            value: "12 Al Zahra Street, Apartment 14",
            link: "https://maps.google.com/?q=12+Al+Zahra+Street,+Apartment+14,+Dubai",
            isExternalLink: true,
         },
         { label: t("fields.country"), value: "United Arab Emirates" },
      ],
   },
];
