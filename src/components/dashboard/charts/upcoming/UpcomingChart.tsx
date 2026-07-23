import React from "react";
import { Pie, PieChart, Cell } from "recharts";
import { useTranslation } from "@/hooks/useTranslation";
import { useListLegalCaseTypes } from "@/hooks/legalCases/legalCase.queries";
import { useListLegalCases } from "@/hooks/legalCases/useLegalCases";
import { ChartContainer, ChartConfig } from "@/designSystem/ui/chart";
import { Calendar } from "@/Icons";

// Generate a random vibrant color
const generateRandomColor = (seed: string) => {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = seed.charCodeAt(i) + ((hash << 5) - hash);
	}
	const hue = hash % 360;
	return `hsl(${hue}, 70%, 55%)`;
};

const getTypeLabel = (value?: string) => {
	const trimmed = value?.trim();
	return trimmed && trimmed.length > 0 ? trimmed : "Other";
};

export function UpcomingChart() {
	const { t } = useTranslation("common");

	const { data: caseTypes } = useListLegalCaseTypes();
	const { data: casesResponse } = useListLegalCases({
		limit: 100,
	});

	const cases = React.useMemo(() => casesResponse?.data || [], [casesResponse?.data]);

	const stats = React.useMemo(() => {
		if (!caseTypes || caseTypes.length === 0) return [];

		// Count cases by type
		const caseCounts = new Map<string, number>();
		cases.forEach((legalCase) => {
			const typeName = legalCase.type || "Other";
			caseCounts.set(typeName, (caseCounts.get(typeName) || 0) + 1);
		});

		// Map case types to stats with counts
		return caseTypes
			.map((caseType) => {
				const typeName = getTypeLabel(caseType.name);
				const count = caseCounts.get(caseType.name || "") || 0;
				
				return {
					name: typeName,
					value: count,
					color: generateRandomColor(caseType.name || ""),
				};
			})
			.filter((stat) => stat.value > 0)
			.sort((a, b) => b.value - a.value);
	}, [caseTypes, cases]);

	const totalCases = React.useMemo(() => {
		return stats.reduce((acc, curr) => acc + curr.value, 0);
	}, [stats]);

	const chartConfig = React.useMemo<ChartConfig>(() => {
		return stats.reduce<ChartConfig>((acc, stat) => {
			acc[stat.name] = { label: stat.name, color: stat.color };
			return acc;
		}, {});
	}, [stats]);

	const headerLabel = t("charts.upcomingCases.title", "Upcoming Cases");
	const totalLabel = t("charts.upcomingCases.totalCases", "Total Cases");

	return (
	<div className="flex flex-col items-start gap-1.5 md:gap-2 xl:gap-2 p-1 md:p-1.5 xl:p-1.5 relative bg-bg-weak r-rounded xl:rounded-3xl border border-solid border-border h-full w-full">
			<div className="flex flex-col items-start gap-3 md:gap-4 xl:gap-4 r-p-sm xl:p-4 relative self-stretch w-full bg-background r-rounded xl:rounded-[20px] overflow-hidden border border-solid border-border shadow-[0px_1px_2px_0px_rgba(10,13,20,0.08)] h-full">
				{/* Header */}
				<div className="flex items-center gap-2 md:gap-3 xl:gap-3 relative shrink-0 w-full">
					<div className="bg-background border border-border rounded-lg md:rounded-[10px] xl:rounded-[10px] flex items-center p-1 md:p-1.5 xl:p-1.5 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] shrink-0">
						<Calendar className="fill-primary" size={20} />
					</div>
					<p className="font-medium leading-5 md:leading-6 xl:leading-6 text-sm md:text-base xl:text-base text-text-strong tracking-[-0.084px] md:tracking-[-0.176px] xl:tracking-[-0.176px]">
						{headerLabel}
					</p>
				</div>

				<div className="r-stack-xl w-full gap-6 md:gap-7 xl:flex-row xl:items-center xl:gap-8 xl:flex-1">
					{/* Chart */}
					<div className="relative w-full xl:flex-1 xl:w-auto">
						<ChartContainer
							config={chartConfig}
							className="h-[220px] sm:h-[240px] xl:h-[240px] w-full">
							<PieChart>
								<Pie
									data={stats}
									cx="50%"
									cy="50%"
									innerRadius={85}
									outerRadius={110}
									paddingAngle={2}
									dataKey="value"
									strokeWidth={0}
									stroke="none">
									{stats.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
							</PieChart>
						</ChartContainer>

						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
							<div className="text-4xl sm:text-5xl xl:text-5xl font-bold text-text-strong tracking-[-0.4px]">
								{totalCases}
							</div>
							<div className="text-xs sm:text-sm xl:text-sm text-text-sub mt-1 font-medium">
								{totalLabel}
							</div>
						</div>
					</div>

					{/* Legend/Stats */}
					<div className="flex flex-col gap-3 md:gap-4 w-full xl:w-auto xl:gap-5 xl:justify-center xl:flex-1">
						{stats.map((item, index) => {
							const caseLabel =
								item.value === 1
									? t("charts.upcomingCases.caseLabelSingular", "Case")
									: t("charts.upcomingCases.caseLabelPlural", "Cases");
							return (
								<div key={index} className="flex flex-col gap-0.5 md:gap-1 xl:gap-1">
									<div className="flex items-center gap-1.5 md:gap-2 xl:gap-2">
										<div
											className="h-2.5 w-1 rounded-full xl:h-3"
											style={{ backgroundColor: item.color }}
										/>
										<span className="text-sm md:text-base xl:text-base font-medium text-text-sub capitalize tracking-[-0.084px] md:tracking-[-0.176px] xl:tracking-[-0.176px] xl:whitespace-nowrap">
											{item.name}
										</span>
									</div>
									<div className="flex items-center gap-1.5 md:gap-2 xl:gap-2">
										<span className="text-lg sm:text-xl xl:text-2xl font-medium text-text-strong leading-6 sm:leading-7 xl:leading-8 w-10 sm:w-12 xl:w-12">
											{item.value}
										</span>
										<span className="text-sm md:text-base xl:text-base font-medium text-text-sub tracking-[-0.084px] md:tracking-[-0.176px] xl:tracking-[-0.176px]">
											{caseLabel}
										</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
