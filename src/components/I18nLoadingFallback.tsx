/** @format */

/**
 * Loading fallback component for i18n Suspense
 */
const I18nLoadingFallback = () => (
   <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
         <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
         <p className="text-sm text-text-soft">Loading...</p>
      </div>
   </div>
);

export default I18nLoadingFallback;
