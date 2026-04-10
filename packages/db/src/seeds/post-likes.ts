import { nanoid } from "nanoid";
import type { db as DbType } from "../index";
import { postLikes } from "../schema/posts";
import { insertInBatches } from "./insert-in-batches";

export async function seedPostLikes(
  db: typeof DbType,
  publicPostIds: string[],
  userIds: string[]
) {
  console.info("Seeding post likes...");

  const likeRecords: { id: string; postId: string; userId: string }[] = [];
  const existingLikes = new Set<string>();

  // Each public post gets random likes from random users
  for (const postId of publicPostIds) {
    // Random number of likes (0-8 users)
    const likeCount = Math.floor(Math.random() * 9);
    const shuffledUsers = [...userIds].sort(() => Math.random() - 0.5);
    const likingUsers = shuffledUsers.slice(0, likeCount);

    for (const userId of likingUsers) {
      const key = `${postId}-${userId}`;
      if (!existingLikes.has(key)) {
        existingLikes.add(key);
        likeRecords.push({
          id: nanoid(),
          postId,
          userId,
        });
      }
    }
  }

  if (likeRecords.length > 0) {
    await insertInBatches(db, postLikes, likeRecords);
  }

  console.info(`Seeded ${likeRecords.length} post likes`);

  return likeRecords;
}
