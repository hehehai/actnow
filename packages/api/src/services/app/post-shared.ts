import {
  getEffectiveSubscriptionPlan,
  SUBSCRIPTION_PLAN_FEATURES,
} from "@actnow/common";
import { and, eq, inArray, isNull } from "@actnow/db";
import { user } from "@actnow/db/schema/auth";
import { postLikes, posts } from "@actnow/db/schema/posts";
import { postTags, tags } from "@actnow/db/schema/tags";
import type { ApiDb } from "../../lib/context-types";

type PostTagMutationDb = Pick<ApiDb, "delete" | "insert">;

export type PostTagRow = {
  postId: string;
  id: string;
  name: string;
  value: string;
  type: string;
};

export type PostRecord = {
  post: {
    id: string;
    prompt: string | null;
    comment: string | null;
    media: string[] | null;
    isPublic: boolean;
    likes: number;
    visits: number;
    createdAt: Date;
    updatedAt: Date;
  };
  author: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
};

export type PostWithTags = PostRecord & {
  tags: Array<{
    id: string;
    name: string;
    value: string;
    type: string;
  }>;
};

export function groupTagsByPost(tagRows: PostTagRow[]) {
  const map = new Map<string, PostTagRow[]>();
  for (const row of tagRows) {
    const existing = map.get(row.postId);
    if (existing) {
      existing.push(row);
    } else {
      map.set(row.postId, [row]);
    }
  }
  return map;
}

export function transformPostRecord(
  record: PostRecord,
  tagMap: Map<string, PostTagRow[]>
) {
  const postTagsList = tagMap.get(record.post.id) ?? [];
  return {
    ...record,
    tags: postTagsList.map((tag) => ({
      id: tag.id,
      name: tag.name,
      value: tag.value,
      type: tag.type,
    })),
  };
}

export async function fetchPostWithTags(
  db: ApiDb,
  postId: string
): Promise<PostWithTags | null> {
  const record = await db
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
    .where(and(eq(posts.id, postId), isNull(posts.deletedAt)))
    .limit(1);

  if (!record?.length) {
    return null;
  }

  const [item] = record as PostRecord[];
  if (!item) {
    return null;
  }

  const postTagRows = await db
    .select({
      postId: postTags.postId,
      id: tags.id,
      name: tags.name,
      value: tags.value,
      type: tags.type,
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, postId));

  return {
    ...item,
    tags: postTagRows.map((tag: (typeof postTagRows)[number]) => ({
      id: tag.id,
      name: tag.name,
      value: tag.value,
      type: tag.type,
    })),
  };
}

export async function syncPostTags(
  db: PostTagMutationDb,
  postId: string,
  tagIds: string[]
) {
  await db.delete(postTags).where(eq(postTags.postId, postId));
  const uniqueTagIds = Array.from(new Set(tagIds));
  if (!uniqueTagIds.length) {
    return;
  }
  await db
    .insert(postTags)
    .values(uniqueTagIds.map((tagId) => ({ postId, tagId })));
}

export async function getUserPostingPolicy(db: ApiDb, userId: string) {
  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: {
      subscriptionPlan: true,
      subscriptionStatus: true,
    },
  });

  const plan = getEffectiveSubscriptionPlan({
    plan: userRecord?.subscriptionPlan,
    status: userRecord?.subscriptionStatus,
  });

  const feature = SUBSCRIPTION_PLAN_FEATURES[plan];
  return {
    plan,
    ...feature,
  };
}

export async function fetchPostTagRowsByPostIds(db: ApiDb, postIds: string[]) {
  if (postIds.length === 0) {
    return [] as PostTagRow[];
  }

  return db
    .select({
      postId: postTags.postId,
      id: tags.id,
      name: tags.name,
      value: tags.value,
      type: tags.type,
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(inArray(postTags.postId, postIds));
}

export async function fetchLikedPostIdSet(
  db: ApiDb,
  userId: string | null | undefined,
  postIds: string[]
) {
  if (!userId || postIds.length === 0) {
    return new Set<string>();
  }

  const likedRows = await db
    .select({ postId: postLikes.postId })
    .from(postLikes)
    .where(
      and(eq(postLikes.userId, userId), inArray(postLikes.postId, postIds))
    );

  return new Set(likedRows.map((row: { postId: string }) => row.postId));
}
