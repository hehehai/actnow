import type { SocialLink } from "@actnow/common";

interface UpdateProfileInput {
  name?: string;
  image?: string | null;
  bio?: string;
  socialLinks?: SocialLink[];
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
