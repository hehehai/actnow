import type { db as DbType } from "../index";
import { seedFeedbacks } from "./feedbacks";
import { seedPostLikes } from "./post-likes";
import { seedPostTags } from "./post-tags";
import { seedPosts } from "./posts";
import { seedTags } from "./tags";
import { seedUsers } from "./users";

export async function runAllSeeds(db: typeof DbType) {
  console.info("Starting database seeding...\n");

  // 1. Seed users first (other tables depend on user IDs)
  const users = await seedUsers(db);
  const userIds = users.map((u) => u.id);

  // 2. Seed tags
  const tags = await seedTags(db);
  const tagIds = tags.map((t) => t.id);

  // 3. Seed posts (depends on users)
  const posts = await seedPosts(db, userIds);
  const postIds = posts.map((p) => p.id);
  const publicPostIds = posts.filter((p) => p.isPublic).map((p) => p.id);

  // 4. Seed post-tag associations (depends on posts and tags)
  await seedPostTags(db, postIds, tagIds);

  // 5. Seed post likes (depends on public posts and users)
  await seedPostLikes(db, publicPostIds, userIds);

  // 6. Seed feedbacks (depends on users)
  await seedFeedbacks(db, userIds);

  console.info("\nDatabase seeding completed!");
}
