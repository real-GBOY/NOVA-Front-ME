/** @format */

import type { UseFormSetValue } from "react-hook-form";
import type { ProfileImageValue } from "../types";
import type { GeneralSettingsFormData } from "../schema";
import { useTranslation } from "@/hooks/useTranslation";

type ProfileImageUploadProps = {
	profileImage: string | null;
	isUploadingProfile: boolean;
	onImageUpload: (
		file: File,
		onChange: (value: ProfileImageValue | null) => void
	) => Promise<void>;
	onRemoveImage: (onChange: (value: ProfileImageValue | null) => void) => void;
	setValue: UseFormSetValue<GeneralSettingsFormData>;
};

function ProfileImageUpload({
	profileImage,
	isUploadingProfile,
	onImageUpload,
	setValue,
}: ProfileImageUploadProps) {
	const { t } = useTranslation("settings");

	return (
		<div className='flex items-start gap-5'>
			<div className='relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-bg-weak'>
				{profileImage ? (
					<img
						src={profileImage}
						alt={t("generalSettingsPage.profile.avatarAlt")}
						className='h-full w-full object-cover'
					/>
				) : (
					<div className='h-full w-full bg-bg-weak' />
				)}
				{isUploadingProfile && (
					<div className='absolute inset-0 flex items-center justify-center bg-background/80'>
						<span className='text-xs text-text-sub'>
							{t("generalSettingsPage.profile.uploading")}
						</span>
					</div>
				)}
			</div>
			<div className='flex flex-col gap-3'>
				<div className='flex flex-col gap-1'>
					<p className='text-base font-medium text-text-strong'>
						{t("generalSettingsPage.profile.uploadTitle")}
					</p>
					<p className='text-sm text-text-sub'>
						{t("generalSettingsPage.profile.uploadSubtitle")}
					</p>
				</div>
				<div className='flex gap-3'>
					{profileImage ? (
						<label className='inline-flex cursor-pointer items-center justify-center rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-text-sub transition-colors hover:bg-bg-weak'>
							<span>{t("generalSettingsPage.profile.change")}</span>
							<input
								type='file'
								accept='image/png,image/jpeg'
								className='hidden'
								disabled={isUploadingProfile}
								onChange={(event) => {
									const file = event.target.files?.[0];
									if (!file) return;
									onImageUpload(file, (value) =>
										setValue("profileImage", value, { shouldDirty: true })
									);
									event.target.value = "";
								}}
							/>
						</label>
					) : (
						<label className='inline-flex cursor-pointer items-center justify-center rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-text-sub transition-colors hover:bg-bg-weak'>
							<span>
								{isUploadingProfile
									? t("generalSettingsPage.profile.uploading")
									: t("generalSettingsPage.profile.upload")}
							</span>
							<input
								type='file'
								accept='image/png,image/jpeg'
								className='hidden'
								disabled={isUploadingProfile}
								onChange={(event) => {
									const file = event.target.files?.[0];
									if (!file) return;
									onImageUpload(file, (value) =>
										setValue("profileImage", value, { shouldDirty: true })
									);
									event.target.value = "";
								}}
							/>
						</label>
					)}
				</div>
			</div>
		</div>
	);
}

export default ProfileImageUpload;
