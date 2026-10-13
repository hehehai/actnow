import {
  ensurePolarCustomerForUser,
  getPolarCustomerStateByExternalId,
} from "@actnow/auth/polar-customer";
import {
  getPolarPlanByProductIdMap,
  getSnapshotFromSubscriptions,
} from "@actnow/auth/subscription-snapshot";
import type { SocialLink } from "@actnow/common";
import { and, desc, eq, inArray, isNull, ne, sql } from "@actnow/db";
import { account, session, user } from "@actnow/db/schema/auth";
import { feedbacks } from "@actnow/db/schema/feedback";
import { postLikes, posts } from "@actnow/db/schema/posts";
import { postTags, tags } from "@actnow/db/schema/tags";
import { ORPCError } from "@orpc/server";
import type {
  ApiDb,
  AppContext,
  ProtectedAppContext,
} from "../../lib/context-types";
import { combineFilters, generateId, hashPassword } from "../../lib/utils";
import { groupTagsByPost } from "./post-shared";
import { buildProfileUpdateData, mapPostsWithTags } from "./user-shared";

type PopularUserItem = {
  id: string;
  name: string | null;
  image: string | null;
  totalLikes: number;
  totalPosts: number;
};

type PublicProfilePostRow = {
  post: {
    id: string;
    prompt: string | null;
    comment: string | null;
    media: string[] | null;
    likes: number;
    visits: number;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  author: {
    id: string | null;
    name: string | null;
    image: string | null;
  } | null;
};

type PublicProfileOutput = {
  user: {
    id: string;
    name: string;
    image: string | null;
    bio: string | null;
    socialLinks: SocialLink[];
    createdAt: Date;
  };
  posts: Array<
    PublicProfilePostRow & {
      tags: Array<{ id: string; name: string; value: string; type: string }>;
    }
  >;
};

type CurrentProfileOutput = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string | null;
  bio: string | null;
  socialLinks: SocialLink[];
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionCycle: string | null;
  subscriptionCurrentPeriodEnd: Date | null;
  subscriptionUpdatedAt: Date | null;
  createdAt: Date;
  hasCredential: boolean;
  subscription: {
    plan: string;
    status: string;
    cycle: string | null;
    periodEnd: Date | null;
    updatedAt: Date | null;
  };
} | null;

type SessionItem = {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
};

type LinkedAccountItem = {
  id: string;
  providerId: string;
  accountId: string;
  createdAt: Date;
};

type UserRecord = typeof user.$inferSelect;

type BillingCustomerSummary = {
  id: string;
  email: string;
};

type BillingSubscriptionSummary = {
  plan: string;
  status: string;
  cycle: string | null;
  periodEnd: Date | null;
  updatedAt: Date;
};

type BillingSyncResult = {
  customerId: string;
  subscription: BillingSubscriptionSummary;
};

type EditableProfile = Pick<
  UserRecord,
  "id" | "name" | "email" | "image" | "bio" | "socialLinks"
>;

type MutationSuccess = { success: true };

type DeletedCountResult = { deletedCount: number };

export async function getPopularUsersService(
  context: AppContext,
  input: { limit: number }
): Promise<PopularUserItem[]> {
  const { limit } = input;
  const { db } = context;
  const totalLikes = sql<number>`COALESCE(SUM(${posts.likes}), 0)`;
  const totalPosts = sql<number>`COUNT(${posts.id})`;

  return db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      totalLikes,
      totalPosts,
    })
    .from(posts)
    .innerJoin(user, eq(posts.createdById, user.id))
    .where(and(eq(posts.isPublic, true), isNull(posts.deletedAt)))
    .groupBy(user.id)
    .orderBy(desc(totalLikes))
    .limit(limit);
}

export async function getPublicProfileService(
  context: AppContext,
  input: { id: string }
): Promise<PublicProfileOutput> {
  const { db } = context;
  const isOwner = context.session?.user?.id === input.id;

  const profile = await db.query.user.findFirst({
    where: eq(user.id, input.id),
    columns: {
      id: true,
      name: true,
      image: true,
      bio: true,
      socialLinks: true,
      createdAt: true,
    },
  });

  if (!profile) {
    throw new ORPCError("NOT_FOUND", { message: "User not found" });
  }

  const postRows = (await db
    .select({
      post: {
        id: posts.id,
        prompt: posts.prompt,
        comment: posts.comment,
        media: posts.media,
        likes: posts.likes,
        visits: posts.visits,
        isPublic: posts.isPublic,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      },
      author: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(posts)
    .leftJoin(user, eq(posts.createdById, user.id))
    .where(
      combineFilters([
        eq(posts.createdById, input.id),
        isOwner ? undefined : eq(posts.isPublic, true),
        isNull(posts.deletedAt),
      ])
    )
    .orderBy(desc(posts.createdAt))) as PublicProfilePostRow[];

  const postIds = postRows.map((row) => row.post.id);
  const tagRows = postIds.length
    ? await db
        .select({
          postId: postTags.postId,
          id: tags.id,
          name: tags.name,
          value: tags.value,
          type: tags.type,
        })
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(inArray(postTags.postId, postIds))
    : [];

  const postsWithTags = mapPostsWithTags(postRows, groupTagsByPost(tagRows));
  return { user: profile, posts: postsWithTags };
}

export async function getCurrentProfileService(
  context: ProtectedAppContext
): Promise<CurrentProfileOutput> {
  const userId = context.session.user.id;
  const { db } = context;

  const profile = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      bio: true,
      socialLinks: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
      subscriptionCycle: true,
      subscriptionCurrentPeriodEnd: true,
      subscriptionUpdatedAt: true,
      createdAt: true,
    },
  });

  const credentialAccount = await db.query.account.findFirst({
    where: and(
      eq(account.userId, userId),
      eq(account.providerId, "credential")
    ),
    columns: { id: true },
  });

  if (!profile) {
    return null;
  }

  return {
    ...profile,
    hasCredential: !!credentialAccount,
    subscription: {
      plan: profile.subscriptionPlan,
      status: profile.subscriptionStatus,
      cycle: profile.subscriptionCycle,
      periodEnd: profile.subscriptionCurrentPeriodEnd,
      updatedAt: profile.subscriptionUpdatedAt,
    },
  };
}

async function getBillingUserOrThrow(db: ApiDb, userId: string) {
  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: {
      id: true,
      email: true,
      name: true,
      polarCustomerId: true,
    },
  });

  if (!currentUser?.email) {
    throw new ORPCError("BAD_REQUEST", {
      message: "User email is required for billing",
    });
  }

  return currentUser;
}

export async function ensureBillingCustomerService(
  context: ProtectedAppContext
): Promise<BillingCustomerSummary> {
  const userId = context.session.user.id;
  const { db } = context;
  const currentUser = await getBillingUserOrThrow(db, userId);

  const customer = await ensurePolarCustomerForUser({
    externalId: currentUser.id,
    email: currentUser.email,
    name: currentUser.name,
  });

  if (currentUser.polarCustomerId !== customer.id) {
    await db
      .update(user)
      .set({
        polarCustomerId: customer.id,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));
  }

  return {
    id: customer.id,
    email: customer.email ?? currentUser.email,
  };
}

export async function syncBillingSnapshotService(
  context: ProtectedAppContext
): Promise<BillingSyncResult> {
  const userId = context.session.user.id;
  const { db } = context;
  const currentUser = await getBillingUserOrThrow(db, userId);

  const customer = await ensurePolarCustomerForUser({
    externalId: currentUser.id,
    email: currentUser.email,
    name: currentUser.name,
  });

  const customerState = await getPolarCustomerStateByExternalId(currentUser.id);
  const snapshot = getSnapshotFromSubscriptions(
    customerState.active_subscriptions.map((subscription) => ({
      ...subscription,
      current_period_end: subscription.current_period_end,
    })),
    getPolarPlanByProductIdMap()
  );

  const updatedAt = new Date();
  await db
    .update(user)
    .set({
      polarCustomerId: customer.id,
      subscriptionPlan: snapshot.plan,
      subscriptionStatus: snapshot.status,
      subscriptionCycle: snapshot.cycle,
      subscriptionCurrentPeriodEnd: snapshot.currentPeriodEnd,
      subscriptionUpdatedAt: updatedAt,
      updatedAt,
    })
    .where(eq(user.id, userId));

  return {
    customerId: customer.id,
    subscription: {
      plan: snapshot.plan,
      status: snapshot.status,
      cycle: snapshot.cycle,
      periodEnd: snapshot.currentPeriodEnd,
      updatedAt,
    },
  };
}

export async function updateProfileService(
  context: ProtectedAppContext,
  input: {
    name?: string;
    image?: string | null;
    bio?: string;
    socialLinks?: SocialLink[];
  }
): Promise<EditableProfile | null> {
  const userId = context.session.user.id;
  const { db } = context;

  const updateData = buildProfileUpdateData(input);
  if (Object.keys(updateData).length === 0) {
    return (
      (await db.query.user.findFirst({
        where: eq(user.id, userId),
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          socialLinks: true,
        },
      })) ?? null
    );
  }

  const [updated] = await db
    .update(user)
    .set(updateData)
    .where(eq(user.id, userId))
    .returning({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.bio,
      socialLinks: user.socialLinks,
    });

  return updated ?? null;
}

export async function getUserSessionsService(
  context: ProtectedAppContext
): Promise<SessionItem[]> {
  const userId = context.session.user.id;
  const { db } = context;

  const sessions = await db.query.session.findMany({
    where: eq(session.userId, userId),
    orderBy: (sessionTable, { desc: descOrder }) => [
      descOrder(sessionTable.createdAt),
    ],
    columns: {
      id: true,
      token: false,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
      expiresAt: true,
    },
    limit: 5,
  });

  const currentSessionId = context.session.session.id;
  return sessions.map((currentSession) => ({
    ...currentSession,
    isCurrent: currentSession.id === currentSessionId,
  }));
}

export async function getLinkedAccountsService(
  context: ProtectedAppContext
): Promise<LinkedAccountItem[]> {
  const userId = context.session.user.id;
  const { db } = context;
  return db.query.account.findMany({
    where: eq(account.userId, userId),
    columns: {
      id: true,
      providerId: true,
      accountId: true,
      createdAt: true,
    },
  });
}

export async function revokeSessionService(
  context: ProtectedAppContext,
  input: { sessionId: string }
): Promise<MutationSuccess> {
  const userId = context.session.user.id;
  const currentSessionId = context.session.session.id;
  const { db } = context;

  if (input.sessionId === currentSessionId) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Cannot revoke current session",
    });
  }

  const result = await db
    .delete(session)
    .where(
      and(
        eq(session.id, input.sessionId),
        eq(session.userId, userId),
        ne(session.id, currentSessionId)
      )
    )
    .returning({ id: session.id });

  if (result.length === 0) {
    throw new ORPCError("NOT_FOUND", {
      message: "Session not found",
    });
  }

  return { success: true };
}

export async function deleteAllUserPostsService(
  context: ProtectedAppContext
): Promise<DeletedCountResult> {
  const userId = context.session.user.id;
  const { db } = context;
  const result = await db
    .update(posts)
    .set({ deletedAt: new Date(), isPublic: false })
    .where(and(eq(posts.createdById, userId), isNull(posts.deletedAt)))
    .returning({ id: posts.id });

  return { deletedCount: result.length };
}

export async function deleteAllUserFeedbackService(
  context: ProtectedAppContext
): Promise<DeletedCountResult> {
  const userId = context.session.user.id;
  const { db } = context;
  const result = await db
    .update(feedbacks)
    .set({ deletedAt: new Date() })
    .where(and(eq(feedbacks.createdById, userId), isNull(feedbacks.deletedAt)))
    .returning({ id: feedbacks.id });

  return { deletedCount: result.length };
}

export async function deleteAllUserLikesService(
  context: ProtectedAppContext
): Promise<DeletedCountResult> {
  const userId = context.session.user.id;
  const { db } = context;
  const result = await db
    .delete(postLikes)
    .where(eq(postLikes.userId, userId))
    .returning({ id: postLikes.id });

  return { deletedCount: result.length };
}

export async function setPasswordService(
  context: ProtectedAppContext,
  input: { newPassword: string }
): Promise<MutationSuccess> {
  const userId = context.session.user.id;
  const { db } = context;

  const existingCredential = await db.query.account.findFirst({
    where: and(
      eq(account.userId, userId),
      eq(account.providerId, "credential")
    ),
    columns: { id: true },
  });

  if (existingCredential) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Password already set. Use change password instead.",
    });
  }

  const hashedPassword = await hashPassword(input.newPassword);
  await db.insert(account).values({
    id: generateId(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: hashedPassword,
  });

  return { success: true };
}
