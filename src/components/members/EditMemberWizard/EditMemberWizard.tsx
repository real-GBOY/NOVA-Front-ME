/** @format */

import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { UseFormReturn } from "react-hook-form";
import Button from "@/designSystem/Button";
import StepIndicator from "@/designSystem/StepIndicator";
import { STEPS } from "../AddMemberWizard/types";
import EditStepBasicInfo from "./steps/EditStepBasicInfo";
import EditStepWorkInfo from "./steps/EditStepWorkInfo";
import EditStepResidency from "./steps/EditStepResidency";
import StepReview from "../AddMemberWizard/StepReview";
import { type MemberFormData } from "@/utilities/schemas/memberSchema";
import { useUpdateEmployee } from "@/hooks/employees/employee.mutations";
import type { UpdateEmployeeRequest } from "@/services/employeeService";
import toast from "@/utilities/toast";
import { buildValidationSummaryItems } from "@/designSystem/GenericForm";
import type { MutableRefObject } from "react";
import Loader from "@/designSystem/Loader";
import { useTranslation } from "@/hooks/useTranslation";
import { transformEmployeeDetailsToFormData } from "./utils/transformEmployeeData";
import type { EmployeeDetails } from "@/services/employeeService";
import { filterReadyUploads, isUploadReady } from "@/utils/uploadValidation";

type StepKey = "basic" | "work" | "residency" | "review";

export type EditMemberWizardProps = {
	employeeId: string | number;
	employeeData: EmployeeDetails | null;
	basicEmployeeData?: { national_id?: string | null } | null; // Basic employee data as fallback for national_id
	onClose?: () => void;
	onComplete?: (data: MemberFormData) => void;
	availableJobTitles?: { id: string; title: string }[];
	availableTeams?: { id: string; name: string }[];
	availableRoles?: { id: string; title: string }[];
	availableManagers?: { id: string; name: string; avatar?: string }[];
};

function EditMemberWizard({
	employeeId,
	employeeData,
	basicEmployeeData,
	onClose,
	onComplete,
	availableJobTitles = [],
	availableTeams = [],
	availableRoles = [],
	availableManagers = [],
}: EditMemberWizardProps) {
	const { t } = useTranslation("common");
	const [currentStep, setCurrentStep] = useState(1);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isValidating, setIsValidating] = useState(false);
	const [completedSteps, setCompletedSteps] = useState<number[]>([]);

	const updateEmployeeMutation = useUpdateEmployee();

	// Form refs for each step
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const step1FormRef = useRef<UseFormReturn<any> | null>(null);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const step2FormRef = useRef<UseFormReturn<any> | null>(null);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const step3FormRef = useRef<UseFormReturn<any> | null>(null);

	// Initialize form data from employee data
	const initialFormData = useMemo(() => {
		if (employeeData) {
			return transformEmployeeDetailsToFormData(
				employeeData,
				basicEmployeeData
			);
		}
		return {};
	}, [employeeData, basicEmployeeData]);

	const [formData, setFormData] = useState<MemberFormData>({
		firstName: "",
		lastName: "",
		email: "",
		phoneNumber: "",
		country: "",
		dateOfBirth: "",
		gender: "",
		maritalStatus: "",
		nationalId: "",
		address: "",
		jobTitle: "",
		team_ids: [],
		role: "",
		manager: "",
		shiftId: null,
		employmentType: "",
		startDate: "",
		hoursPerWeek: "",
		probationPeriod: "",
		salary: "",
		contractType: "",
		documents: [],
		residencyStatus: "",
		residencyCountry: "United Arab Emirates",
		residencyType: "",
		residencyNumber: "",
		residencyIssueDate: "",
		residencyExpiryDate: "",
		residencyDocument: [],
		...initialFormData,
	});

	// Update form data when employeeData changes
	useEffect(() => {
		if (employeeData) {
			const transformed = transformEmployeeDetailsToFormData(employeeData);
			setFormData((prev) => ({
				...prev,
				...transformed,
			}));
		}
	}, [employeeData]);

	const steps = useMemo(() => {
		return STEPS.map((step, index) => {
			const stepKey = step.key as StepKey;
			let title = "";
			if (stepKey === "basic") {
				title = t("members.wizard.steps.basic");
			} else if (stepKey === "work") {
				title = t("members.wizard.steps.work");
			} else if (stepKey === "residency") {
				title = t("members.wizard.steps.residency");
			} else if (stepKey === "review") {
				title = t("members.wizard.steps.review");
			}
			return {
				...step,
				id: index + 1,
				title,
			};
		});
	}, [t]);

	const stepIdByKey = useMemo(() => {
		return steps.reduce((acc, step) => {
			acc.set(step.key, step.id);
			return acc;
		}, new Map<string, number>());
	}, [steps]);

	useEffect(() => {
		if (currentStep > steps.length) {
			setCurrentStep(steps.length);
		}
	}, [currentStep, steps.length]);

	const updateFormData = (field: keyof MemberFormData, value: unknown) => {
		setFormData((prev) => {
			const updated = {
				...prev,
				[field]: value,
			};
			return updated;
		});
	};

	// Check if any files are currently uploading
	const checkIsUploading = (doc: any) => {
		if (!doc) return false;
		if (typeof doc.isUploading === "string") {
			return doc.isUploading === "true";
		}
		return !!doc.isUploading;
	};

	const isAnyUploading =
		formData.documents?.some(checkIsUploading) ||
		(Array.isArray(formData.residencyDocument) &&
			formData.residencyDocument.some(checkIsUploading)) ||
		checkIsUploading(formData.profileImage);

	const navigateToStepKey = (stepKey: StepKey) => {
		const stepId = stepIdByKey.get(stepKey);
		if (stepId) {
			setCurrentStep(stepId);
		}
	};

	const getServerFieldErrors = (
		error: unknown
	): Array<{ field: string; message: string }> => {
		const data = (error as { response?: { data?: unknown } })?.response?.data;
		if (!data || typeof data !== "object") return [];

		const errorPayload =
			(data as { errors?: unknown }).errors ||
			(data as { fieldErrors?: unknown }).fieldErrors ||
			(data as { fields?: unknown }).fields ||
			(data as { error?: { errors?: unknown } }).error?.errors;

		if (!errorPayload) return [];

		if (Array.isArray(errorPayload)) {
			return errorPayload
				.map((item) => {
					if (!item || typeof item !== "object") {
						return null;
					}
					const field =
						(item as { field?: string }).field ||
						(item as { path?: string }).path ||
						(item as { name?: string }).name;
					const message =
						(item as { message?: string }).message ||
						(item as { msg?: string }).msg ||
						(item as { error?: string }).error;
					if (!field) return null;
					return {
						field,
						message: message || "Invalid value",
					};
				})
				.filter((item): item is { field: string; message: string } => !!item);
		}

		if (typeof errorPayload === "object") {
			return Object.entries(errorPayload as Record<string, unknown>)
				.map(([field, value]) => {
					if (typeof value === "string") {
						return { field, message: value };
					}
					if (Array.isArray(value) && typeof value[0] === "string") {
						return { field, message: value[0] };
					}
					if (value && typeof value === "object" && "message" in value) {
						const message = (value as { message?: string }).message;
						if (typeof message === "string") {
							return { field, message };
						}
					}
					return null;
				})
				.filter((item): item is { field: string; message: string } => !!item);
		}

		return [];
	};

	const applyServerErrorsToStep = (stepKey: StepKey, error: unknown) => {
		const formRef =
			stepKey === "basic"
				? step1FormRef
				: stepKey === "work"
				? step2FormRef
				: step3FormRef;
		const fieldMap: Partial<Record<string, keyof MemberFormData>> = {};
		if (stepKey === "basic") {
			fieldMap.first_name = "firstName";
			fieldMap.last_name = "lastName";
			fieldMap.email = "email";
			fieldMap.phone_number = "phoneNumber";
			fieldMap.country = "country";
			fieldMap.date_of_birth = "dateOfBirth";
			fieldMap.gender = "gender";
			fieldMap.marital_status = "maritalStatus";
			fieldMap.national_id = "nationalId";
			fieldMap.address = "address";
		}
		if (stepKey === "work") {
			fieldMap.job_title = "jobTitle";
			fieldMap.job_title_id = "jobTitle";
			fieldMap.team_ids = "team_ids";
			fieldMap.role_id = "role";
			fieldMap.manager_id = "manager";
			fieldMap.shift_id = "shiftId";
			fieldMap.employment_type = "employmentType";
			fieldMap.start_date = "startDate";
			fieldMap.hours_per_week = "hoursPerWeek";
			fieldMap.probation_period = "probationPeriod";
		}
		if (stepKey === "residency") {
			fieldMap.permit_number = "residencyNumber";
			fieldMap.permit_type = "residencyType";
			fieldMap.issue_date = "residencyIssueDate";
			fieldMap.expiration_date = "residencyExpiryDate";
			fieldMap.country = "residencyCountry";
			fieldMap.status = "residencyStatus";
			fieldMap.document = "residencyDocument";
		}

		const fieldErrors = getServerFieldErrors(error);
		navigateToStepKey(stepKey);

		if (fieldErrors.length === 0) {
			return;
		}

		setTimeout(() => {
			if (!formRef.current) return;
			let firstField: keyof MemberFormData | null = null;
			fieldErrors.forEach(({ field, message }) => {
				const mappedField = fieldMap[field] || (field as keyof MemberFormData);
				formRef.current?.setError(mappedField as never, {
					type: "server",
					message,
				});
				if (!firstField) {
					firstField = mappedField;
				}
			});

			if (firstField) {
				formRef.current?.setFocus(firstField as never);
			}
		}, 0);
	};

	const getErrorMessage = (error: unknown, fallback: string) => {
		let message = fallback;
		if (error && typeof error === "object") {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const axiosError = error as any;
			if (axiosError.response) {
				const status = axiosError.response.status;
				const data = axiosError.response.data;

				if (status === 409) {
					message = "Conflict: This email may already be in use.";
				} else if (status === 400) {
					message = `Validation Error: ${
						data?.message || "Invalid data provided"
					}`;
				} else if (data?.message) {
					message = data.message;
				}
			} else if (error instanceof Error) {
				message = error.message;
			}
		}
		return message;
	};

	const handleNext = async () => {
		setIsValidating(true);

		try {
			const validateStep = async (
				formRef: MutableRefObject<UseFormReturn<any> | null>
			) => {
				if (!formRef.current) return true;
				let isValid = false;
				await formRef.current.handleSubmit(
					() => {
						isValid = true;
					},
					(errors) => {
						isValid = false;
						const { items } = buildValidationSummaryItems(errors, {}, {});
						if (items[0]) {
							formRef.current?.setFocus(items[0].field as never);
						}
					}
				)();
				return isValid;
			};

			let isValid = false;
			const currentStepKey = steps[currentStep - 1]?.key;

			if (currentStepKey === "basic") {
				isValid = await validateStep(step1FormRef);
			} else if (currentStepKey === "work") {
				isValid = await validateStep(step2FormRef);
			} else if (currentStepKey === "residency") {
				isValid = await validateStep(step3FormRef);
			} else if (currentStepKey === "review") {
				isValid = true;
			}

			setIsValidating(false);

			if (!isValid) {
				console.error("❌ Validation failed for step", currentStep);
				return;
			}

			if (!completedSteps.includes(currentStep)) {
				setCompletedSteps([...completedSteps, currentStep]);
			}

			if (currentStep < steps.length) {
				setCurrentStep(currentStep + 1);
			} else {
				handleSubmit();
			}
		} catch (error) {
			setIsValidating(false);
			console.error("❌ Validation error:", error);
			toast.error(t("members.wizard.messages.validationError"));
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		} else {
			if (onClose) onClose();
		}
	};

		const handleSubmit = async () => {
			try {
				setIsSubmitting(true);

				// Read freshest upload values directly from form ref.
				const latestBasicValues =
					step1FormRef.current?.getValues?.() as Partial<MemberFormData>;
				const basicDocuments =
					latestBasicValues?.documents || formData.documents || [];
				const latestProfileImage =
					latestBasicValues?.profileImage || formData.profileImage;

				// Transform documents to only include required fields
				const attachments = filterReadyUploads(basicDocuments)
					.map((doc) => ({
						fileId: doc.fileId,
						token: doc.token,
						purpose: doc.purpose || "employee_document",
					}));

				// Transform profile image to only include required fields
				const profileImage =
					isUploadReady(latestProfileImage)
						? {
								fileId: latestProfileImage.fileId,
								token: latestProfileImage.token,
								purpose: latestProfileImage.purpose || "employee_profile",
						  }
						: undefined;

			// Format date_of_birth properly
			let formattedDateOfBirth: string | undefined = undefined;
			if (formData.dateOfBirth) {
				try {
					const date = new Date(formData.dateOfBirth);
					if (!isNaN(date.getTime())) {
						formattedDateOfBirth = date.toISOString();
					}
				} catch (error) {
					console.error("❌ Error formatting date_of_birth:", error);
				}
			}

			// Helper to convert day strings like "90 days" to numbers
			const parseDaysValue = (value?: string) => {
				if (!value) return undefined;
				const digits = value.replace(/[^0-9]/g, "");
				return digits ? Number(digits) : undefined;
			};

			const updatePayload: UpdateEmployeeRequest = {
				first_name: formData.firstName,
				last_name: formData.lastName,
				email: formData.email,
				phone_number: formData.phoneNumber,
				country: formData.country || undefined,
				date_of_birth: formattedDateOfBirth,
				gender: (formData.gender as "Male" | "Female") || undefined,
				marital_status:
					(formData.maritalStatus as
						| "Single"
						| "Married"
						| "Divorced"
						| "Widowed") || undefined,
				national_id: formData.nationalId || undefined,
				address: formData.address || undefined,
				job_title_id: formData.jobTitle ? Number(formData.jobTitle) : undefined,
				team_ids: formData.team_ids
					? formData.team_ids.map((id) => Number(id))
					: undefined,
				role_id: formData.role ? Number(formData.role) : undefined,
				manager_id: formData.manager ? Number(formData.manager) : null,
				shift_id: formData.shiftId ? Number(formData.shiftId) : null,
				employment_type: formData.employmentType as
					| "full_time"
					| "part_time"
					| "contract"
					| "intern"
					| "temporary"
					| undefined,
				start_date: formData.startDate || undefined,
				hours_per_week: formData.hoursPerWeek
					? Number(formData.hoursPerWeek)
					: undefined,
				probation_period: parseDaysValue(formData.probationPeriod),
				profile_image: profileImage,
				attachments,
			};

			await updateEmployeeMutation.mutateAsync({
				id: employeeId,
				payload: updatePayload,
			});

			toast.success(
				t("members.wizard.messages.updateSuccess") ||
					`Member ${formData.firstName} ${formData.lastName} updated successfully`
			);

			if (onComplete) {
				await onComplete(formData);
			}

			setIsSubmitting(false);
		} catch (error) {
			console.error("❌ Error updating employee:", error);
			const errorMessage = getErrorMessage(
				error,
				t("members.wizard.messages.updateError") ||
					"Failed to update member. Please try again."
			);
			toast.error(errorMessage);

			// Apply server errors to appropriate step
			const fieldErrors = getServerFieldErrors(error);
			if (fieldErrors.length > 0) {
				const firstError = fieldErrors[0];
				if (
					firstError.field.includes("first_name") ||
					firstError.field.includes("email")
				) {
					applyServerErrorsToStep("basic", error);
				} else if (
					firstError.field.includes("job_title") ||
					firstError.field.includes("role")
				) {
					applyServerErrorsToStep("work", error);
				} else if (
					firstError.field.includes("residency") ||
					firstError.field.includes("permit")
				) {
					applyServerErrorsToStep("residency", error);
				}
			}

			setIsSubmitting(false);
		}
	};

	const handleNavigateToStep = (_step: number) => {
		toast.info(t("members.wizard.messages.navigationError"));
	};

	return (
		<div className='flex flex-col h-full relative'>
			{/* Loading Overlay */}
			{isSubmitting && (
				<div className='absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center'>
					<Loader label={t("members.wizard.buttons.processing")} />
				</div>
			)}

			<div className='flex flex-col xl:flex-row flex-1 overflow-hidden'>
				{/* Left Sidebar - Steps */}
				<div className='w-full xl:w-auto xl:min-w-[500px] bg-bg-weak ps-4 sm:ps-6 md:ps-8 xl:ps-32 pe-4 sm:pe-6 pt-4 pb-4 flex flex-col'>
					<StepIndicator
						steps={steps}
						currentStep={currentStep}
						onStepChange={handleNavigateToStep}
					/>
				</div>

				{/* Right Content Area */}
				<div className='flex-1 flex flex-col overflow-hidden'>
					<div className='flex-1 overflow-y-auto pl-4 sm:pl-6 md:pl-8 xl:pl-32 pr-4 sm:pr-6 md:pr-8 pt-4 pb-4 bg-bg-weak [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
						<motion.div
							key={currentStep}
							initial={{ opacity: 0, x: 0, y: 10 }}
							animate={{ opacity: 1, x: 0, y: 0 }}
							exit={{ opacity: 0, x: 0, y: -10 }}
							transition={{ duration: 0.3 }}>
							{steps[currentStep - 1]?.key === "basic" && (
								<EditStepBasicInfo
									formData={formData}
									updateFormData={updateFormData}
									formRef={step1FormRef}
									employeeId={employeeId}
									originalEmail={employeeData?.personal?.email}
									originalNationalId={initialFormData?.nationalId}
								/>
							)}
							{steps[currentStep - 1]?.key === "work" && (
								<EditStepWorkInfo
									formData={formData}
									updateFormData={updateFormData}
									availableJobTitles={availableJobTitles}
									availableTeams={availableTeams}
									availableRoles={availableRoles}
									availableManagers={availableManagers}
									formRef={step2FormRef}
									employeeId={employeeId}
								/>
							)}
							{steps[currentStep - 1]?.key === "residency" && (
								<EditStepResidency
									formData={formData}
									updateFormData={updateFormData}
									formRef={step3FormRef}
									employeeId={employeeId}
								/>
							)}
							{steps[currentStep - 1]?.key === "review" && (
								<StepReview
									formData={formData}
									onNavigateToStep={(step) => setCurrentStep(step)}
									availableJobTitles={availableJobTitles}
									availableTeams={availableTeams}
									availableRoles={availableRoles}
									availableManagers={availableManagers}
									showResidency={true}
								/>
							)}
						</motion.div>
					</div>
				</div>
			</div>

			{/* Footer Actions */}
			<div className='flex flex-col md:flex-row items-stretch md:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 pt-3 sm:pt-4 pb-3 sm:pb-4 border-t border-border'>
				<Button
					variant='secondary'
					onClick={handleBack}
					disabled={isSubmitting || isValidating}
					className='w-full md:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-text-sub bg-bg-weak hover:bg-bg-soft rounded-xl sm:rounded-2xl border border-border'>
					{t("members.wizard.buttons.back")}
				</Button>
				<Button
					variant='primary'
					onClick={handleNext}
					disabled={isSubmitting || isValidating || !!isAnyUploading}
					className='w-full md:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all'>
					{isSubmitting
						? t("members.wizard.buttons.processing")
						: isValidating
						? t("members.wizard.buttons.validating")
						: isAnyUploading
						? t("members.wizard.buttons.uploading")
						: currentStep === steps.length
						? t("members.wizard.buttons.updateMember") || "Update Member"
						: t("members.wizard.buttons.continue")}
				</Button>
			</div>
		</div>
	);
}

export default EditMemberWizard;
