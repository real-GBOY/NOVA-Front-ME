/** @format */

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { SubtractLine, Plus, Print, DownloadBracket, CloseLine } from "@/Icons";
import LoadingState from "@/designSystem/LoadingState";
import { downloadFile } from "@/utils/file";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

// Use the worker from react-pdf's bundled pdfjs to avoid version mismatch
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfPreviewModalProps {
   isOpen: boolean;
   fileUrl?: string;
   fileName?: string;
   onClose: () => void;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 2;
const SCALE_STEP = 0.25;

function PdfPreviewModal({
   isOpen,
   fileUrl,
   fileName,
   onClose,
}: PdfPreviewModalProps) {
   const [numPages, setNumPages] = useState(0);
   const [pageNumber, setPageNumber] = useState(1);
   const [scale, setScale] = useState(0.8);
   const [showSidebar, setShowSidebar] = useState(true);
   const scrollContainerRef = useRef<HTMLDivElement>(null);

   const resetState = () => {
      setNumPages(0);
      setPageNumber(1);
      setScale(0.8);
   };

   const handleClose = useCallback(() => {
      resetState();
      onClose();
   }, [onClose]);

   // Lock body scroll when modal is open
   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "";
      }
      return () => {
         document.body.style.overflow = "";
      };
   }, [isOpen]);

   // Handle escape key
   useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
         if (e.key === "Escape") {
            handleClose();
         }
      };
      if (isOpen) {
         document.addEventListener("keydown", handleEscape);
      }
      return () => {
         document.removeEventListener("keydown", handleEscape);
      };
   }, [isOpen, handleClose]);

   const handleDocumentLoadSuccess = ({
      numPages: loadedPages,
   }: {
      numPages: number;
   }) => {
      setNumPages(loadedPages);
      setPageNumber(1);
   };

   const handleDownload = () => {
      if (!fileUrl) return;
      downloadFile({ url: fileUrl, fileName });
   };

   const handlePrint = () => {
      if (!fileUrl) return;
      const printWindow = window.open(fileUrl, "_blank");
      printWindow?.focus();
      printWindow?.print();
   };

   const zoomOut = () =>
      setScale((prev) => Math.max(MIN_SCALE, prev - SCALE_STEP));
   const zoomIn = () =>
      setScale((prev) => Math.min(MAX_SCALE, prev + SCALE_STEP));

   const goToPage = useCallback(
      (page: number) => {
         setPageNumber(Math.max(1, Math.min(page, numPages)));
      },
      [numPages]
   );

   // Handle scroll for page navigation when not zoomed
   const handleScroll = useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
         if (scale !== 0.8) return; // Only work at default zoom (80%)

         const container = e.currentTarget;
         const { scrollTop, scrollHeight, clientHeight } = container;
         const scrollThreshold = 50; // pixels from edge to trigger

         // Scrolled to bottom - go to next page
         if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
            if (pageNumber < numPages) {
               goToPage(pageNumber + 1);
               container.scrollTop = 0; // Reset scroll to top of new page
            }
         }
         // Scrolled to top - go to previous page
         else if (scrollTop < scrollThreshold && scrollTop > 0) {
            if (pageNumber > 1) {
               goToPage(pageNumber - 1);
               container.scrollTop = scrollHeight; // Scroll to bottom of previous page
            }
         }
      },
      [scale, pageNumber, numPages, goToPage]
   );

   const thumbnails = useMemo(() => {
      if (!numPages) return null;
      return Array.from({ length: numPages }, (_, index) => {
         const page = index + 1;
         const isActive = pageNumber === page;

         return (
            <div
               key={`thumb-${page}`}
               className="flex flex-col items-center gap-2">
               <button
                  type="button"
                  onClick={() => goToPage(page)}
                  className={`w-24 h-[124px] rounded-lg border shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-0 ${
                     isActive
                        ? "border-[5px] border-primary/24"
                        : "border border-border"
                  }`}>
                  <Page
                     pageNumber={page}
                     width={96}
                     renderTextLayer={false}
                     renderAnnotationLayer={false}
                     className="w-full h-full pointer-events-none"
                  />
               </button>
               <span
                  className={`text-xs font-medium leading-4 ${
                     isActive ? "text-text-strong" : "text-text-soft"
                  }`}>
                  {page.toString().padStart(2, "0")}
               </span>
            </div>
         );
      });
   }, [numPages, pageNumber, goToPage]);

   const controls = (
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-background border border-border rounded-2xl shadow-[0px_46px_13px_0px_rgba(38,38,38,0),0px_29px_12px_0px_rgba(38,38,38,0.01),0px_16px_10px_0px_rgba(38,38,38,0.05),0px_7px_7px_0px_rgba(38,38,38,0.09),0px_2px_4px_0px_rgba(38,38,38,0.1)] flex items-center gap-4 px-3 py-2.5 z-10">
         <div className="flex items-center gap-1.5">
            <div className="bg-background border border-border rounded-lg px-3 py-1 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]">
               <span className="text-sm text-text-sub">{pageNumber}</span>
            </div>
            <span className="text-sm text-text-sub">/ {numPages || 1}</span>
         </div>

         <div className="bg-border h-4 w-px rounded-full" />

         <div className="flex items-center gap-0.5">
            <button
               type="button"
               onClick={zoomOut}
               className="p-0.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-weak rounded transition-colors"
               disabled={scale <= MIN_SCALE}>
               <SubtractLine size={20} />
            </button>
            <div className="bg-background border border-border rounded-lg px-4 py-1 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] min-w-[60px] text-center">
               <span className="text-sm text-text-sub">
                  {Math.round((scale / 0.8) * 100)}%
               </span>
            </div>
            <button
               type="button"
               onClick={zoomIn}
               className="p-0.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-weak rounded transition-colors"
               disabled={scale >= MAX_SCALE}>
               <Plus size={20} />
            </button>
         </div>

         <div className="bg-border h-4 w-px rounded-full" />

         <div className="flex items-center gap-2">
            <button
               type="button"
               onClick={handlePrint}
               className="flex items-center gap-0.5 px-1.5 py-1 bg-background border border-border rounded-[10px] text-sm font-medium text-text-sub hover:bg-bg-weak transition-colors shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]">
               <Print size={16} />
               <span className="px-1">Print</span>
            </button>
            <button
               type="button"
               onClick={handleDownload}
               className="flex items-center gap-0.5 px-1.5 py-1 bg-text-strong text-background rounded-[10px] text-sm font-medium hover:bg-text-strong/90 transition-colors">
               <DownloadBracket size={16} className="fill-background" />
               <span className="px-1">Download</span>
            </button>
         </div>
      </div>
   );

   if (!isOpen) return null;

   return (
      <div
         className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/24 backdrop-blur-sm"
         onClick={handleClose}>
         <div
            className="relative w-[80dvw] h-[95dvh] bg-background border border-border rounded-3xl shadow-[0px_16px_32px_-12px_rgba(14,18,27,0.1)] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start gap-3 p-4 border-b border-border shrink-0">
               <div className="flex flex-1 items-center gap-3 overflow-hidden">
                  <button
                     type="button"
                     onClick={() => setShowSidebar(!showSidebar)}
                     className="p-0.5 hover:bg-bg-weak rounded-md transition-colors">
                     <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="fill-text-sub">
                        <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
                     </svg>
                  </button>
                  <h2 className="text-base font-medium text-text-strong tracking-tight leading-6">
                     {fileName || "Contract Document"}
                  </h2>
               </div>
               <button
                  type="button"
                  onClick={handleClose}
                  className="p-0.5 hover:bg-bg-weak rounded-md transition-colors">
                  <CloseLine size={20} />
               </button>
            </div>

            {/* Content */}
            {!fileUrl ? (
               <div className="flex-1 flex items-center justify-center bg-bg-weak">
                  <p className="text-text-sub text-sm">No document selected.</p>
               </div>
            ) : (
               <div className="flex flex-1 min-h-0 overflow-hidden">
                  {/* Thumbnail sidebar */}
                  {showSidebar && (
                     <div className="bg-background border-r border-border flex flex-col gap-4 pt-8 px-8 pb-0 overflow-y-auto shrink-0">
                        <Document
                           key={`${fileUrl}-thumbs`}
                           file={fileUrl}
                           loading={null}
                           error={null}>
                           {thumbnails}
                        </Document>
                     </div>
                  )}

                  {/* Main page view */}
                  <div className="relative flex-1 bg-bg-weak overflow-hidden">
                     <Document
                        key={`${fileUrl}-main`}
                        file={fileUrl}
                        onLoadSuccess={handleDocumentLoadSuccess}
                        loading={
                           <div className="absolute inset-0 flex items-center justify-center">
                              <LoadingState
                                 size="medium"
                                 label="Loading document..."
                              />
                           </div>
                        }
                        error={
                           <div className="absolute inset-0 flex items-center justify-center text-sm text-danger px-6 text-center">
                              Unable to load this PDF. Please download the file
                              instead.
                           </div>
                        }>
                        <div
                           ref={scrollContainerRef}
                           onScroll={handleScroll}
                           className="absolute inset-0 overflow-auto flex justify-center p-8">
                           <div className="flex items-start">
                              <Page
                                 pageNumber={pageNumber}
                                 scale={scale}
                                 renderTextLayer={true}
                                 renderAnnotationLayer={true}
                                 className="shadow-[0px_28px_8px_0px_rgba(23,23,23,0),0px_18px_7px_0px_rgba(23,23,23,0.01),0px_10px_6px_0px_rgba(23,23,23,0.05),0px_4px_4px_0px_rgba(23,23,23,0.09),0px_1px_2px_0px_rgba(23,23,23,0.1)] bg-background rounded-xl"
                              />
                           </div>
                        </div>
                     </Document>
                     {controls}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}

export default PdfPreviewModal;
