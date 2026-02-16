import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { confirmDialog } from "@/components/shared/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCopy } from "@/hooks/use-copy";
import { orpc } from "@/lib/orpc";
import { userDetailSheet } from "@/stores/handlers";
import { BanDialog } from "./ban-dialog";
import { useUserActions } from "./use-user-actions";
import { UserDetailSkeleton } from "./user-detail-skeleton";
import { UserDetailTabs } from "./user-detail-tabs";
import { UserFormDialog } from "./user-form-dialog";

export function UserDetailSheet() {
  return (
    <Sheet<{ userId: string }> handle={userDetailSheet}>
      {({ payload }) =>
        payload && <UserDetailContent userId={payload.userId} />
      }
    </Sheet>
  );
}

function UserDetailContent({ userId }: { userId: string }) {
  const actions = useUserActions();
  const { copy } = useCopy();
  const [editOpen, setEditOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);

  const { data: user, isLoading: isUserLoading } = useQuery(
    orpc.panel.user.getById.queryOptions({
      input: { id: userId },
    })
  );

  const { data: stats, isLoading: isStatsLoading } = useQuery(
    orpc.panel.user.getUserStats.queryOptions({
      input: { id: userId },
    })
  );

  const handleCopyUserId = async () => {
    if (user) {
      const success = await copy(user.id);
      if (success) {
        toast.success("User ID copied to clipboard");
      }
    }
  };

  const handleCopyEmail = async () => {
    if (user) {
      const success = await copy(user.email);
      if (success) {
        toast.success("Email copied to clipboard");
      }
    }
  };

  const handleUpdate = async (data: {
    name: string;
    email: string;
    password?: string;
    role: "ADMIN" | "USER";
    image?: string | null;
  }) => {
    if (user) {
      await actions.update.mutateAsync({
        id: user.id,
        name: data.name,
        role: data.role,
        image: data.image,
        password: data.password,
      });
    }
  };

  const handleBan = async (userId: string, reason: string) => {
    await actions.ban.mutateAsync({ id: userId, reason });
    setBanOpen(false);
  };

  const handleUnban = async () => {
    if (user) {
      await actions.unban.mutateAsync({ id: user.id });
    }
  };

  const handleDelete = () => {
    if (!user) return;
    confirmDialog.openWithPayload({
      title: "Delete User",
      description: (
        <>
          Are you sure you want to delete{" "}
          <strong>{user.name || user.email}</strong>? This action cannot be
          undone.
        </>
      ),
      confirmText: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        await actions.remove.mutateAsync({ id: user.id });
        userDetailSheet.close();
      },
    });
  };

  const isLoading = isUserLoading || isStatsLoading;

  // Create a UserRow-compatible object for dialogs
  const userRow = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role === "ADMIN" ? "ADMIN" : "USER",
        image: user.image,
        banned: user.banned,
        banReason: user.banReason,
        createdAt: user.createdAt,
        lastSignedIn: null,
        subscription: user.subscription,
      }
    : null;

  return (
    <>
      <SheetContent
        className="h-full border-none bg-transparent p-3 shadow-none data-[side=right]:max-w-2xl data-[side=right]:sm:max-w-2xl"
        showCloseButton={false}
        side="right"
      >
        <div className="flex h-full w-full flex-col gap-4 rounded-xl bg-background shadow-lg">
          {isLoading || !user ? (
            <UserDetailSkeleton />
          ) : (
            <>
              {/* Fixed Header */}
              <div className="shrink-0">
                <SheetHeader className="flex-row items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-11">
                      <AvatarImage
                        alt={user.name}
                        src={user.image ?? undefined}
                      />
                      <AvatarFallback className="text-base">
                        {user.name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <SheetTitle className="text-base leading-none">
                          {user.name}
                        </SheetTitle>
                        <Badge
                          variant={
                            user.role === "ADMIN" ? "default" : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                        {user.banned && (
                          <Badge variant="destructive">Banned</Badge>
                        )}
                      </div>
                      <SheetDescription className="leading-none">
                        {user.email}
                      </SheetDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.banned && user.banReason && (
                      <div className="flex items-center gap-0.5">
                        <p className="text-muted-foreground text-sm">
                          {user.banReason}
                        </p>
                        <Badge variant="destructive">Baned</Badge>
                      </div>
                    )}
                    <SheetClose
                      className={buttonVariants({
                        size: "icon-sm",
                        variant: "outline",
                      })}
                    >
                      <span className="i-hugeicons-cancel-01 text-lg" />
                    </SheetClose>
                  </div>
                </SheetHeader>

                {/* Actions bar */}
                <div className="flex flex-wrap items-center gap-2 px-4 pb-2">
                  <Button
                    onClick={handleCopyUserId}
                    size="sm"
                    variant="outline"
                  >
                    <span className="i-hugeicons-copy-01 size-3.5" />
                    Copy ID
                  </Button>
                  <Button onClick={handleCopyEmail} size="sm" variant="outline">
                    <span className="i-hugeicons-mail-01 size-3.5" />
                    Copy Email
                  </Button>
                  <Separator
                    className="h-5 data-[orientation=vertical]:self-center"
                    orientation="vertical"
                  />
                  <Button
                    onClick={() => setEditOpen(true)}
                    size="sm"
                    variant="outline"
                  >
                    <span className="i-hugeicons-user-edit-01 size-3.5" />
                    Edit
                  </Button>
                  {user.banned ? (
                    <Button
                      disabled={actions.unban.isPending}
                      onClick={handleUnban}
                      size="sm"
                      variant="outline"
                    >
                      <span className="i-hugeicons-lock-key size-3.5" />
                      {actions.unban.isPending ? "Unbanning..." : "Unban"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setBanOpen(true)}
                      size="sm"
                      variant="outline"
                    >
                      <span className="i-hugeicons-lock-password size-3.5" />
                      Ban
                    </Button>
                  )}
                  <Button
                    onClick={handleDelete}
                    size="sm"
                    variant="destructive"
                  >
                    <span className="i-hugeicons-delete-03 size-3.5" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <div className="flex flex-col gap-6">
                  {/* Statistics */}
                  <section>
                    <h3 className="mb-3 font-medium text-sm">Statistics</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border p-3">
                        <p className="font-semibold text-2xl">
                          {stats?.totalPosts ?? 0}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Total Posts
                        </p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="font-semibold text-2xl">
                          {stats?.publicPosts ?? 0}
                        </p>
                        <p className="text-muted-foreground text-xs">Public</p>
                      </div>
                    </div>
                  </section>

                  {/* User Info */}
                  <section>
                    <h3 className="mb-3 font-medium text-sm">User Info</h3>
                    <div className="space-y-2">
                      <InfoRow
                        label="Created"
                        value={
                          user.createdAt
                            ? formatDistanceToNow(new Date(user.createdAt), {
                                addSuffix: true,
                              })
                            : "-"
                        }
                      />
                      <InfoRow
                        label="Updated"
                        value={
                          user.updatedAt
                            ? formatDistanceToNow(new Date(user.updatedAt), {
                                addSuffix: true,
                              })
                            : "-"
                        }
                      />
                      <InfoRow
                        label="Email Verified"
                        value={user.emailVerified ? "Yes" : "No"}
                      />
                    </div>
                  </section>

                  <section>
                    <UserDetailTabs user={user} />
                  </section>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>

      {userRow && (
        <>
          <UserFormDialog
            mode="edit"
            onOpenChange={setEditOpen}
            onSubmit={handleUpdate}
            open={editOpen}
            user={userRow}
          />

          <BanDialog
            onConfirm={handleBan}
            onOpenChange={setBanOpen}
            open={banOpen}
            user={userRow}
          />
        </>
      )}
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
