/** @format */

import { FormEvent, useMemo, useState } from "react";
import Button from "@/designSystem/Button";
import Loader from "@/designSystem/Loader";
import { useTranslation } from "@/hooks/useTranslation";
import toast from "@/utilities/toast";
import {
	useCreateLegalCaseType,
	useListLegalCaseTypes,
} from "@/hooks/legalCases/legalCase.queries";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";
import { isEnglishText, cn } from "@/utilities/index";

function CaseTypesView() {
	const { t } = useTranslation(["settings", "common"]);
	const { can } = usePermissions();
	const canViewCaseTypes =
		can("read_legal_case_type") || can("create_legal_case_type");
	const canCreateCaseTypes = can("create_legal_case_type");
	const { data: caseTypes, isLoading: isLoadingTypes } =
		useListLegalCaseTypes();
	const createTypeMutation = useCreateLegalCaseType();

	const [newTypeName, setNewTypeName] = useState("");
	const [formError, setFormError] = useState("");

	const sortedCaseTypes = useMemo(() => {
		return (caseTypes || [])
			.slice()
			.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
	}, [caseTypes]);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		if (!canCreateCaseTypes) return;
		event.preventDefault();
		const trimmedName = newTypeName.trim();
		if (!trimmedName) {
			setFormError(t("validation.required", "This field is required"));
			return;
		}

		setFormError("");
		try {
			await createTypeMutation.mutateAsync({ name: trimmedName });
			setNewTypeName("");
			toast.success(t("messages.createSuccess", "Created successfully"));
		} catch (error) {
			console.error("Failed to create case type", error);
			toast.error(
				t(
					"messages.errorOccurred",
					"An error occurred. Please try again."
				)
			);
		}
	};

	return (
		<div className='flex flex-col gap-6 '>
			{!canViewCaseTypes ? (
				<div className='p-6'>
					<NoPermissionMessage
						message={t("permissions.noReadAccess.title", "Access Restricted")}
						description={`${t(
							"permissions.noReadAccess.message",
							"You don't have permission to view this section."
						)} (Missing: ${formatPermissionName("read_legal_case_type")})`}
					/>
				</div>
			) : (
				<>
					<div className='flex flex-col gap-1'>
						<h3 className='text-lg font-semibold text-text-strong'>
							{t("companySettings.caseTypes.title")}
						</h3>
						<p className='text-sm text-text-sub'>
							{t("companySettings.caseTypes.description")}
						</p>
					</div>
					<div
						className={`grid gap-6 ${
							canCreateCaseTypes ? "lg:grid-cols-[3fr_1.3fr]" : ""
						}`}>
						<section className='rounded-2xl border border-border bg-surface p-6 flex flex-col gap-4'>
							<div className='flex items-center justify-between gap-2'>
								<h4 className='text-sm font-semibold text-text-strong'>
									{t("companySettings.caseTypes.table.title")}
								</h4>
							</div>
							<div className=''>
								{isLoadingTypes ? (
									<div className='flex items-center justify-center py-8'>
										<Loader
											label={t("companySettings.caseTypes.helpers.loading")}
										/>
									</div>
								) : sortedCaseTypes.length ? (
									<div className='overflow-hidden rounded-2xl border border-border bg-background text-text-soft'>
										<div className='overflow-x-auto'>
											<table className='min-w-full divide-y divide-border text-sm'>
												<thead>
													<tr className='text-left text-[11px] uppercase tracking-[0.12em] text-text-sub'>
														<th className='px-4 py-2 font-semibold'>
															{t("companySettings.caseTypes.table.id")}
														</th>
														<th className='px-4 py-2 font-semibold'>
															{t("companySettings.caseTypes.table.name")}
														</th>
													</tr>
												</thead>
												<tbody className='divide-y divide-border'>
													{sortedCaseTypes.map((type) => (
														<tr key={type.type_id}>
															<td
																className={cn(
																	"px-4 py-3 text-text-strong",
																	isEnglishText(type.type_id) && "font-english"
																)}>
																{type.type_id}
															</td>
															<td
																className={cn(
																	"px-4 py-3 text-text-strong",
																	isEnglishText(type.name) && "font-english"
																)}>
																{type.name}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								) : (
									<p className='text-sm text-text-sub'>
										{t("companySettings.caseTypes.table.noResults")}
									</p>
								)}
							</div>
						</section>
						{canCreateCaseTypes && (
							<section className='rounded-2xl border border-border bg-surface p-6 flex flex-col gap-4'>
								<form onSubmit={handleSubmit} className='flex flex-col gap-3'>
									<div className='flex flex-col gap-1'>
										<label className='text-xs font-medium text-text-sub'>
											{t("companySettings.caseTypes.form.label")}
										</label>
										<input
											type='text'
											value={newTypeName}
											onChange={(event) => setNewTypeName(event.target.value)}
											placeholder={t(
												"companySettings.caseTypes.form.placeholder"
											)}
											className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary'
										/>
										{formError ? (
											<p className='text-xs text-danger'>{formError}</p>
										) : (
											<p className='text-xs text-text-sub'>
												{t("companySettings.caseTypes.form.helper")}
											</p>
										)}
									</div>
									<Button
										type='submit'
										disabled={createTypeMutation.isPending}
										className='w-full justify-center'>
										{t("companySettings.caseTypes.form.button")}
									</Button>
								</form>
							</section>
						)}
					</div>
				</>
			)}
		</div>
	);
}

export default CaseTypesView;
