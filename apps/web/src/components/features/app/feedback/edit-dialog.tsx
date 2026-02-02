import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FeedbackRow } from "./types";
import { useFeedbackActions } from "./use-submit-actions";

interface EditFeedbackDialogProps {
  submission: FeedbackRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFeedbackDialog({
  submission,
  open,
  onOpenChange,
}: EditFeedbackDialogProps) {
  const actions = useFeedbackActions();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [snapshots, setSnapshots] = useState<string[]>([""]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (submission) {
      setTitle(submission.title);
      setContent(submission.content ?? "");
      setSnapshots(
        submission.snapshots?.length ? submission.snapshots.slice(0, 3) : [""]
      );
      setErrors({});
    }
  }, [submission]);

  const canAddSnapshot = useMemo(
    () => snapshots.length < 3 && snapshots.every((value) => value.trim()),
    [snapshots]
  );

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!title.trim()) {
      nextErrors.title = "Title is required";
    } else if (title.length > 200) {
      nextErrors.title = "Title must be under 200 characters";
    }

    if (!content.trim()) {
      nextErrors.content = "Content is required";
    } else if (content.length > 2000) {
      nextErrors.content = "Content must be under 2000 characters";
    }

    const cleanSnapshots = snapshots.filter((value) => value.trim());
    if (cleanSnapshots.length > 3) {
      nextErrors.snapshots = "You can provide up to 3 snapshots";
    }
    cleanSnapshots.forEach((url, index) => {
      try {
        new URL(url);
      } catch {
        nextErrors[`snapshot-${index}`] = "Invalid URL";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!(submission && validate())) return;

    await actions.update.mutateAsync({
      id: submission.id,
      title: title.trim(),
      content: content.trim(),
      snapshots: snapshots.filter((value) => value.trim()),
    });

    onOpenChange(false);
  };

  if (!submission) return null;
  const isPending = submission.status === "PENDING";

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Feedback</DialogTitle>
          <DialogDescription>
            {isPending
              ? "Update your feedback while it is still pending."
              : "Feedback has been replied. Updates will keep the reply attached."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="feedback-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="feedback-title"
              maxLength={200}
              onChange={(event) => setTitle(event.target.value)}
              value={title}
            />
            {errors.title && (
              <p className="text-destructive text-xs">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-content">
              Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="feedback-content"
              maxLength={2000}
              onChange={(event) => setContent(event.target.value)}
              rows={4}
              value={content}
            />
            {errors.content && (
              <p className="text-destructive text-xs">{errors.content}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Snapshots (optional)</Label>
            <div className="space-y-2">
              {snapshots.map((value, index) => (
                <div className="flex items-center gap-2" key={index}>
                  <Input
                    onChange={(event) => {
                      const next = [...snapshots];
                      next[index] = event.target.value;
                      setSnapshots(next);
                    }}
                    placeholder="https://images.example.com/screenshot.jpg"
                    value={value}
                  />
                  {snapshots.length > 1 && (
                    <Button
                      onClick={() => {
                        setSnapshots((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <span className="i-hugeicons-delete-03" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {errors.snapshots && (
              <p className="text-destructive text-xs">{errors.snapshots}</p>
            )}
            {snapshots.map((_, index) => {
              const errorKey = `snapshot-${index}`;
              if (!errors[errorKey]) return null;
              return (
                <p className="text-destructive text-xs" key={errorKey}>
                  Snapshot {index + 1}: {errors[errorKey]}
                </p>
              );
            })}
            {canAddSnapshot && (
              <Button
                onClick={() => setSnapshots((prev) => [...prev, ""])}
                size="sm"
                type="button"
                variant="outline"
              >
                Add Snapshot
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={actions.update.isPending} type="submit">
              {actions.update.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
