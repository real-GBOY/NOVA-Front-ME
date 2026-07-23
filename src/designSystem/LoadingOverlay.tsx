import Loader from "./Loader";

interface LoadingOverlayProps {
   isLoading: boolean;
   message?: string;
}

export default function LoadingOverlay({
   isLoading,
   message,
}: LoadingOverlayProps) {
   if (!isLoading) return null;

   return (
      <div className="fixed inset-0 z-[1000] flex h-screen w-screen items-center justify-center bg-overlay backdrop-blur-sm">
         <div className="flex flex-col items-center gap-4 shadow-2xl">
            <Loader size={80} />
            {message && (
               <p className="text-sm font-medium text-text-sub animate-pulse">
                  {message}
               </p>
            )}
         </div>
      </div>
   );
}
