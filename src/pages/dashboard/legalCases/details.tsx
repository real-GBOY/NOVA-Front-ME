/** @format */

import { useParams, useNavigate } from "react-router-dom";

import LegalCaseDetailsContent from "@/components/legalCases/LegalCaseDetailsContent";
import { useGetLegalCaseById } from "@/hooks/legalCases/legalCase.queries";
import LoadingState from "@/designSystem/LoadingState";
import { useTranslation } from "@/hooks/useTranslation";

export default function LegalCaseDetailsPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { t } = useTranslation("common");

	const {
		data: legalCaseResponse,
		isLoading,
		isError,
	} = useGetLegalCaseById(id, { enabled: !!id });

	const handleBack = () => {
		navigate("/dashboard/legal-cases");
	};

	const legalCase = legalCaseResponse?.data;

	return (
		<>
			{isError && (
				<div className='px-6 py-4 text-error text-sm'>
					Failed to load case details.
				</div>
			)}
			{isLoading && (
				<LoadingState size="large" label={t("loading.general")} />
			)}
			{legalCase && (
				<LegalCaseDetailsContent legalCase={legalCase} onBack={handleBack} />
			)}
		</>
	);
}
