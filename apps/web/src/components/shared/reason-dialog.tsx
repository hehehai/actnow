import type { DialogBackdropProps } from "@base-ui/react/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
  title: string;
  description: React.ReactNode;
  label?: string;
  placeholder?: string;
  confirmText?: string;
  confirmingText?: string;
  variant?: "default" | "destructive";
  overlayProps?: DialogBackdropProps;
}

export function ReasonDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  label = "Reason",
  placeholder = "Enter the reason...",
  confirmText = "Confirm",
  confirmingText = "Confirming...",
  variant = "destructive",
  overlayProps,
}: ReasonDialogProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError(`${label} is required`);
      return;
    }

    setLoading(true);
    try {
      await onConfirm(reason.trim());
      onOpenChange(false);
      setReason("");
      setError("");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setReason("");
      setError("");
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent overlayProps={overlayProps}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="reason-input">{label}</Label>
          <Textarea
            aria-invalid={!!error}
            disabled={loading}
            id="reason-input"
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            placeholder={placeholder}
            rows={3}
            value={reason}
          />
          {error && <FieldError>{error}</FieldError>}
        </div>

        <DialogFooter>
          <Button
            disabled={loading}
            onClick={() => handleOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={loading} onClick={handleConfirm} variant={variant}>
            {loading ? confirmingText : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
