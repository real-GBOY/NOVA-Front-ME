/** @format */

import GenericForm from "@/designSystem/GenericForm";
import { GenericFormField } from "@/designSystem/GenericFormField";
import { getJobTitleSchema } from "@/utilities/schemas/jobTitleSchema";
import { JobTitleFormData } from "../types";
import SearchableMultiSelect from "@/designSystem/SearchableMultiSelect";
import { UseFormReturn } from "react-hook-form";
import { type MutableRefObject, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type StepBasicInfoProps = {
	formData: JobTitleFormData;

	updateFormData: (field: keyof JobTitleFormData, value: unknown) => void;

	availableRoles?: { id: string; title: string }[];
	formRef?: MutableRefObject<UseFormReturn<any> | null>;
};

function StepBasicInfo({
	formData,

	updateFormData,

	availableRoles = [],
	formRef,
}: StepBasicInfoProps) {
	const { t } = useTranslation("settings");

	// Transform available roles to dropdown items
	const jobTitleSchema = useMemo(() => getJobTitleSchema(t), [t]);

	const roleItems = availableRoles.map((role) => ({
		id: role.id,

		label: role.title,
	}));

	// Get currently selected role items

	// Get currently selected role items
	const selectedRoleItems = roleItems.filter((item) =>
		formData.roles?.includes(item.id as string)
	);

	const fields = useMemo(
		() => [
			{
				name: "name",
				type: "text" as const,
				label: t("wizard.jobTitle.jobTitleName"),
				placeholder: t("wizard.jobTitle.jobTitleNamePlaceholder"),
				required: true,
			},
			{
				name: "description",
				type: "textarea" as const,
				label: t("wizard.jobTitle.description"),
				placeholder: t("wizard.jobTitle.descriptionPlaceholder"),
				rows: 9,
				maxLength: 200,
			},
			{
				name: "roles",
				type: "custom" as const,
				label: t("wizard.jobTitle.defaultRoles"),
				render: () => (
					<SearchableMultiSelect
						placeholder={t("wizard.jobTitle.searchRoles")}
						selectedItems={selectedRoleItems}
						availableItems={roleItems}
						onChange={(items) => {
							updateFormData(
								"roles",
								items.map((item) => item.id)
							);
						}}
						singleSelect={false}
					/>
				),
			},
		],
		[t, selectedRoleItems, roleItems, updateFormData]
	);

	return (
		<div className='w-full max-w-full'>
			<div className='bg-background border rounded-xl sm:rounded-2xl border-border flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full max-w-full sm:max-w-2xl md:max-w-full xl:max_w-[2400px] h-auto min_h-[500px] sm:min_h-[600px] md:min_h-[650px] xl:h-[720px] p-4 sm:p-5 md:p-6 gap-4 sm:gap-5 md:gap-6 xl:gap-8'>
				{/* Header */}

				<div className='shrink-0'>
					<h3 className='text-lg sm:text-xl font-semibold text-text-strong'>
						{t("wizard.jobTitle.title")}
					</h3>

					<p className='mt-1 text-xs sm:text-sm text-text-soft'>
						{t("wizard.jobTitle.subtitle")}
					</p>
				</div>

				{/* Form Fields */}

				<GenericForm
					schema={jobTitleSchema}
					defaultValues={formData}
					onSubmit={() => {}}
					onFieldChange={updateFormData}
					showSubmitButton={false}
					mode='onChange'
					className='space-y-3 flex-1'
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
									updateFormData(
										field as keyof JobTitleFormData,
										value
									)
								}
							/>
						));
					}}
				/>
			</div>
		</div>
	);
}

export default StepBasicInfo;
