import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { MediaCarouselUpload } from "@/components/features/common/media/media-carousel-upload";
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
import { client, orpc } from "@/lib/orpc";
import { feedbackDialog } from "@/stores/handlers";

export function FeedbackDialog() {
  return (
    <Dialog handle={feedbackDialog}>
      <DialogContent className="sm:max-w-md">
        <FeedbackDialogContent />
      </DialogContent>
    </Dialog>
  );
}

function FeedbackDialogContent() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [snapshots, setSnapshots] = useState<Array<string | null>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (input: {
      title: string;
      content: string;
      snapshots: string[];
    }) => client.app.feedback.create(input),
    onSuccess: () => {
      toast.success("Feedback submitted");
      queryClient.invalidateQueries({
        queryKey: orpc.app.feedback.list.key(),
      });
      resetForm();
      feedbackDialog.close();
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSnapshots([]);
    setErrors({});
  };

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

    const cleanSnapshots = snapshots.map((value) => value?.trim() ?? "");
    const filledSnapshots = cleanSnapshots.filter(Boolean);
    if (filledSnapshots.length > 3) {
      nextErrors.snapshots = "You can upload up to 3 snapshots";
    }
    cleanSnapshots.forEach((url, index) => {
      if (!url) return;
      try {
        new URL(url);
      } catch {
        nextErrors[`snapshot-${index}`] = "Invalid URL";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    mutation.mutate({
      title: title.trim(),
      content: content.trim(),
      snapshots: snapshots.map((value) => value?.trim() ?? "").filter(Boolean),
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Share Feedback</DialogTitle>
        <DialogDescription>
          Tell us what you are building or what you’d like to see next.
        </DialogDescription>
      </DialogHeader>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="feedback-title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            aria-invalid={!!errors.title}
            id="feedback-title"
            maxLength={200}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="My idea..."
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
            aria-invalid={!!errors.content}
            id="feedback-content"
            maxLength={2000}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Describe your request or share your post details..."
            rows={4}
            value={content}
          />
          {errors.content && (
            <p className="text-destructive text-xs">{errors.content}</p>
          )}
        </div>

        <div className="space-y-2">
          <MediaCarouselUpload
            addLabel="Add"
            disabled={mutation.isPending}
            label="Snapshots (optional)"
            maxItems={3}
            mediaType="image"
            onChange={setSnapshots}
            value={snapshots}
          />
          {errors.snapshots && (
            <p className="text-destructive text-xs">{errors.snapshots}</p>
          )}
          {snapshots.map((_, index) => {
            const key = `snapshot-${index}`;
            if (!errors[key]) return null;
            return (
              <p className="text-destructive text-xs" key={key}>
                Snapshot {index + 1}: {errors[key]}
              </p>
            );
          })}
        </div>

        <DialogFooter>
          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
