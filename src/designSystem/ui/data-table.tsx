/** @format */

import { MouseEvent, useEffect, useRef, useState } from "react";
import {
   useReactTable,
   getCoreRowModel,
   getPaginationRowModel,
   getSortedRowModel,
   getFilteredRowModel,
   ColumnDef,
   flexRender,
   SortingState,
   ColumnFiltersState,
   RowSelectionState,
   PaginationState,
   Table as TanStackTable,
} from "@tanstack/react-table";
import {
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/designSystem/ui/table";
import { useTranslation } from "@/hooks/useTranslation";
import { cn, isEnglishText } from "@/utilities/index";
import type { Namespace } from "@/config/i18n";
import Dropdown from "@/designSystem/Dropdown";
import { ArrowDownSLine, Dot } from "@/Icons";
import Loader from "@/designSystem/Loader";

export interface DataTableProps<TData, TValue> {
   columns: ColumnDef<TData, TValue>[];
   data: TData[];
   pageSize?: number;
   globalFilter?: string;
   onRowSelectionChange?: (selectedRows: TData[]) => void;
   enableRowSelection?: boolean;
   showPagination?: boolean;
   className?: string;
   translationNamespace?: Namespace;
   renderFloatingBar?: (
      selectedCount: number,
      selectedRows: TData[]
   ) => React.ReactNode;
   onRowClick?: (row: TData) => void;
   enableRowHover?: boolean;
   scrollContainerClassName?: string;
   pagination?: {
      pageIndex: number;
      pageSize: number;
   };
   pageSizeOptions?: number[];
   onPaginationChange?: (updater: any) => void;
   manualPagination?: boolean;
   pageCount?: number;
   resetSelectionSignal?: number;
   isLoading?: boolean;
}

interface DataTablePaginationProps<TData> {
   table: TanStackTable<TData>;
   translationNamespace?: Namespace;
   pageSizeOptions?: number[];
}

function DataTablePagination<TData>({
   table,
   translationNamespace = "common",
   pageSizeOptions = [10, 20, 50, 100],
}: DataTablePaginationProps<TData>) {
   const { t } = useTranslation(translationNamespace);
   const currentPage = table.getState().pagination.pageIndex + 1;
   const totalPagesRaw = table.getPageCount();
   const totalPages = totalPagesRaw > 0 ? totalPagesRaw : 1;
   const [isPageSizeDropdownOpen, setIsPageSizeDropdownOpen] =
      useState(false);
   const pageSizeButtonRef = useRef<HTMLButtonElement>(null);

   const pageSizeLabel = `${table.getState().pagination.pageSize} ${
      t("pagination.perPage")
   }`;

   const pageSizeItems = pageSizeOptions.map((pageSize) => ({
      id: String(pageSize),
      label: `${pageSize} ${t("pagination.perPage")}`,
      icon: Dot,
      onClick: () => {
         table.setPageSize(pageSize);
         setIsPageSizeDropdownOpen(false);
      },
   }));

   const rowsPerPageControl = (
      <>
         <span className="sr-only">{t("pagination.rowsPerPage")}</span>
         <button
            type="button"
            ref={pageSizeButtonRef}
            onClick={() =>
               setIsPageSizeDropdownOpen((prev) => !prev)
            }
            className="inline-flex items-center gap-2 px-2.5 py-1 text-[11px] md:text-sm text-text-sub border border-border rounded-lg bg-background hover:bg-bg-weak transition-colors w-full sm:w-auto justify-between">
            <span>{pageSizeLabel}</span>
            <ArrowDownSLine size={14} className="fill-current" />
         </button>
      </>
   );

   const pager = (
      <div className="flex flex-wrap items-center justify-center gap-1 md:gap-2">
         <button
            type="button"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 text-xs md:text-sm text-text-sub hover:bg-bg-weak rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
               «
            </button>
            <button
               type="button"
               onClick={() => table.previousPage()}
               disabled={!table.getCanPreviousPage()}
               className="px-2 py-1 text-xs md:text-sm text-text-sub hover:bg-bg-weak rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
               ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i).map(
               (pageIndex) => {
                  if (
                     pageIndex === 0 ||
                     pageIndex === totalPages - 1 ||
                     (pageIndex >= currentPage - 2 && pageIndex <= currentPage)
                  ) {
                     return (
                        <button
                           type="button"
                           key={pageIndex}
                           onClick={() => table.setPageIndex(pageIndex)}
                           className={`px-3 py-1 text-xs md:text-sm rounded ${
                              pageIndex === currentPage - 1
                                 ? "bg-primary text-text-main"
                                 : "text-text-sub hover:bg-bg-weak"
                           }`}>
                           {pageIndex + 1}
                        </button>
                     );
                  } else if (
                     pageIndex === currentPage - 3 ||
                     pageIndex === currentPage + 1
                  ) {
                     return (
                        <span key={pageIndex} className="px-2 text-text-sub text-xs md:text-sm">
                           ...
                        </span>
                     );
                  }
                  return null;
               }
            )}

            <button
               type="button"
               onClick={() => table.nextPage()}
               disabled={!table.getCanNextPage()}
               className="px-2 py-1 text-xs md:text-sm text-text-sub hover:bg-bg-weak rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
               ›
            </button>
            <button
               type="button"
               onClick={() => table.setPageIndex(totalPages - 1)}
               disabled={!table.getCanNextPage()}
               className="px-2 py-1 text-xs md:text-sm text-text-sub hover:bg-bg-weak rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
               »
            </button>
      </div>
   );

   return (
      <div className="flex flex-col gap-3 px-4 py-4 border border-border border-t-0 rounded-b-lg">
         <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-sub md:hidden">
            <span>
               {t("pagination.page")} {currentPage} {t("pagination.of")}{" "}
               {totalPages}
            </span>
            <div className="flex items-center gap-2">{pager}</div>
            <div className="flex items-center gap-2">{rowsPerPageControl}</div>
         </div>

         <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div className="text-sm text-text-sub md:justify-self-start">
               {t("pagination.page")} {currentPage} {t("pagination.of")}{" "}
               {totalPages}
            </div>
            {pager}
            <div className="flex flex-wrap items-center gap-2 md:justify-self-end md:justify-end">
               {rowsPerPageControl}
            </div>
         </div>

         <Dropdown
            isOpen={isPageSizeDropdownOpen}
            onClose={() => setIsPageSizeDropdownOpen(false)}
            anchorRef={pageSizeButtonRef}
            items={pageSizeItems}
            zIndex="z-50"
         />
      </div>
   );
}

export function DataTable<TData, TValue>({
   columns,
   data,
   pageSize = 10,
   globalFilter = "",
   onRowSelectionChange,
   enableRowSelection = false,
   showPagination = true,
   className,
   translationNamespace = "common",
   renderFloatingBar,
   onRowClick,
   enableRowHover = false,
   scrollContainerClassName,
   resetSelectionSignal,
   manualPagination,
   pageCount,
   pagination,
   pageSizeOptions,
   onPaginationChange,
   isLoading = false,
}: DataTableProps<TData, TValue>) {
   const { t } = useTranslation(translationNamespace);
   const [sorting, setSorting] = useState<SortingState>([]);
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
   const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
   
   // Manage pagination state internally when not provided externally
   const [internalPagination, setInternalPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize,
   });

   useEffect(() => {
      if (resetSelectionSignal !== undefined) {
         setRowSelection({});
      }
   }, [resetSelectionSignal]);

   // Update internal pagination pageSize when prop changes
   useEffect(() => {
      if (!pagination) {
         setInternalPagination((prev) => ({
            ...prev,
            pageSize,
         }));
      }
   }, [pageSize, pagination]);

   // Use external pagination if provided, otherwise use internal state
   const paginationState = pagination || internalPagination;
   const handlePaginationChange = onPaginationChange || setInternalPagination;

   const table = useReactTable({
      data,
      columns,
      state: {
         sorting,
         columnFilters,
         rowSelection,
         globalFilter,
         pagination: paginationState,
      },
      manualPagination,
      pageCount,
      onPaginationChange: handlePaginationChange,
      enableRowSelection,
      onRowSelectionChange: (updater) => {
         setRowSelection(updater);
         if (onRowSelectionChange) {
            const newSelection =
               typeof updater === "function" ? updater(rowSelection) : updater;
            const selectedRows = Object.keys(newSelection)
               .filter((key) => newSelection[key])
               .map((key) => data[parseInt(key)]);
            onRowSelectionChange(selectedRows);
         }
      },
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      ...(manualPagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
      globalFilterFn: "includesString",
      autoResetPageIndex: false, // Prevent auto-reset which causes infinite loops
      initialState: {
         pagination: {
            pageSize,
         },
      },
   });

   const handleRowClick = (
      event: MouseEvent<HTMLTableRowElement>,
      rowData: TData
   ) => {
      const target = event.target as HTMLElement | null;

      // Avoid triggering row actions when interacting with buttons/inputs/links inside the row
      if (
         target?.closest(
            "button, a, input, textarea, select, option, [data-row-click-ignore]"
         )
      ) {
         return;
      }

      if (onRowClick) {
         onRowClick(rowData);
         return;
      }

      // No preview handler, try to open the row action menu if it exists
      const menuTrigger =
         event.currentTarget.querySelector<HTMLElement>(
            "[data-row-menu-trigger]"
         );

      if (menuTrigger) {
         menuTrigger.click();
         menuTrigger.focus?.();
      }
   };

   return (
      <div className={cn("flex flex-col", className)}>
         <div className="relative border border-border rounded-t-lg overflow-hidden ">
            <div
               className={cn(
                  "overflow-auto",
                  scrollContainerClassName ?? "max-h-[62vh]"
               )}>
               <table className="w-full caption-bottom text-sm table-fixed">
                  <TableHeader className="bg-bg-weak sticky top-0 z-10">
                     {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                           key={headerGroup.id}
                           className="border-b border-border">
                           {headerGroup.headers.map((header) => (
                           <TableHead
                              key={header.id}
                              className={cn(
                                 "py-2 text-start text-sm font-normal text-text-strong bg-bg-weak",
                                 header.column.id === "select" &&
                                    "ps-3! pe-3!",
                                 header.column.id === "name" && "pe-3! px-0!",
                                 header.column.columnDef.meta?.className
                              )}
                              style={{ width: header.getSize() }}>
                                 {header.isPlaceholder ? null : (
                                    <div>
                                       {flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                       )}
                                    </div>
                                 )}
                              </TableHead>
                           ))}
                        </TableRow>
                     ))}
                  </TableHeader>
                     <TableBody className="bg-background">
                     {isLoading ? (
                        <TableRow>
                           <TableCell
                              colSpan={columns.length}
                              className="h-24 text-center">
                              <div className="flex justify-center items-center py-8">
                                 <Loader label={t("common:loading.general")} />
                              </div>
                           </TableCell>
                        </TableRow>
                     ) : table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => (
                           <TableRow
                              key={row.id}
                              data-state={row.getIsSelected() && "selected"}
                              className={cn(
                                 "border-b border-border last:border-b-0",
                                 (onRowClick || enableRowHover) &&
                                    "cursor-pointer hover:bg-bg-weak transition-colors"
                              )}
                              onClick={(event) =>
                                 handleRowClick(event, row.original)
                              }>
                              {row.getVisibleCells().map((cell) => {
                                 const cellValue = cell.getValue();
                                 const isEnglish = isEnglishText(cellValue);
                                 
                                 return (
                                    <TableCell
                                       key={cell.id}
                                       className={cn(
                                          "px-4 py-2.5 text-start",
                                          cell.column.id === "select" &&
                                             "ps-3! pe-3!",
                                          cell.column.id === "name" &&
                                             "pe-3! px-0!",
                                          isEnglish && "font-english",
                                          cell.column.columnDef.meta?.className
                                       )}
                                       style={{ width: cell.column.getSize() }}>
                                       {flexRender(
                                          cell.column.columnDef.cell,
                                          cell.getContext()
                                       )}
                                    </TableCell>
                                 );
                              })}
                           </TableRow>
                        ))
                     ) : (
                        <TableRow>
                           <TableCell
                              colSpan={columns.length}
                              className="h-24 text-center text-text-sub">
                              {t("table.noResults")}
                           </TableCell>
                        </TableRow>
                     )}
                  </TableBody>
               </table>
            </div>
            {renderFloatingBar &&
               renderFloatingBar(
                  Object.keys(rowSelection).filter((key) => rowSelection[key])
                     .length,
                  Object.keys(rowSelection)
                     .filter((key) => rowSelection[key])
                     .map((key) => data[parseInt(key)])
               )}
         </div>
         {showPagination && (
            <DataTablePagination
               table={table}
               translationNamespace="common"
               pageSizeOptions={pageSizeOptions}
            />
         )}
      </div>
   );
}
