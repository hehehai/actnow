import type { SocialLink } from "@actnow/common";

interface PostTagRow {
  postId: string;
  id: string;
  name: string;
  value: string;
  type: string;
}

interface PublicProfilePostRow {
  post: {
    id: string;
  };
}

interface UpdateProfileInput {
  name?: string;
  image?: string | null;
  bio?: string;
  socialLinks?: SocialLink[];
}

export function buildPostTagMap(tagRows: PostTagRow[]) {
  const tagMap = new Map<string, PostTagRow[]>();
  for (const tag of tagRows) {
    const existing = tagMap.get(tag.postId);
    if (existing) {
      existing.push(tag);
    } else {
      tagMap.set(tag.postId, [tag]);
    }
  }
  return tagMap;
}

export function mapPostsWithTags<T extends PublicProfilePostRow>(
  postRows: T[],
  tagMap: Map<string, PostTagRow[]>
) {
  return postRows.map((record) => ({
    ...record,
    tags:
      tagMap.get(record.post.id)?.map((tag) => ({
        id: tag.id,
        name: tag.name,
        value: tag.value,
        type: tag.type,
      })) ?? [],
  }));
}

export function buildProfileUpdateData(input: UpdateProfileInput) {
  const updateData: {
    name?: string;
    image?: string | null;
    bio?: string | null;
    socialLinks?: SocialLink[];
  } = {};

  if (input.name !== undefined) {
    updateData.name = input.name;
  }

  if (input.image !== undefined) {
    updateData.image = input.image;
  }

  if (input.bio !== undefined) {
    updateData.bio = input.bio.trim() ? input.bio : null;
  }

  if (input.socialLinks !== undefined) {
    updateData.socialLinks = input.socialLinks;
  }

  return updateData;
}
