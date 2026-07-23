/** @format */

import { useMemo, useState } from "react";
import SearchInput from "@/designSystem/SearchInput";
import Button from "@/designSystem/Button";
import SortDropdown, { type SortOption } from "@/designSystem/SortDropdown";
import LoadingState from "@/designSystem/LoadingState";
import { DownloadBracket } from "@/Icons";
import { useListReports } from "@/hooks/reports/report.queries";
import {
   reportsService,
   type ReportDefinition,
} from "@/services/reportsService";
import toast from "@/utilities/toast";
import DatePicker from "@/designSystem/DatePicker";
import { Input } from "@/designSystem/ui/input";
import Modal from "@/designSystem/Modal";
import Radio from "@/designSystem/Radio";
import { useTranslation } from "@/hooks/useTranslation";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";

const sortOptions: SortOption[] = [
   { id: "title-asc", label: "Title A-Z" },
   { id: "title-desc", label: "Title Z-A" },
   { id: "category", label: "Category" },
   { id: "parameters", label: "Parameters" },
];

const formatDateParam = (date: Date) => {
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, "0");
   const day = String(date.getDate()).padStart(2, "0");
   return `${year}-${month}-${day}`;
};

const parseDateParam = (value?: string) => {
   if (!value) return undefined;
   const [year, month, day] = value.split("-").map(Number);
   if (!year || !month || !day) return undefined;
   const parsed = new Date(year, month - 1, day);
   return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const buildDefaultParams = (report: ReportDefinition) => {
   const now = new Date();
   const past = new Date(now);
   past.setDate(now.getDate() - 30);
   const defaults: Record<string, string> = {};

   report.parameters?.forEach((param) => {
      const key = param.name;
      const lowered = key.toLowerCase();
      const isDate =
         param.type === "date" ||
         lowered.includes("date") ||
         lowered.includes("from") ||
         lowered.includes("start") ||
         lowered.includes("to") ||
         lowered.includes("end");

      if (isDate && (lowered.includes("from") || lowered.includes("start"))) {
         defaults[key] = formatDateParam(past);
      } else if (
         isDate &&
         (lowered.includes("to") || lowered.includes("end"))
      ) {
         defaults[key] = formatDateParam(now);
      }
   });

   return defaults;
};

const slugify = (value: string) =>
   value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "report";

const formatParameterName = (name: string) => {
   return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
};

function Reports() {
   const { t } = useTranslation("reports");
   const { can } = usePermissions();
   const canViewReports = can("reports.view");

   const [search, setSearch] = useState("");
   const [activeCategory, setActiveCategory] = useState<string>("All");
   const [sort, setSort] = useState<SortOption["id"]>("title-asc");
   const [exportingKey, setExportingKey] = useState<string | null>(null);
   const categoryFilter =
      activeCategory !== "All" ? activeCategory : undefined;
   const sortFieldMap: Record<string, { field: string; order: "asc" | "desc" }> = {
      "title-asc": { field: "title", order: "asc" },
      "title-desc": { field: "title", order: "desc" },
      category: { field: "category", order: "asc" },
      parameters: { field: "parameters", order: "desc" },
   };
   const sortParams = sortFieldMap[sort] || sortFieldMap["title-asc"];

   const { data: reports = [], isLoading, isError, refetch } = useListReports(
      undefined,
      {
         enabled: canViewReports,
      }
   );

   // Modal state
   const [selectedReport, setSelectedReport] =
      useState<ReportDefinition | null>(null);
   const [modalParams, setModalParams] = useState<Record<string, string>>({});
   const [initialModalParams, setInitialModalParams] = useState<
      Record<string, string>
   >({});
   const [exportFormat, setExportFormat] = useState<"csv" | "xls">("xls");
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

   const categories = useMemo(
      () => ["All", ...Array.from(new Set(reports.map((report) => report.category)))],
      [reports]
   );

   const filteredReports = useMemo(() => {
      let next = reports;
      const normalizedSearch = search.trim().toLowerCase();
      if (normalizedSearch) {
         next = next.filter((report) => {
            const title = report.title?.toLowerCase() || "";
            const description = report.description?.toLowerCase() || "";
            const category = report.category?.toLowerCase() || "";
            const parameters = (report.parameters || [])
               .map((param) => param.name?.toLowerCase() || "")
               .join(" ");
            return (
               title.includes(normalizedSearch) ||
               description.includes(normalizedSearch) ||
               category.includes(normalizedSearch) ||
               parameters.includes(normalizedSearch)
            );
         });
      }

      if (categoryFilter) {
         next = next.filter((report) => report.category === categoryFilter);
      }

      const sorted = [...next];
      const { field, order } = sortParams;
      sorted.sort((a, b) => {
         if (field === "parameters") {
            const diff =
               (a.parameters?.length || 0) - (b.parameters?.length || 0);
            return order === "asc" ? diff : -diff;
         }
         const left = String((a as Record<string, unknown>)[field] ?? "").toLowerCase();
         const right = String((b as Record<string, unknown>)[field] ?? "").toLowerCase();
         const comparison = left.localeCompare(right);
         return order === "asc" ? comparison : -comparison;
      });

      return sorted;
   }, [reports, search, categoryFilter, sortParams]);

   const handleExportClick = (report: ReportDefinition) => {
      // Always open modal for all reports
      const defaults = buildDefaultParams(report);
      setSelectedReport(report);
      setModalParams(defaults);
      setInitialModalParams(defaults);
      setExportFormat("xls"); // Reset to default
   };

   const performExport = async (
      report: ReportDefinition,
      params: Record<string, string>,
      format: "csv" | "xls"
   ) => {
      try {
         setExportingKey(report.key);
         const blob = await reportsService.export(report.key, params, format);
         const url = window.URL.createObjectURL(blob);
         const link = document.createElement("a");
         link.href = url;
         const filename = `${slugify(report.title)}.${format}`;
         link.download = filename;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         window.URL.revokeObjectURL(url);
         toast.success(t("messages.exportSuccess"), report.title);
         setSelectedReport(null);
      } catch (error) {
         console.error("Failed to export report", error);
         toast.error(
            t("messages.exportError"),
            t("messages.exportErrorDescription")
         );
      } finally {
         setExportingKey(null);
      }
   };

   const handleModalExport = () => {
      if (!selectedReport) return;

      // Validate required parameters
      const missingRequired = selectedReport.parameters?.some(
         (param) => param.required && !modalParams[param.name]
      );

      if (missingRequired) {
         toast.error(
            t("validation.missingFieldsTitle"),
            t("validation.missingFieldsDescription")
         );
         return;
      }

      performExport(selectedReport, modalParams, exportFormat);
   };

   const isModalDirty = useMemo(() => {
      if (!selectedReport) return false;
      const keys = new Set([
         ...Object.keys(initialModalParams),
         ...Object.keys(modalParams),
      ]);
      for (const key of keys) {
         if ((initialModalParams[key] || "") !== (modalParams[key] || "")) {
            return true;
         }
      }
      return exportFormat !== "xls";
   }, [exportFormat, initialModalParams, modalParams, selectedReport]);

   const handleModalClose = () => {
      if (isModalDirty) {
         setShowDiscardConfirm(true);
         return;
      }
      setSelectedReport(null);
   };

   // TODO: Consistency - Standardized to show full page layout with header.
   // Permission guard
   if (!canViewReports) {
      return (
         <NoPermissionMessage
            message={`You don't have permission to view this section. Missing: ${formatPermissionName("reports.view")}`}
         />
      );
   }

   const renderContent = () => {
      if (isLoading) {
         return <LoadingState label={t("title")} />;
      }

      if (isError) {
         return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-bg-weak p-8 text-center">
               <p className="text-sm text-text-sub">{t("couldNotLoad")}</p>
               <Button variant="secondary" onClick={() => refetch()}>
                  {t("tryAgain")}
               </Button>
            </div>
         );
      }

      return (
         <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 xl:grid-cols-4">
               {filteredReports.map((report) => (
                  <div
                     key={report.key}
                     className="flex flex-col justify-between gap-5 rounded-[20px] border border-border bg-background p-5 shadow-subtle">
                     {/* Header */}
                     <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-medium leading-6 tracking-tight text-text-strong">
                           {report.title}
                        </h3>
                        <p className="text-sm leading-5 text-text-sub">
                           {report.description}
                        </p>
                     </div>

                     {/* Tag and Button */}
                     <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap gap-2">
                           <span className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium text-text-sub">
                              {report.category}
                           </span>
                        </div>

                        <Button
                           variant="primary"
                           className="w-full justify-center gap-1 rounded-lg p-2"
                           onClick={() => handleExportClick(report)}
                           disabled={exportingKey === report.key}>
                           <DownloadBracket
                              size={20}
                              className="fill-current"
                           />
                           {exportingKey === report.key
                              ? t("preparing")
                              : t("export")}
                        </Button>
                     </div>
                  </div>
               ))}
            </div>

            {filteredReports.length === 0 ? (
               <div className="rounded-xl border border-dashed border-border bg-bg-weak px-4 py-8 text-center text-text-sub">
                  {t("noReportsFound")}
               </div>
            ) : null}
         </>
      );
   };

   return (
      <>
            <div className="flex flex-row items-center justify-between gap-3">
               <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search Reports"
                  className="w-[320px] rounded-xl bg-background"
               />

               <div className="w-44">
                  <SortDropdown
                     label={`Sort by: ${
                        sortOptions.find((option) => option.id === sort)
                           ?.label || "Title A-Z"
                     }`}
                     options={sortOptions}
                     onSelect={setSort}
                  />
               </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm ps-0.5m">
               {categories.map((category) => {
                  const isActive = category === activeCategory;
                  return (
                     <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`pb-3 border-b-2 text-sm transition-colors ${
                           isActive
                              ? "border-primary text-text-strong"
                              : "border-transparent text-text-sub hover:text-text-strong"
                        }`}>
                        {category}
                     </button>
                  );
               })}
            </div>

            <div className="mt-6 flex-1 overflow-y-auto">{renderContent()}</div>

         {/* Export Parameters Modal */}
         <Modal
            isOpen={!!selectedReport}
            onClose={handleModalClose}
            title={selectedReport?.title}
            overflow="visible"
            size="medium"
            footer={
               <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-4">
                     <span className="text-sm font-medium text-text-strong">
                        {t("exportFormat")}:
                     </span>
                     <div className="flex items-center gap-4">
                        <Radio
                           name="export-format"
                           value="csv"
                           label="CSV"
                           checked={exportFormat === "csv"}
                           onChange={() => setExportFormat("csv")}
                        />
                        <Radio
                           name="export-format"
                           value="xls"
                           label="XLS"
                           checked={exportFormat === "xls"}
                           onChange={() => setExportFormat("xls")}
                        />
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <Button
                        variant="secondary"
                        onClick={handleModalClose}>
                        {t("cancel")}
                     </Button>
                     <Button
                        variant="primary"
                        onClick={handleModalExport}
                        disabled={
                           exportingKey === selectedReport?.key ||
                           selectedReport?.parameters?.some(
                              (param) =>
                                 param.required && !modalParams[param.name]
                           )
                        }
                        className="gap-2">
                        <DownloadBracket size={16} className="fill-current" />
                        {exportingKey === selectedReport?.key
                           ? t("preparing")
                           : `${t("export")} ${exportFormat.toUpperCase()}`}
                     </Button>
                  </div>
               </div>
            }>
            <div className="flex flex-col gap-4">
               {selectedReport?.parameters &&
               selectedReport.parameters.length > 0 ? (
                  selectedReport.parameters.map((param) => {
                     const value = modalParams[param.name] || "";
                     const isDate =
                        param.type === "date" ||
                        param.name.toLowerCase().includes("date") ||
                        param.name.toLowerCase().includes("from") ||
                        param.name.toLowerCase().includes("to") ||
                        param.name.toLowerCase().includes("start") ||
                        param.name.toLowerCase().includes("end");

                     return (
                        <label
                           key={`${selectedReport.key}-${param.name}`}
                           className="flex flex-col gap-2">
                           <span className="text-sm font-medium text-text-strong">
                              {formatParameterName(param.name)}
                              {param.required && (
                                 <span className="text-primary"> *</span>
                              )}
                           </span>
                           {isDate ? (
                              <DatePicker
                                 value={parseDateParam(value)}
                                 onChange={(date) =>
                                    setModalParams((prev) => ({
                                       ...prev,
                                       [param.name]: formatDateParam(date),
                                    }))
                                 }
                                 placeholder={t("placeholders.selectDate")}
                                 className="bg-background"
                              />
                           ) : (
                              <Input
                                 value={value}
                                 onChange={(event) =>
                                    setModalParams((prev) => ({
                                       ...prev,
                                       [param.name]: event.target.value,
                                    }))
                                 }
                                 placeholder={`${t(
                                    "placeholders.enter"
                                 )} ${formatParameterName(param.name)}`}
                              />
                           )}
                        </label>
                     );
                  })
               ) : (
                  <p className="text-sm text-center py-4 text-text-sub">
                     {t("noDateRange")}
                  </p>
               )}
            </div>
         </Modal>
         <ConfirmModal
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={() => {
               setShowDiscardConfirm(false);
               setSelectedReport(null);
            }}
            title={t("unsaved.title")}
            description={t("unsaved.description")}
            confirmText={t("unsaved.confirm")}
            cancelText={t("unsaved.cancel")}
         />
      </>
   );
}

export default Reports;
