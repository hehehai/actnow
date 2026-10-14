import { lazy } from "react";

// App Dialogs
export const LazyChangeEmailDialog = lazy(() =>
  import("@/components/features/app/profile/change-email-dialog").then((m) => ({
    default: m.ChangeEmailDialog,
  }))
);

export const LazyVerifyEmailDialog = lazy(() =>
  import("@/components/features/app/profile/verify-email-dialog").then((m) => ({
    default: m.VerifyEmailDialog,
  }))
);

export const LazySetPasswordDialog = lazy(() =>
  import("@/components/features/app/profile/set-password-dialog").then((m) => ({
    default: m.SetPasswordDialog,
  }))
);

export const LazyChangePasswordDialog = lazy(() =>
  import("@/components/features/app/profile/change-password-dialog").then(
    (m) => ({
      default: m.ChangePasswordDialog,
    })
  )
);

export const LazyFeedbackDialog = lazy(() =>
  import("@/components/features/app/feedback/feedback-dialog").then((m) => ({
    default: m.FeedbackDialog,
  }))
);

export const LazyPostFormDialog = lazy(() =>
  import("@/components/features/app/post/post-form-dialog").then((m) => ({
    default: m.PostFormDialog,
  }))
);

export const LazyPanelPostFormDialog = lazy(() =>
  import("@/components/features/panel/posts/post-form-dialog").then((m) => ({
    default: m.PostFormDialog,
  }))
);

export const LazyConfirmDialog = lazy(() =>
  import("@/components/shared/confirm-dialog").then((m) => ({
    default: m.ConfirmDialog,
  }))
);

export const LazyFilterDialog = lazy(() =>
  import("@/components/features/app/filter/filter-dialog").then((m) => ({
    default: m.FilterDialog,
  }))
);

export const LazyImagePreviewDialog = lazy(() =>
  import("@/components/features/common/media/image-preview-dialog").then(
    (m) => ({
      default: m.ImagePreviewDialog,
    })
  )
);

// Panel Sheets
export const LazyUserDetailSheet = lazy(() =>
  import("@/components/features/panel/users/user-detail-sheet").then((m) => ({
    default: m.UserDetailSheet,
  }))
);

export const LazyPostDetailSheet = lazy(() =>
  import("@/components/features/panel/posts/post-detail-sheet").then((m) => ({
    default: m.PostDetailSheet,
  }))
);

export const LazyFeedbackDetailSheet = lazy(() =>
  import("@/components/features/panel/feedback/feedback-detail-sheet").then(
    (m) => ({
      default: m.FeedbackDetailSheet,
    })
  )
);
