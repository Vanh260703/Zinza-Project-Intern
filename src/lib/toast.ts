import { toast } from "sonner";
import { createElement } from "react";
import CountdownToast from "@/components/ui/CountdownToast";

const DURATION = 3000;

export const showToast = {
  success: (title: string, description?: string) => {
    toast.custom(
      (t) => createElement(CountdownToast, { type: "success", title, description, duration: DURATION, toastId: t }),
      { duration: DURATION }
    );
  },
  error: (title: string, description?: string) => {
    toast.custom(
      (t) => createElement(CountdownToast, { type: "error", title, description, duration: DURATION, toastId: t }),
      { duration: DURATION }
    );
  },
};
