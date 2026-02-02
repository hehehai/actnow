import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface ConfirmDialogPayload {
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => Promise<void> | void;
}

// Global handle for imperative usage
export const confirmDialog =
  AlertDialogPrimitive.createHandle<ConfirmDialogPayload>();

// Provider component - mount once at layout root
export function ConfirmDialog() {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async (payload: ConfirmDialogPayload) => {
    setIsLoading(true);
    try {
      await payload.onConfirm();
      confirmDialog.close();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog handle={confirmDialog}>
      {({ payload }) =>
        payload && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{payload.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {payload.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="py-2.5">
              <AlertDialogCancel disabled={isLoading}>
                {payload.cancelText ?? "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isLoading}
                onClick={(e) => {
                  e.preventDefault();
                  handleConfirm(payload);
                }}
                variant={payload.variant}
              >
                {isLoading
                  ? payload.variant === "destructive"
                    ? "Deleting..."
                    : "Loading..."
                  : (payload.confirmText ?? "Confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )
      }
    </AlertDialog>
  );
}
