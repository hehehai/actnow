import { and, desc, eq, ilike, isNull, lt, ne, or, type SQL } from "@actnow/db";
import { user } from "@actnow/db/schema/auth";
import { posts } from "@actnow/db/schema/posts";
import { ORPCError } from "@orpc/server";
import type { AppContext } from "../../lib/context-types";
import { combineFilters } from "../../lib/utils";

type ContentPost = {
  id: string;
  title: string;
  description: string;
  cover: string | null;
  content: string;
  status: "draft" | "published";
  createdAt: Date;
  publishedAt: Date | null;
  createdById: string;
};

type ContentPostItem = {
  post: ContentPost;
  author: {
    id: string | null;
    name: string | null;
    image: string | null;
  } | null;
};

type PostListResult = {
  items: ContentPostItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

type SearchResult = {
  posts: Array<{
    id: string;
    title: string;
    description: string;
    createdAt: Date;
    authorId: string | null;
  }>;
  users: Array<{ id: string; name: string | null; image: string | null }>;
};

export async function listPostsService(
  context: AppContext,
  input: { cursor?: string; limit: number; sort: "latest"; search?: string }
): Promise<PostListResult> {
  const { db } = context;
  const conditions: Array<SQL | undefined> = [
    isNull(posts.deletedAt),
    eq(posts.status, "published"),
  ];
  if (input.cursor)
    conditions.push(lt(posts.createdAt, new Date(input.cursor)));
  if (input.search) {
    const term = `%${input.search}%`;
    conditions.push(
      or(ilike(posts.title, term), ilike(posts.description, term))
    );
  }

  const rows = await db
    .select({
      post: {
        id: posts.id,
        title: posts.title,
        description: posts.description,
        cover: posts.cover,
        content: posts.content,
        status: posts.status,
        createdAt: posts.createdAt,
        publishedAt: posts.publishedAt,
        createdById: posts.createdById,
      },
      author: { id: user.id, name: user.name, image: user.image },
    })
    .from(posts)
    .leftJoin(user, eq(posts.createdById, user.id))
    .where(combineFilters(conditions))
    .orderBy(desc(posts.createdAt))
    .limit(input.limit + 1);

  const hasMore = rows.length > input.limit;
  const items = hasMore ? rows.slice(0, input.limit) : rows;
  return {
    items,
    nextCursor: hasMore
      ? (items.at(-1)?.post.createdAt.toISOString() ?? null)
      : null,
    hasMore,
  };
}

export async function getPostDetailService(
  context: AppContext,
  input: { id: string }
): Promise<ContentPostItem> {
  const [record] = await context.db
    .select({
      post: {
        id: posts.id,
        title: posts.title,
        description: posts.description,
        cover: posts.cover,
        content: posts.content,
        status: posts.status,
        createdAt: posts.createdAt,
        publishedAt: posts.publishedAt,
        createdById: posts.createdById,
      },
      author: { id: user.id, name: user.name, image: user.image },
    })
    .from(posts)
    .leftJoin(user, eq(posts.createdById, user.id))
    .where(
      and(
        eq(posts.id, input.id),
        eq(posts.status, "published"),
        isNull(posts.deletedAt)
      )
    )
    .limit(1);
  if (!record) throw new ORPCError("NOT_FOUND", { message: "Post not found" });
  return record;
}

export async function searchPostsService(
  context: AppContext,
  input: { q: string; limit: number }
): Promise<SearchResult> {
  const { q, limit } = input;
  const { db } = context;
  const term = `%${q}%`;

  const matchingPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      description: posts.description,
      createdAt: posts.createdAt,
      authorId: user.id,
    })
    .from(posts)
    .leftJoin(user, eq(posts.createdById, user.id))
    .where(
      and(
        eq(posts.status, "published"),
        isNull(posts.deletedAt),
        or(ilike(posts.title, term), ilike(posts.description, term))
      )
    )
    .orderBy(desc(posts.publishedAt), desc(posts.createdAt))
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

  return { posts: matchingPosts, users: matchingUsers };
}
