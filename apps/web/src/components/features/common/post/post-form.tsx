import { useState } from "react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/features/common/media/image-upload";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type PostFormValues = {
  id?: string;
  title: string;
  description: string;
  cover: string | null;
  content: string;
  status: "draft" | "published";
};

interface PostFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<PostFormValues>;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (values: PostFormValues) => Promise<void> | void;
}

export function PostForm({
  mode,
  initialValues,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: PostFormProps) {
  const [form, setForm] = useState<PostFormValues>(() => ({
    id: initialValues?.id,
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    cover: initialValues?.cover ?? null,
    content: initialValues?.content ?? "",
    status: initialValues?.status ?? "draft",
  }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = form.title.trim();
    const content = form.content.trim();
    if (!title || !content) {
      toast.error("Add a title and content before saving.");
      return;
    }
    await onSubmit({
      ...form,
      title,
      content,
      description: form.description.trim(),
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_13rem]">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="post-title">Title</Label>
            <Input
              autoFocus
              id="post-title"
              maxLength={160}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="A clear, useful title"
              required
              value={form.title}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-description">Description</Label>
            <Textarea
              className="min-h-24 resize-y"
              id="post-description"
              maxLength={500}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              placeholder="A short summary for the content list"
              rows={3}
              value={form.description}
            />
            <p className="text-right text-muted-foreground text-xs">
              {form.description.length}/500
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-content">Content</Label>
            <Textarea
              className="min-h-72 resize-y leading-relaxed"
              id="post-content"
              onChange={(event) =>
                setForm((prev) => ({ ...prev, content: event.target.value }))
              }
              placeholder="Write the full article or page content…"
              required
              rows={14}
              value={form.content}
            />
          </div>
        </div>

        <aside className="space-y-5">
          <div className="space-y-2">
            <Label>Cover</Label>
            <ImageUpload
              className="w-full"
              onChange={(cover) => setForm((prev) => ({ ...prev, cover }))}
              size="cover"
              uploadType="admin"
              value={form.cover}
              variant="square"
            />
            <p className="text-muted-foreground text-xs">
              One image used in the feed and article header.
            </p>
          </div>
          <fieldset className="space-y-2">
            <legend className="font-medium text-sm">Status</legend>
            <div className="grid gap-2">
              <Button
                aria-pressed={form.status === "draft"}
                className="justify-start"
                onClick={() =>
                  setForm((prev) => ({ ...prev, status: "draft" }))
                }
                type="button"
                variant={form.status === "draft" ? "secondary" : "outline"}
              >
                <span className="i-hugeicons-edit-02 size-4" /> Draft
              </Button>
              <Button
                aria-pressed={form.status === "published"}
                className="justify-start"
                onClick={() =>
                  setForm((prev) => ({ ...prev, status: "published" }))
                }
                type="button"
                variant={form.status === "published" ? "default" : "outline"}
              >
                <span className="i-hugeicons-checkmark-circle-02 size-4" />{" "}
                Published
              </Button>
            </div>
          </fieldset>
        </aside>
      </div>

      <DialogFooter className="border-t border-border pt-4 sm:justify-between">
        <p className="mr-auto text-muted-foreground text-xs">
          Publishing makes this content visible to everyone.
        </p>
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
            ? "Saving…"
            : mode === "edit"
              ? "Save changes"
              : "Save content"}
        </Button>
      </DialogFooter>
    </form>
  );
}
