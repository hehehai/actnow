import {
  and,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lt,
  ne,
  or,
  type SQL,
  sql,
} from "@actnow/db";
import { user } from "@actnow/db/schema/auth";
import { eventLogs } from "@actnow/db/schema/events";
import { postLikes, posts } from "@actnow/db/schema/posts";
import { postTags, tags } from "@actnow/db/schema/tags";
import { ORPCError } from "@orpc/server";
import type { AppContext, ProtectedAppContext } from "../../lib/context-types";
import { combineFilters, generateId, getTableCount } from "../../lib/utils";
import {
  fetchLikedPostIdSet,
  fetchPostTagRowsByPostIds,
  fetchPostWithTags,
  getUserPostingPolicy,
  groupTagsByPost,
  type PostRecord,
  syncPostTags,
  transformPostRecord,
} from "./post-shared";

type PostWithTags = NonNullable<Awaited<ReturnType<typeof fetchPostWithTags>>>;
type PostWithTagsAndLike = PostWithTags & { liked: boolean };

type PostListResult = {
  items: PostWithTagsAndLike[];
  nextCursor: string | null;
  hasMore: boolean;
};

type SearchResult = {
  tags: Array<{
    id: string;
    name: string;
    value: string;
    type: string;
  }>;
  posts: Array<{
    id: string;
    prompt: string | null;
    comment: string | null;
    createdAt: Date;
    authorId: string | null;
  }>;
  users: Array<{
    id: string;
    name: string | null;
    image: string | null;
  }>;
};

type TrendingResult = {
  posts: Array<{
    id: string;
    prompt: string | null;
    comment: string | null;
    media: string[] | null;
    likes: number;
    visits: number;
    createdAt: Date;
    author: {
      id: string | null;
      name: string | null;
      image: string | null;
    } | null;
  }>;
  tags: Array<{
    id: string;
    name: string;
    value: string;
    type: string;
    usageCount: number;
  }>;
};

type TagItem = {
  id: string;
  name: string;
  value: string;
  type: "platform" | "model" | "style";
  tipMedia: string | null;
};

export async function listPostsService(
  context: AppContext,
  input: {
    cursor?: string;
    limit: number;
    sort: "latest" | "popular";
    tagSlugs?: string[];
    search?: string;
    visibility: "public" | "all";
  }
): Promise<PostListResult> {
  const { cursor, limit, sort, tagSlugs, search, visibility } = input;
  const { db, session } = context;
  const userId = session?.user?.id;

  let tagFilteredPostIds: string[] | undefined;
  if (tagSlugs?.length) {
    const tagRows = await db
      .select({ id: tags.id })
      .from(tags)
      .where(and(inArray(tags.value, tagSlugs), isNull(tags.deletedAt)));
    const tagIds = tagRows.map((row: { id: string }) => row.id);

    if (tagIds.length === 0) {
      return { items: [], nextCursor: null, hasMore: false };
    }

    const rows = await db
      .select({ postId: postTags.postId })
      .from(postTags)
      .where(inArray(postTags.tagId, tagIds));
    const filteredPostIds = rows.map((row: { postId: string }) => row.postId);
    if (filteredPostIds.length === 0) {
      return { items: [], nextCursor: null, hasMore: false };
    }
    tagFilteredPostIds = filteredPostIds;
  }

  const conditions: Array<SQL | undefined> = [
    isNull(posts.deletedAt),
    visibility === "public" || !userId
      ? eq(posts.isPublic, true)
      : or(eq(posts.isPublic, true), eq(posts.createdById, userId)),
  ];

  if (search) {
    const likeTerm = `%${search}%`;
    const searchCondition = or(
      ilike(posts.comment, likeTerm),
      ilike(posts.prompt, likeTerm)
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (tagFilteredPostIds) {
    conditions.push(inArray(posts.id, tagFilteredPostIds));
  }

  if (sort === "latest" && cursor) {
    conditions.push(lt(posts.createdAt, new Date(cursor)));
  }

  const whereClause = combineFilters(conditions);
  const orderBy =
    sort === "popular"
      ? [desc(posts.likes), desc(posts.updatedAt)]
      : [desc(posts.createdAt)];

  const rows: PostRecord[] = await db
    .select({
      post: {
        id: posts.id,
        prompt: posts.prompt,
        comment: posts.comment,
        media: posts.media,
        isPublic: posts.isPublic,
        likes: posts.likes,
        visits: posts.visits,
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
    .where(whereClause)
    .orderBy(...orderBy)
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const postIds = items.map((row) => row.post.id);

  const tagRows = await fetchPostTagRowsByPostIds(db, postIds);
  const tagMap = groupTagsByPost(tagRows);
  const likedSet = await fetchLikedPostIdSet(db, userId, postIds);

  const resultItems = items.map((record) => {
    const base = transformPostRecord(record, tagMap);
    return {
      ...base,
      liked: likedSet.has(base.post.id),
    };
  });

  const nextCursorValue =
    sort === "latest"
      ? (resultItems.at(-1)?.post.createdAt.toISOString() ?? null)
      : hasMore
        ? String((Number(cursor ?? "0") || 0) + limit)
        : null;

  return {
    items: resultItems,
    nextCursor: nextCursorValue,
    hasMore,
  };
}

export async function getPostDetailService(
  context: AppContext,
  input: { id: string }
): Promise<PostWithTagsAndLike> {
  const { db, session } = context;
  const postRecord = await fetchPostWithTags(db, input.id);

  if (!postRecord) {
    throw new ORPCError("NOT_FOUND", { message: "Post not found" });
  }

  const { post, author } = postRecord;
  if (!post.isPublic && (!session?.user || author?.id !== session.user.id)) {
    throw new ORPCError("FORBIDDEN", { message: "Post not accessible" });
  }

  let liked = false;
  if (session?.user?.id) {
    const existingLike = await db.query.postLikes.findFirst({
      where: and(
        eq(postLikes.postId, input.id),
        eq(postLikes.userId, session.user.id)
      ),
    });
    liked = Boolean(existingLike);
  }

  return { ...postRecord, liked };
}

export async function searchPostsService(
  context: AppContext,
  input: { q: string; limit: number }
): Promise<SearchResult> {
  const { q, limit } = input;
  const { db } = context;
  const term = `%${q}%`;

  const matchingTags = await db
    .select({
      id: tags.id,
      name: tags.name,
      value: tags.value,
      type: tags.type,
    })
    .from(tags)
    .where(
      and(
        isNull(tags.deletedAt),
        or(ilike(tags.name, term), ilike(tags.value, term))
      )
    )
    .limit(limit);

  const matchingPosts = await db
    .select({
      id: posts.id,
      prompt: posts.prompt,
      comment: posts.comment,
      createdAt: posts.createdAt,
      authorId: user.id,
    })
    .from(posts)
    .leftJoin(user, eq(posts.createdById, user.id))
    .where(
      and(
        eq(posts.isPublic, true),
        isNull(posts.deletedAt),
        or(ilike(posts.comment, term), ilike(posts.prompt, term))
      )
    )
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  const matchingUsers = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
    })
    .from(user)
    .where(and(ne(user.name, ""), ilike(user.name, term)))
    .orderBy(desc(user.createdAt))
    .limit(limit);

  return { tags: matchingTags, posts: matchingPosts, users: matchingUsers };
}

export async function getTrendingPostsService(
  context: AppContext,
  input: { postsLimit: number; tagsLimit: number }
): Promise<TrendingResult> {
  const { postsLimit, tagsLimit } = input;
  const { db } = context;
  const usageCount = sql<number>`COUNT(${postTags.postId})`;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const trendingPosts = await db
    .select({
      id: posts.id,
      prompt: posts.prompt,
      comment: posts.comment,
      media: posts.media,
      likes: posts.likes,
      visits: posts.visits,
      createdAt: posts.createdAt,
      author: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(posts)
    .leftJoin(user, eq(posts.createdById, user.id))
    .where(
      and(
        eq(posts.isPublic, true),
        isNull(posts.deletedAt),
        gte(posts.createdAt, sevenDaysAgo)
      )
    )
    .orderBy(desc(posts.likes), desc(posts.createdAt))
    .limit(postsLimit);

  const trendingTags = await db
    .select({
      id: tags.id,
      name: tags.name,
      value: tags.value,
      type: tags.type,
      usageCount,
    })
    .from(tags)
    .innerJoin(postTags, eq(postTags.tagId, tags.id))
    .innerJoin(posts, eq(postTags.postId, posts.id))
    .where(and(eq(posts.isPublic, true), isNull(tags.deletedAt)))
    .groupBy(tags.id)
    .orderBy(desc(usageCount))
    .limit(tagsLimit);

  return {
    posts: trendingPosts,
    tags: trendingTags.map(
      (
        tag: Omit<TrendingResult["tags"][number], "usageCount"> & {
          usageCount: number | string;
        }
      ) => ({
        ...tag,
        usageCount: Number(tag.usageCount),
      })
    ),
  };
}

export async function getTagsByTypeService(
  context: AppContext,
  input: { type: "platform" | "model" | "style" }
): Promise<TagItem[]> {
  const { db } = context;
  return db
    .select({
      id: tags.id,
      name: tags.name,
      value: tags.value,
      type: tags.type,
      tipMedia: tags.tipMedia,
    })
    .from(tags)
    .where(and(eq(tags.type, input.type), isNull(tags.deletedAt)))
    .orderBy(desc(tags.createdAt));
}

export async function trackPostViewService(
  context: AppContext,
  input: { postId: string }
): Promise<{ success: true; visits: number }> {
  const { db, session } = context;
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, input.postId),
  });

  if (!post || post.deletedAt) {
    throw new ORPCError("NOT_FOUND", { message: "Post not found" });
  }

  const [updated] = await db
    .update(posts)
    .set({ visits: sql`${posts.visits} + 1` })
    .where(eq(posts.id, input.postId))
    .returning({ visits: posts.visits });

  await db.insert(eventLogs).values({
    id: generateId(),
    eventType: "POST_VIEWED",
    targetId: input.postId,
    targetType: "post",
    userId: session?.user?.id ?? null,
  });

  return { success: true, visits: updated?.visits ?? post.visits + 1 };
}

export async function createPostService(
  context: ProtectedAppContext,
  input: {
    prompt?: string;
    comment: string;
    media?: string[];
    isPublic?: boolean;
    tagIds?: string[];
  }
): Promise<PostWithTags | null> {
  const { db, session } = context;
  const userId = session.user.id;
  const postId = generateId();
  const { tagIds, ...data } = input;
  const policy = await getUserPostingPolicy(db, userId);
  const targetIsPublic = data.isPublic ?? false;

  if (!(policy.canPrivate || targetIsPublic)) {
    throw new ORPCError("FORBIDDEN", {
      message: "Free plan only allows public posts",
    });
  }

  const currentCount = await getTableCount(
    db,
    posts,
    and(eq(posts.createdById, userId), isNull(posts.deletedAt))
  );
  if (currentCount >= policy.maxPosts) {
    throw new ORPCError("FORBIDDEN", {
      message: `${policy.plan} plan allows up to ${policy.maxPosts} posts`,
    });
  }

  await db.transaction(async (tx) => {
    await tx.insert(posts).values({
      id: postId,
      prompt: data.prompt ?? "",
      comment: data.comment,
      media: data.media ?? [],
      isPublic: data.isPublic ?? false,
      createdById: userId,
    });

    if (tagIds?.length) {
      await syncPostTags(tx, postId, tagIds);
    }
  });

  return fetchPostWithTags(db, postId);
}

export async function updatePostService(
  context: ProtectedAppContext,
  input: {
    id?: string;
    prompt?: string;
    comment: string;
    media?: string[];
    isPublic?: boolean;
    tagIds?: string[];
  }
): Promise<PostWithTags | null> {
  const { db, session } = context;
  const userId = session.user.id;
  if (!input.id) {
    throw new ORPCError("BAD_REQUEST", { message: "Post ID is required" });
  }

  const existing = await db.query.posts.findFirst({
    where: and(eq(posts.id, input.id), eq(posts.createdById, userId)),
  });
  if (!existing || existing.deletedAt) {
    throw new ORPCError("NOT_FOUND", { message: "Post not found" });
  }

  const { tagIds, id, ...data } = input;
  const policy = await getUserPostingPolicy(db, userId);
  const targetIsPublic =
    data.isPublic !== undefined ? data.isPublic : existing.isPublic;
  if (!policy.canPrivate && existing.isPublic && !targetIsPublic) {
    throw new ORPCError("FORBIDDEN", {
      message: "Free plan cannot change a post from public to private",
    });
  }

  await db.transaction(async (tx) => {
    await tx
      .update(posts)
      .set({
        prompt: data.prompt ?? existing.prompt,
        comment: data.comment,
        media: data.media ?? [],
        isPublic:
          data.isPublic !== undefined ? data.isPublic : existing.isPublic,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));

    if (tagIds) {
      await syncPostTags(tx, id, tagIds);
    }
  });

  return fetchPostWithTags(db, input.id);
}

export async function deletePostService(
  context: ProtectedAppContext,
  input: { id: string }
): Promise<{ success: true }> {
  const { db, session } = context;
  const userId = session.user.id;
  const existing = await db.query.posts.findFirst({
    where: and(eq(posts.id, input.id), eq(posts.createdById, userId)),
  });

  if (!existing || existing.deletedAt) {
    throw new ORPCError("NOT_FOUND", { message: "Post not found" });
  }

  await db
    .update(posts)
    .set({ deletedAt: new Date(), isPublic: false })
    .where(eq(posts.id, input.id));

  return { success: true };
}

export async function getSimilarPostsService(
  context: AppContext,
  input: { postId: string; tagIds: string[]; limit: number }
): Promise<PostWithTagsAndLike[]> {
  const { db, session } = context;
  const userId = session?.user?.id;
  const { postId, tagIds, limit } = input;

  if (tagIds.length === 0) {
    return [];
  }

  const similarPostsQuery = await db
    .select({
      postId: postTags.postId,
      overlapCount: sql<number>`count(*)`.as("overlap_count"),
    })
    .from(postTags)
    .innerJoin(posts, eq(postTags.postId, posts.id))
    .where(
      and(
        inArray(postTags.tagId, tagIds),
        ne(postTags.postId, postId),
        eq(posts.isPublic, true),
        isNull(posts.deletedAt)
      )
    )
    .groupBy(postTags.postId)
    .orderBy(sql`count(*) DESC`)
    .limit(limit * 2);

  const similarPostIds = similarPostsQuery.map(
    (row: { postId: string }) => row.postId
  );
  const overlapMap = new Map<string, number>(
    similarPostsQuery.map(
      (row: { postId: string; overlapCount: number | string }) => [
        row.postId,
        Number(row.overlapCount),
      ]
    )
  );
  if (similarPostIds.length === 0) {
    return [];
  }

  const postRecords = (await db
    .select({
      post: {
        id: posts.id,
        prompt: posts.prompt,
        comment: posts.comment,
        media: posts.media,
        isPublic: posts.isPublic,
        likes: posts.likes,
        visits: posts.visits,
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
    .where(inArray(posts.id, similarPostIds))) as PostRecord[];

  const tagRows = await fetchPostTagRowsByPostIds(db, similarPostIds);
  const tagMap = groupTagsByPost(tagRows);
  const likedPostIds = await fetchLikedPostIdSet(db, userId, similarPostIds);

  const sortedRecords = postRecords
    .sort((a, b) => {
      const overlapA = overlapMap.get(a.post.id) ?? 0;
      const overlapB = overlapMap.get(b.post.id) ?? 0;
      if (overlapB !== overlapA) {
        return overlapB - overlapA;
      }
      return b.post.likes - a.post.likes;
    })
    .slice(0, limit);

  return sortedRecords.map((record) => ({
    ...transformPostRecord(record, tagMap),
    liked: likedPostIds.has(record.post.id),
  }));
}
