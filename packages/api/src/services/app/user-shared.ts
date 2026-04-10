import type { SocialLink } from "@actnow/common";
import type { PostTagRow } from "./post-shared";

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
