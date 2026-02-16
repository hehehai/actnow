import { UserRole } from "@actnow/common";
import {
  and,
  count,
  desc,
  eq,
  inArray,
  isNull,
  max,
  type SQL,
} from "@actnow/db";
import { account, session, user } from "@actnow/db/schema/auth";
import { postLikes, posts } from "@actnow/db/schema/posts";
import { ORPCError } from "@orpc/server";
import {
  buildPaginationResult,
  generateId,
  getCountFromResult,
  getPaginationOffset,
  getSortOrder,
  hashPassword,
} from "../../lib/utils";
import {
  buildUserListConditions,
  mapPanelUserListItem,
  mapUserSubscriptionSnapshot,
} from "./user-shared";

type PanelContext = {
  db: any;
};

type UserFilterItem = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

type PanelUserListItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  banned: boolean | null;
  banReason: string | null;
  createdAt: Date;
  lastSignedIn: Date | null;
  subscription: {
    plan: string;
    status: string;
    cycle: string | null;
    periodEnd: Date | null;
  };
};

type PanelUserListResult = {
  items: PanelUserListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type PanelUserDetail = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionCycle: string | null;
  subscriptionCurrentPeriodEnd: Date | null;
  subscriptionUpdatedAt: Date | null;
  socialLinks: Array<{ platform: string; url: string }>;
  bio: string | null;
  sessions: Array<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
  }>;
  accounts: Array<{
    id: string;
    providerId: string;
    accountId: string;
    createdAt: Date;
  }>;
  subscription: {
    plan: string;
    status: string;
    cycle: string | null;
    periodEnd: Date | null;
    updatedAt: Date | null;
  };
};

export async function listUsersForFilterService(
  context: PanelContext,
  input: { search?: string; limit: number }
): Promise<UserFilterItem[]> {
  const { search, limit } = input;
  const { db } = context;
  const conditions: SQL[] = [
    eq(user.role, "USER"),
    ...buildUserListConditions({ search }),
  ];

  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    })
    .from(user)
    .where(and(...conditions))
    .orderBy(desc(user.updatedAt))
    .limit(limit);
}

export async function listUsersService(
  context: PanelContext,
  input: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    status?: "normal" | "ban";
    dateFrom?: Date;
    dateTo?: Date;
    sortOrder: "asc" | "desc";
  }
): Promise<PanelUserListResult> {
  const { page, limit, search, role, status, dateFrom, dateTo, sortOrder } =
    input;
  const { db } = context;
  const offset = getPaginationOffset({ page, pageSize: limit });

  const conditions = buildUserListConditions({
    search,
    role,
    status,
    dateFrom,
    dateTo,
  });
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const totalResult = await db
    .select({ count: count() })
    .from(user)
    .where(whereClause);
  const total = getCountFromResult(totalResult);

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      banned: user.banned,
      banReason: user.banReason,
      createdAt: user.createdAt,
      lastSignedIn: max(session.createdAt),
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionCycle: user.subscriptionCycle,
      subscriptionPeriodEnd: user.subscriptionCurrentPeriodEnd,
    })
    .from(user)
    .leftJoin(session, eq(user.id, session.userId))
    .where(whereClause)
    .groupBy(user.id)
    .orderBy(getSortOrder(user.createdAt, sortOrder))
    .limit(limit)
    .offset(offset);

  const items = users.map((row: Parameters<typeof mapPanelUserListItem>[0]) =>
    mapPanelUserListItem(row)
  );
  return buildPaginationResult(items, total, { page, pageSize: limit });
}

export async function getUserByIdService(
  context: PanelContext,
  input: { id: string }
): Promise<PanelUserDetail> {
  const { db } = context;
  const userData = await db.query.user.findFirst({
    where: eq(user.id, input.id),
    with: {
      sessions: {
        columns: {
          id: true,
          createdAt: true,
          updatedAt: true,
          expiresAt: true,
          ipAddress: true,
          userAgent: true,
        },
      },
      accounts: {
        columns: {
          id: true,
          providerId: true,
          accountId: true,
          createdAt: true,
        },
      },
    },
  });

  if (!userData) {
    throw new ORPCError("NOT_FOUND", { message: "User not found" });
  }

  return {
    ...userData,
    subscription: mapUserSubscriptionSnapshot(userData),
  };
}

export async function getUserStatsService(
  context: PanelContext,
  input: { id: string }
): Promise<{ totalPosts: number; publicPosts: number }> {
  const { db } = context;
  const totalResult = await db
    .select({ count: count() })
    .from(posts)
    .where(and(eq(posts.createdById, input.id), isNull(posts.deletedAt)));

  const approvedResult = await db
    .select({ count: count() })
    .from(posts)
    .where(
      and(
        eq(posts.createdById, input.id),
        eq(posts.isPublic, true),
        isNull(posts.deletedAt)
      )
    );

  return {
    totalPosts: getCountFromResult(totalResult),
    publicPosts: getCountFromResult(approvedResult),
  };
}

export async function createUserService(
  context: PanelContext,
  input: {
    name: string;
    email: string;
    role: "ADMIN" | "USER";
    image?: string | null;
    password: string;
  }
): Promise<{
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionCycle: string | null;
  subscriptionCurrentPeriodEnd: Date | null;
  subscriptionUpdatedAt: Date | null;
  socialLinks: Array<{ platform: string; url: string }>;
  bio: string | null;
}> {
  const { password, ...userData } = input;
  const { db } = context;

  const existing = await db.query.user.findFirst({
    where: eq(user.email, input.email),
  });
  if (existing) {
    throw new ORPCError("CONFLICT", { message: "Email already exists" });
  }

  const userId = generateId();
  const hashedPassword = await hashPassword(password);
  const [newUser] = await db
    .insert(user)
    .values({
      id: userId,
      ...userData,
      emailVerified: true,
    })
    .returning();

  await db.insert(account).values({
    id: generateId(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: hashedPassword,
  });

  return newUser;
}

export async function updateUserService(
  context: PanelContext,
  input: {
    id: string;
    name?: string;
    email?: string;
    role?: "ADMIN" | "USER";
    image?: string | null;
    password?: string;
  }
): Promise<{
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionCycle: string | null;
  subscriptionCurrentPeriodEnd: Date | null;
  subscriptionUpdatedAt: Date | null;
  socialLinks: Array<{ platform: string; url: string }>;
  bio: string | null;
}> {
  const { id, password, ...updateData } = input;
  const { db } = context;

  const existing = await db.query.user.findFirst({
    where: eq(user.id, id),
  });
  if (!existing) {
    throw new ORPCError("NOT_FOUND", { message: "User not found" });
  }

  if (updateData.email && updateData.email !== existing.email) {
    const emailExists = await db.query.user.findFirst({
      where: eq(user.email, updateData.email),
    });
    if (emailExists) {
      throw new ORPCError("CONFLICT", { message: "Email already exists" });
    }
  }

  const [updated] = await db
    .update(user)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(user.id, id))
    .returning();

  if (password) {
    const hashedPassword = await hashPassword(password);
    await db
      .update(account)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(and(eq(account.userId, id), eq(account.providerId, "credential")));
  }

  return updated;
}

export async function deleteUserService(
  context: PanelContext,
  input: { id: string }
): Promise<{ success: true }> {
  const { db } = context;
  const existing = await db.query.user.findFirst({
    where: eq(user.id, input.id),
  });
  if (!existing) {
    throw new ORPCError("NOT_FOUND", { message: "User not found" });
  }

  if (existing.role === UserRole.ADMIN) {
    throw new ORPCError("FORBIDDEN", {
      message: "Admin users cannot be deleted. Use ban instead.",
    });
  }

  await db.delete(postLikes).where(eq(postLikes.userId, input.id));
  await db
    .update(posts)
    .set({ deletedAt: new Date(), isPublic: false })
    .where(eq(posts.createdById, input.id));
  await db.delete(user).where(eq(user.id, input.id));

  return { success: true };
}

export async function batchDeleteUsersService(
  context: PanelContext,
  input: { ids: string[] }
): Promise<{ success: true; deletedCount: number; skippedCount: number }> {
  const { db } = context;
  const usersToDelete = await db
    .select({ id: user.id, role: user.role })
    .from(user)
    .where(inArray(user.id, input.ids));

  const nonAdminIds = usersToDelete
    .filter(
      (currentUser: { role: string | null }) =>
        currentUser.role !== UserRole.ADMIN
    )
    .map((currentUser: { id: string }) => currentUser.id);

  if (nonAdminIds.length === 0) {
    throw new ORPCError("FORBIDDEN", {
      message: "No users can be deleted. Admin users cannot be deleted.",
    });
  }

  await db.delete(postLikes).where(inArray(postLikes.userId, nonAdminIds));
  await db
    .update(posts)
    .set({ deletedAt: new Date(), isPublic: false })
    .where(inArray(posts.createdById, nonAdminIds));
  await db.delete(user).where(inArray(user.id, nonAdminIds));

  return {
    success: true,
    deletedCount: nonAdminIds.length,
    skippedCount: input.ids.length - nonAdminIds.length,
  };
}

export async function banUserService(
  context: PanelContext,
  input: { id: string; reason: string; expiresAt?: Date }
): Promise<{
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionCycle: string | null;
  subscriptionCurrentPeriodEnd: Date | null;
  subscriptionUpdatedAt: Date | null;
  socialLinks: Array<{ platform: string; url: string }>;
  bio: string | null;
}> {
  const { db } = context;
  const existing = await db.query.user.findFirst({
    where: eq(user.id, input.id),
  });
  if (!existing) {
    throw new ORPCError("NOT_FOUND", { message: "User not found" });
  }

  const [updated] = await db
    .update(user)
    .set({
      banned: true,
      banReason: input.reason,
      banExpires: input.expiresAt ?? null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, input.id))
    .returning();

  await db.delete(session).where(eq(session.userId, input.id));
  return updated;
}

export async function unbanUserService(
  context: PanelContext,
  input: { id: string }
): Promise<{
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionCycle: string | null;
  subscriptionCurrentPeriodEnd: Date | null;
  subscriptionUpdatedAt: Date | null;
  socialLinks: Array<{ platform: string; url: string }>;
  bio: string | null;
}> {
  const { db } = context;
  const existing = await db.query.user.findFirst({
    where: eq(user.id, input.id),
  });
  if (!existing) {
    throw new ORPCError("NOT_FOUND", { message: "User not found" });
  }

  const [updated] = await db
    .update(user)
    .set({
      banned: false,
      banReason: null,
      banExpires: null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, input.id))
    .returning();

  return updated;
}
