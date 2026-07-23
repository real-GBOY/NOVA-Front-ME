import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "./ThemeProvider";
import { ColorsProvider } from "./ColorsProviders";

export const UIProvider = ({ children }: { children: ReactNode }) => {
   return (
      <ThemeProvider>
         <ColorsProvider>
            {children}
            <Toaster
               position="top-center"
               toastOptions={{
                  style: {
                     width: "100%",
                     left: "50%",
                     transform: "translateX(-50%)",
                  },
               }}
            />
         </ColorsProvider>
      </ThemeProvider>
   );
};
