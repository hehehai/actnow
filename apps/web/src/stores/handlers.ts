import { Dialog } from "@base-ui/react/dialog";

// User Detail Sheet
export const userDetailSheet = Dialog.createHandle<{ userId: string }>();
export const postDetailSheet = Dialog.createHandle<{ postId: string }>();
export const feedbackDetailSheet = Dialog.createHandle<{
  feedbackId: string;
}>();
export const panelPostFormDialog = Dialog.createHandle<{
  mode: "create" | "edit";
  post?: {
    id: string;
    prompt: string | null;
    comment: string | null;
    media: string[] | null;
    isPublic: boolean;
    tagIds: string[];
  };
}>();

// User Profile Dialog (for app section)
export const userProfileDialog = Dialog.createHandle();

// Feedback Dialog (for app section)
export const feedbackDialog = Dialog.createHandle();

// Post Dialog (for app section)
export const postFormDialog = Dialog.createHandle<{
  mode: "create" | "edit";
  post?: {
    id: string;
    prompt: string | null;
    comment: string | null;
    media: string[] | null;
    isPublic: boolean;
    tagIds: string[];
  };
}>();

// Profile Settings Dialogs
export const changeEmailDialog = Dialog.createHandle<{
  currentEmail: string;
}>();
export const verifyEmailDialog = Dialog.createHandle<{ email: string }>();
export const setPasswordDialog = Dialog.createHandle();
export const changePasswordDialog = Dialog.createHandle();

// Filter Dialog (for global search)
export const filterDialog = Dialog.createHandle<
  | {
      initialQuery?: string;
      initialTags?: string[];
    }
  | undefined
>();

// Image Preview Dialog
export const imagePreviewDialog = Dialog.createHandle<{
  src?: string;
  images?: string[];
  index?: number;
  alt?: string;
  title?: string;
  filename?: string;
}>();
