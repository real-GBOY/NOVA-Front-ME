/** @format */

import { toast as sonnerToast } from "sonner";
import { ToastContent } from "@/designSystem/Toast";

export const toast = {
   success: (message: string, boldText?: string) => {
      sonnerToast.custom(
         (t) => (
            <ToastContent
               message={message}
               boldText={boldText}
               type="success"
               onClose={() => sonnerToast.dismiss(t)}
            />
         ),
         {
            duration: 4000,
         }
      );
   },
   error: (message: string, boldText?: string) => {
      sonnerToast.custom(
         (t) => (
            <ToastContent
               message={message}
               boldText={boldText}
               type="error"
               onClose={() => sonnerToast.dismiss(t)}
            />
         ),
         {
            duration: 4000,
         }
      );
   },
   info: (message: string, boldText?: string) => {
      sonnerToast.custom(
         (t) => (
            <ToastContent
               message={message}
               boldText={boldText}
               type="info"
               onClose={() => sonnerToast.dismiss(t)}
            />
         ),
         {
            duration: 4000,
         }
      );
   },
};

export default toast;
