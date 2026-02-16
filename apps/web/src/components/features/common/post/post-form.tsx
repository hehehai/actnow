import { useState } from "react";
import { toast } from "sonner";
import { MediaCarouselUpload } from "@/components/features/common/media/media-carousel-upload";
import { TagSelect } from "@/components/features/common/tag/tag-select";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const commentLimit = 500;
const promptLimit = 1000;

export type PostFormValues = {
  id?: string;
  prompt: string;
  comment: string;
  media: string[];
  isPublic: boolean;
  tagIds: string[];
};

interface PostFormProps {
  mode: "create" | "edit";
  initialValues?: {
    id?: string;
    prompt?: string | null;
    comment?: string | null;
    media?: string[] | null;
    isPublic?: boolean;
    tagIds?: string[];
  };
  isSubmitting?: boolean;
  uploadType?: "user" | "admin" | "public";
  onCancel?: () => void;
  onSubmit: (values: PostFormValues) => Promise<void> | void;
}

export function PostForm({
  mode,
  initialValues,
  isSubmitting = false,
  uploadType = "user",
  onCancel,
  onSubmit,
}: PostFormProps) {
  const [form, setForm] = useState<{
    id?: string;
    prompt: string;
    comment: string;
    media: Array<string | null>;
    isPublic: boolean;
    tagIds: string[];
  }>(() => ({
    id: initialValues?.id,
    prompt: initialValues?.prompt ?? "",
    comment: initialValues?.comment ?? "",
    media: initialValues?.media?.length ? initialValues.media : [null],
    isPublic: initialValues?.isPublic ?? false,
    tagIds: initialValues?.tagIds ?? [],
  }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.comment.trim()) {
      toast.error("Comment is required");
      return;
    }

    await onSubmit({
      id: form.id,
      prompt: form.prompt.trim(),
      comment: form.comment.trim(),
      media: form.media
        .map((url) => url?.trim() ?? "")
        .filter(Boolean)
        .slice(0, 10),
      isPublic: form.isPublic,
      tagIds: form.tagIds,
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="post-comment">Comment</Label>
            <Textarea
              className="h-20"
              id="post-comment"
              maxLength={commentLimit}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, comment: event.target.value }))
              }
              required
              rows={6}
              value={form.comment}
            />
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="text-pretty">
                Max {commentLimit} characters.
              </span>
              <span className="tabular-nums">
                {form.comment.length}/{commentLimit}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <MediaCarouselUpload
              addLabel="Add"
              disabled={isSubmitting}
              label={<Label>Medias</Label>}
              maxItems={10}
              mediaType="image"
              onChange={(next) => setForm((prev) => ({ ...prev, media: next }))}
              uploadType={uploadType}
              value={form.media}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="post-prompt">Prompt</Label>
            <Textarea
              className="h-50"
              id="post-prompt"
              maxLength={promptLimit}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, prompt: event.target.value }))
              }
              rows={6}
              value={form.prompt}
            />
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="text-pretty">Max {promptLimit} characters.</span>
              <span className="tabular-nums">
                {form.prompt.length}/{promptLimit}
              </span>
            </div>
          </div>

          <div>
            <Label className="mb-2">Tags</Label>
            <TagSelect
              matchBy="id"
              onChange={(value) =>
                setForm((prev) => ({ ...prev, tagIds: value }))
              }
              placeholder="Select tags..."
              value={form.tagIds}
            />
          </div>
        </div>
      </div>

      <DialogFooter className="py-3 sm:justify-between">
        <div className="flex items-center gap-3">
          <Label htmlFor="public">Public</Label>
          <Switch
            checked={form.isPublic}
            id="public"
            onCheckedChange={(value) =>
              setForm((prev) => ({ ...prev, isPublic: value }))
            }
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting
              ? "Saving..."
              : mode === "edit"
                ? "Save Post"
                : "Create Post"}
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
}
