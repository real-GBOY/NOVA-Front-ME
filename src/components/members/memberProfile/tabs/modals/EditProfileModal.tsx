/** @format */

import { useState, useEffect, useRef } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { useUpdateEmployeeProfile } from "@/hooks/employees/employee.queries";
import toast from "@/utilities/toast";
import type { EmployeeDetails } from "@/services/employeeService";
import DatePicker from "@/designSystem/DatePicker";
import Dropdown, { DropdownItem } from "@/designSystem/Dropdown";
import { Input } from "@/designSystem/ui/input";

interface EditProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
	employeeId: string | number;
	employeeData: EmployeeDetails | null;
	onSuccess?: () => void;
}

function EditProfileModal({
	isOpen,
	onClose,
	employeeId,
	employeeData,
	onSuccess,
}: EditProfileModalProps) {
	const { t } = useTranslation("members");
	const { t: tCommon } = useTranslation("common");
	const updateProfileMutation = useUpdateEmployeeProfile();
	const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
	const [isMaritalStatusDropdownOpen, setIsMaritalStatusDropdownOpen] =
		useState(false);
	const genderDropdownRef = useRef<HTMLButtonElement>(null);
	const maritalStatusDropdownRef = useRef<HTMLButtonElement>(null);

	const [formData, setFormData] = useState({
		address: "",
		country: "",
		date_of_birth: "",
		gender: "" as "Male" | "Female" | "",
		marital_status: "" as "Single" | "Married" | "Divorced" | "Widowed" | "",
	});

	const [errors, setErrors] = useState<{
		address?: string;
		country?: string;
		date_of_birth?: string;
		gender?: string;
		marital_status?: string;
	}>({});

	// Initialize form data from employee data
	useEffect(() => {
		if (employeeData && isOpen) {
			setFormData({
				address: employeeData.personal.address || "",
				country: employeeData.personal.country || "",
				date_of_birth: employeeData.personal.birth_date
					? new Date(employeeData.personal.birth_date)
							.toISOString()
							.split("T")[0]
					: "",
				gender: (employeeData.personal.gender as "Male" | "Female") || "",
				marital_status:
					(employeeData.personal.marital_status as
						| "Single"
						| "Married"
						| "Divorced"
						| "Widowed") || "",
			});
			setErrors({});
		}
	}, [employeeData, isOpen]);

	const genderOptions = [
		{ value: "Male", label: t("options.gender.male") },
		{ value: "Female", label: t("options.gender.female") },
	];

	const maritalStatusOptions = [
		{ value: "Single", label: t("options.maritalStatus.single") },
		{ value: "Married", label: t("options.maritalStatus.married") },
		{ value: "Divorced", label: t("options.maritalStatus.divorced") },
		{ value: "Widowed", label: t("options.maritalStatus.widowed") },
	];

	const genderDropdownItems: DropdownItem[] = genderOptions.map((opt) => ({
		id: opt.value,
		label: opt.label,
		icon: () => <></>,
		onClick: () => {
			setFormData({ ...formData, gender: opt.value as "Male" | "Female" });
			setErrors((prev) => ({ ...prev, gender: undefined }));
			setIsGenderDropdownOpen(false);
		},
	}));

	const maritalStatusDropdownItems: DropdownItem[] = maritalStatusOptions.map(
		(opt) => ({
			id: opt.value,
			label: opt.label,
			icon: () => <></>,
			onClick: () => {
				setFormData({
					...formData,
					marital_status: opt.value as
						| "Single"
						| "Married"
						| "Divorced"
						| "Widowed",
				});
				setErrors((prev) => ({ ...prev, marital_status: undefined }));
				setIsMaritalStatusDropdownOpen(false);
			},
		})
	);

	const selectedGender = genderOptions.find(
		(opt) => opt.value === formData.gender
	);
	const selectedMaritalStatus = maritalStatusOptions.find(
		(opt) => opt.value === formData.marital_status
	);

	const validateForm = (): boolean => {
		const newErrors: typeof errors = {};

		if (!formData.date_of_birth) {
			newErrors.date_of_birth = tCommon("validation.required");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			return;
		}

		try {
			const payload: {
				address?: string;
				country?: string;
				date_of_birth?: string;
				gender?: "Male" | "Female";
				marital_status?: "Single" | "Married" | "Divorced" | "Widowed";
			} = {};

			if (formData.address !== (employeeData?.personal.address || "")) {
				payload.address = formData.address;
			}
			if (formData.country !== (employeeData?.personal.country || "")) {
				payload.country = formData.country;
			}
			if (
				formData.date_of_birth !==
				(employeeData?.personal.birth_date
					? new Date(employeeData.personal.birth_date)
							.toISOString()
							.split("T")[0]
					: "")
			) {
				payload.date_of_birth = formData.date_of_birth;
			}
			if (formData.gender !== (employeeData?.personal.gender || "")) {
				payload.gender = formData.gender as "Male" | "Female";
			}
			if (
				formData.marital_status !==
				(employeeData?.personal.marital_status || "")
			) {
				payload.marital_status = formData.marital_status as
					| "Single"
					| "Married"
					| "Divorced"
					| "Widowed";
			}

			// Only submit if there are changes
			if (Object.keys(payload).length === 0) {
				toast.info(tCommon("noChanges") || "No changes to save");
				onClose();
				return;
			}

			await updateProfileMutation.mutateAsync({
				id: employeeId,
				payload,
			});

			toast.success(
				t("messages.updateSuccess") ||
					tCommon("updateSuccess") ||
					"Profile updated successfully"
			);
			onSuccess?.();
			onClose();
		} catch (error) {
			console.error("Failed to update profile:", error);
			toast.error(
				t("messages.updateError") ||
					tCommon("updateError") ||
					"Failed to update profile. Please try again."
			);
		}
	};

	const handleClose = () => {
		if (updateProfileMutation.isPending) return;
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={t("editMember")}
			size='medium'
			footer={
				<div className='flex justify-end gap-3'>
					<Button
						variant='secondary'
						onClick={handleClose}
						disabled={updateProfileMutation.isPending}>
						{tCommon("cancel")}
					</Button>
					<Button
						variant='primary'
						onClick={handleSubmit}
						isLoading={updateProfileMutation.isPending}>
						{tCommon("save")}
					</Button>
				</div>
			}>
			<div className='flex flex-col gap-4'>
				{/* Address */}
				<div className='flex flex-col gap-2'>
					<label className='text-sm font-medium text-text-sub'>
						{t("fields.address")}
					</label>
					<Input
						value={formData.address}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setFormData({ ...formData, address: e.target.value });
							setErrors((prev) => ({ ...prev, address: undefined }));
						}}
						placeholder={t("fields.address")}
						className={errors.address ? "border-danger" : ""}
					/>
					{errors.address && (
						<p className='text-sm text-danger'>{errors.address}</p>
					)}
				</div>

				{/* Country */}
				<div className='flex flex-col gap-2'>
					<label className='text-sm font-medium text-text-sub'>
						{t("fields.country")}
					</label>
					<Input
						value={formData.country}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setFormData({ ...formData, country: e.target.value });
							setErrors((prev) => ({ ...prev, country: undefined }));
						}}
						placeholder={t("fields.country")}
						className={errors.country ? "border-danger" : ""}
					/>
					{errors.country && (
						<p className='text-sm text-danger'>{errors.country}</p>
					)}
				</div>

				{/* Date of Birth */}
				<div className='flex flex-col gap-2'>
					<label className='text-sm font-medium text-text-sub'>
						{t("fields.dob")}
					</label>
					<DatePicker
						value={
							formData.date_of_birth
								? new Date(formData.date_of_birth)
								: undefined
						}
						onChange={(date) => {
							const dateStr = date ? date.toISOString().split("T")[0] : "";
							setFormData({ ...formData, date_of_birth: dateStr });
							setErrors((prev) => ({ ...prev, date_of_birth: undefined }));
						}}
						status={errors.date_of_birth ? "error" : "default"}
					/>
					{errors.date_of_birth && (
						<p className='text-sm text-danger'>{errors.date_of_birth}</p>
					)}
				</div>

				{/* Gender */}
				<div className='flex flex-col gap-2'>
					<label className='text-sm font-medium text-text-sub'>
						{t("fields.gender")}
					</label>
					<button
						ref={genderDropdownRef}
						type='button'
						onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
						className={`w-full px-4 py-2 text-left border rounded-lg bg-background-main ${
							errors.gender ? "border-danger" : "border-border-main"
						} focus:outline-none focus:ring-2 focus:ring-primary/20`}>
						<span
							className={selectedGender ? "text-text-main" : "text-text-sub"}>
							{selectedGender
								? selectedGender.label
								: tCommon("select") || "Select"}
						</span>
					</button>
					{isGenderDropdownOpen && genderDropdownRef.current && (
						<Dropdown
							items={genderDropdownItems}
							isOpen={isGenderDropdownOpen}
							onClose={() => setIsGenderDropdownOpen(false)}
							anchorRef={genderDropdownRef}
						/>
					)}
					{errors.gender && (
						<p className='text-sm text-danger'>{errors.gender}</p>
					)}
				</div>

				{/* Marital Status */}
				<div className='flex flex-col gap-2'>
					<label className='text-sm font-medium text-text-sub'>
						{t("fields.maritalStatus")}
					</label>
					<button
						ref={maritalStatusDropdownRef}
						type='button'
						onClick={() =>
							setIsMaritalStatusDropdownOpen(!isMaritalStatusDropdownOpen)
						}
						className={`w-full px-4 py-2 text-left border rounded-lg bg-background-main ${
							errors.marital_status ? "border-danger" : "border-border-main"
						} focus:outline-none focus:ring-2 focus:ring-primary/20`}>
						<span
							className={
								selectedMaritalStatus ? "text-text-main" : "text-text-sub"
							}>
							{selectedMaritalStatus
								? selectedMaritalStatus.label
								: tCommon("select") || "Select"}
						</span>
					</button>
					{isMaritalStatusDropdownOpen && maritalStatusDropdownRef.current && (
						<Dropdown
							items={maritalStatusDropdownItems}
							isOpen={isMaritalStatusDropdownOpen}
							onClose={() => setIsMaritalStatusDropdownOpen(false)}
							anchorRef={maritalStatusDropdownRef}
						/>
					)}
					{errors.marital_status && (
						<p className='text-sm text-danger'>{errors.marital_status}</p>
					)}
				</div>
			</div>
		</Modal>
	);
}

export default EditProfileModal;
