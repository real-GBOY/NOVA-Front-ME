/** @format */

import type { Agent } from "../types";

export const mockAgents: Agent[] = [
	{
		id: "1",
		name: "ABC Trading LLC",
		type: "Company",
		trnId: "1234-5678",
		contactNumber: "+971 50 111 2222",
		email: "contact@abctrading.com",
		status: "active",
	},
	{
		id: "2",
		name: "XYZ Services",
		type: "Company",
		trnId: "2345-6789",
		contactNumber: "+971 52 222 3333",
		email: "info@xyzservices.com",
		status: "active",
	},
	{
		id: "3",
		name: "Mohammed Ali",
		type: "Individual",
		trnId: "3456-7890",
		contactNumber: "+971 55 333 4444",
		email: "mohammed.ali@email.com",
		status: "active",
	},
	{
		id: "4",
		name: "Fatima Hassan",
		type: "Individual",
		trnId: "4567-8901",
		contactNumber: "+971 56 444 5555",
		email: "fatima.hassan@email.com",
		status: "active",
	},
	{
		id: "5",
		name: "Global Imports Co.",
		type: "Company",
		trnId: "5678-9012",
		contactNumber: "+971 50 555 6666",
		email: "sales@globalimports.com",
		status: "inactive",
	},
	{
		id: "6",
		name: "Omar Abdullah",
		type: "Individual",
		trnId: "6789-0123",
		contactNumber: "+971 52 666 7777",
		email: "omar.abdullah@email.com",
		status: "active",
	},
];
