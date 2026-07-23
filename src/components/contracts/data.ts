/** @format */

export interface Contract {
   id: string;
   contractName: string;
   assignedTo: {
      id: string;
      name: string;
      avatar: string;
      jobTitle: string;
      avatarBg?: string;
   };
   status: "Active" | "Near Expired" | "Expired" | "Terminated";
   contractDuration: {
      years: number;
      months?: number; // Add months for durations less than a year
      startDate: string;
      endDate: string;
      progress: number; // 0 to 100
   };
   contractAmount: number;
}

export const contractsData: Contract[] = [
   // ACTIVE CONTRACTS (< 80% progress)
   {
      id: "#XY123",
      contractName: "Confidentiality Agreement",
      assignedTo: {
         id: "0",
         name: "Mohab Marwan",
         avatar: "/icons/defAvatar.png",
         jobTitle: "Product Designer",
         avatarBg: "bg-bg-weak",
      },
      status: "Active",
      contractDuration: {
         years: 2,
         startDate: "15 Jan, 2024",
         endDate: "15 Dec, 2026",
         progress: 20,
      },
      contractAmount: 28500,
   },
   {
      id: "#CD789",
      contractName: "Innovation Collaboration Agreement",
      assignedTo: {
         id: "0",
         name: "Gamila Ibrahim",
         avatar: "/icons/defAvatar.png",
         jobTitle: "Copywriter",
         avatarBg: "bg-danger/20",
      },
      status: "Active",
      contractDuration: {
         years: 2,
         startDate: "1 Jan, 2025",
         endDate: "1 Jan, 2027",
         progress: 30,
      },
      contractAmount: 19300,
   },
   {
      id: "#EF012",
      contractName: "Equity Partnership Agreement",
      assignedTo: {
         id: "0",
         name: "Mahmoud Khedr",
         avatar: "/icons/defAvatar.png",
         jobTitle: "Back-end Developer",
         avatarBg: "bg-highlighted/20",
      },
      status: "Active",
      contractDuration: {
         years: 3,
         startDate: "1 Jun, 2025",
         endDate: "1 Jun, 2028",
         progress: 10,
      },
      contractAmount: 45000,
   },
   {
      id: "#GH345",
      contractName: "Strategic Partnership Agreement",
      assignedTo: {
         id: "0",
         name: "Muhammed Sabri",
         avatar: "/icons/defAvatar.png",
         jobTitle: "Sales Representative",
         avatarBg: "bg-highlighted/20",
      },
      status: "Active",
      contractDuration: {
         years: 2,
         startDate: "1 May, 2025",
         endDate: "1 May, 2027",
         progress: 40,
      },
      contractAmount: 69420,
   },
   {
      id: "#IJ678",
      contractName: "Business Alliance Agreement",
      assignedTo: {
         id: "0",
         name: "Mahmoud Muhammed",
         avatar: "/icons/defAvatar.png",
         jobTitle: "Back-end Developer",
         avatarBg: "bg-warning/20",
      },
      status: "Active",
      contractDuration: {
         years: 2,
         startDate: "15 Aug, 2025",
         endDate: "15 Aug, 2027",
         progress: 25,
      },
      contractAmount: 22150,
   },

   // NEAR EXPIRED CONTRACTS (80-99% progress)
   {
      id: "#AB456",
      contractName: "Joint Venture Contract",
      assignedTo: {
         id: "0",
         name: "Ahmed Tawfik",
         avatar: "/icons/defAvatar.png",
         jobTitle: "HR Manager",
         avatarBg: "bg-information/20",
      },
      status: "Near Expired",
      contractDuration: {
         years: 2,
         startDate: "1 Jan, 2024",
         endDate: "28 Feb, 2026",
         progress: 90,
      },
      contractAmount: 32750,
   },
   {
      id: "#ST123",
      contractName: "Consulting Services Agreement",
      assignedTo: {
         id: "0",
         name: "Ahmed Tawfik",
         avatar: "/icons/defAvatar.png",
         jobTitle: "HR Manager",
         avatarBg: "bg-information/20",
      },
      status: "Near Expired",
      contractDuration: {
         years: 2,
         startDate: "10 Feb, 2024",
         endDate: "20 Jan, 2026",
         progress: 85,
      },
      contractAmount: 21900,
   },
   {
      id: "#UV456",
      contractName: "Franchise Agreement",
      assignedTo: {
         id: "0",
         name: "Gamila Ibrahim",
         avatar: "/icons/defAvatar.png",
         jobTitle: "Copywriter",
         avatarBg: "bg-danger/20",
      },
      status: "Near Expired",
      contractDuration: {
         years: 2,
         startDate: "1 Feb, 2024",
         endDate: "31 Dec, 2025",
         progress: 92,
      },
      contractAmount: 29400,
   },

   // EXPIRED CONTRACTS (100%+ progress)
   {
      id: "#KL901",
      contractName: "Service Level Agreement",
      assignedTo: {
         id: "0",
         name: "Yousef Ahmed",
         avatar: "/icons/defAvatar.png",
         jobTitle: "Back-end Developer",
         avatarBg: "bg-bg-weak",
      },
      status: "Expired",
      contractDuration: {
         years: 2,
         startDate: "1 Jan, 2023",
         endDate: "1 Jan, 2025",
         progress: 100,
      },
      contractAmount: 30000,
   },
   {
      id: "#MN234",
      contractName: "Operational Collaboration Agreement",
      assignedTo: {
         id: "0",
         name: "Radwa Ali",
         avatar: "/icons/defAvatar.png",
         jobTitle: "Product Manager",
         avatarBg: "bg-success/20",
      },
      status: "Expired",
      contractDuration: {
         years: 2,
         startDate: "15 Jun, 2022",
         endDate: "15 Jun, 2024",
         progress: 100,
      },
      contractAmount: 26800,
   },
   {
      id: "#OP567",
      contractName: "Resource Sharing Contract",
      assignedTo: {
         id: "0",
         name: "Fatima ElSayed",
         avatar: "/icons/defAvatar.png",
         jobTitle: "Video Editor",
         avatarBg: "bg-warning/20",
      },
      status: "Expired",
      contractDuration: {
         years: 2,
         startDate: "10 Mar, 2023",
         endDate: "10 Oct, 2025",
         progress: 100,
      },
      contractAmount: 34200,
   },
   {
      id: "#QR890",
      contractName: "Corporate Synergy Contract",
      assignedTo: {
         id: "0",
         name: "Mohab Marwan",
         avatar: "/icons/defAvatar.png",
         jobTitle: "Product Designer",
         avatarBg: "bg-bg-weak",
      },
      status: "Expired",
      contractDuration: {
         years: 1,
         startDate: "1 Jun, 2023",
         endDate: "1 Aug, 2024",
         progress: 100,
      },
      contractAmount: 40500,
   },
];
