/** @format */

import { useMemo, MutableRefObject } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { AssetFormData } from "../types";
import { getAssetSchema } from "@/utilities/schemas/assetSchema";
import GenericForm from "@/designSystem/GenericForm";
import { GenericFormField } from "@/designSystem/GenericFormField";
import { UseFormReturn } from "react-hook-form";
import Avatar from "@/designSystem/Avatar";

type StepAssetInformationProps = {
	formData: AssetFormData;
	updateFormData: (field: keyof AssetFormData, value: unknown) => void;
	formRef?: MutableRefObject<UseFormReturn<any> | null>;
	assignedTo?: {
		id: string;
		name: string;
		email?: string;
		avatar?: string;
	};
};

function StepAssetInformation({
	formData,
	updateFormData,
	formRef,
	assignedTo,
}: StepAssetInformationProps) {
	const { t } = useTranslation("settings");
	
	const assetSchema = useMemo(() => getAssetSchema(t) as unknown as import("yup").ObjectSchema<AssetFormData>, [t]);

	const categoryOptions = useMemo(() => [
		{ id: "laptop", label: t("companySettings.assets.categories.laptop", "Laptop") },
		{ id: "mobile", label: t("companySettings.assets.categories.mobile", "Mobile") },
		{ id: "tablet", label: t("companySettings.assets.categories.tablet", "Tablet") },
		{ id: "other", label: t("companySettings.assets.categories.other", "Other") },
	], [t]);

	const conditionOptions = useMemo(() => [
		{ id: "new", label: t("companySettings.assets.conditions.new", "New") },
		{ id: "good", label: t("companySettings.assets.conditions.good", "Good") },
		{ id: "fair", label: t("companySettings.assets.conditions.fair", "Fair") },
		{ id: "poor", label: t("companySettings.assets.conditions.poor", "Poor") },
		{ id: "damaged", label: t("companySettings.assets.conditions.damaged", "Damaged") },
	], [t]);

	const fields = useMemo(() => {
		const baseFields = [
			...(assignedTo
				? [
						{
							name: "assignedTo",
							type: "custom" as const,
							render: () => (
								<div className="flex flex-col gap-1">
									<label className="text-sm font-medium text-text-sub">
										{t(
											"assets.addWizard.assetInformation.assignedTo",
											"Assigned to"
										)}
									</label>
									<div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-bg-weak">
										<Avatar
											size="sm"
											src={assignedTo.avatar}
											alt={assignedTo.name}
										/>
										<div className="min-w-0">
											<p className="text-sm font-medium text-text-strong truncate">
												{assignedTo.name}
											</p>
											{assignedTo.email && (
												<p className="text-xs text-text-sub truncate">
													{assignedTo.email}
												</p>
											)}
										</div>
									</div>
								</div>
							),
						},
				  ]
				: []),
			{
				name: "image",
				type: "uploadField" as const,
				label: t("assets.addWizard.assetInformation.uploadImage"),
				uploadPurpose: "asset",
				accept: "image/png,image/jpeg,image/jpg",
				multiple: false,
				required: true,
			},
			{
				name: "name",
				type: "text" as const,
				label: t("assets.addWizard.assetInformation.assetName"),
				placeholder: t("assets.addWizard.assetInformation.assetNamePlaceholder"),
				required: true,
			},
			{
				name: "category",
				type: "dropdown" as const,
				label: t("assets.addWizard.assetInformation.category"),
				placeholder: t("assets.addWizard.assetInformation.selectCategory"),
				options: categoryOptions,
				required: true,
			},
			{
				name: "serial",
				type: "text" as const,
				label: t("assets.addWizard.assetInformation.serialNumber"),
				placeholder: t("assets.addWizard.assetInformation.serialNumberPlaceholder"),
				required: true,
			},
			{
				name: "condition",
				type: "dropdown" as const,
				label: t("assets.addWizard.assetInformation.condition"),
				placeholder: t("assets.addWizard.assetInformation.selectCondition"),
				options: conditionOptions,
				required: true,
			},
		];

		return baseFields;
	}, [t, categoryOptions, conditionOptions, assignedTo]);

	return (
		<div className='w-full max-w-full'>
			<div className='bg-background border rounded-xl sm:rounded-2xl border-border flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full max-w-full sm:max-w-2xl md:max-w-full xl:max-w-[2400px] h-auto min-h-[500px] sm:min-h-[600px] md:min-h-[650px] xl:h-[720px] p-4 sm:p-5 md:p-6 gap-4 sm:gap-5 md:gap-6 xl:gap-8'>
				{/* Header */}
				<div className='shrink-0'>
					<h3 className='text-lg sm:text-xl font-semibold text-text-strong'>
						{t("assets.addWizard.assetInformation.title")}
					</h3>
					<p className='mt-1 text-xs sm:text-sm text-text-soft'>
						{t("assets.addWizard.assetInformation.description")}
					</p>
				</div>

				<div className='h-px bg-border shrink-0 w-full' />

				{/* Form Fields - using GenericForm */}
				<GenericForm<AssetFormData>
					schema={assetSchema}
					defaultValues={{
						...formData,
						image: formData.image ?? undefined,
					}}
					onSubmit={() => {}}
					onFieldChange={(field, value) => updateFormData(field as keyof AssetFormData, value)}
					showSubmitButton={false}
					mode="onChange"
					className="space-y-4 flex-1"
					fields={fields}
					renderFields={(form) => {
						if (formRef) {
							formRef.current = form;
						}
						return fields.map((fieldConfig) => (
							<GenericFormField
								key={fieldConfig.name}
								fieldConfig={fieldConfig}
								form={form}
								onFieldChange={(field, value) =>
									updateFormData(field as keyof AssetFormData, value)
								}
							/>
						));
					}}
				/>
			</div>
		</div>
	);
}

export default StepAssetInformation;
