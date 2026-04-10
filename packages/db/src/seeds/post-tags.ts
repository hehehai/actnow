import type { db as DbType } from "../index";
import { postTags } from "../schema/tags";
import { insertInBatches } from "./insert-in-batches";

// Randomly assign 1-4 tags to each post
function getRandomTags(tagIds: string[], count: number): string[] {
  const shuffled = [...tagIds].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function seedPostTags(
  db: typeof DbType,
  postIds: string[],
  tagIds: string[]
) {
  console.info("Seeding post-tag associations...");

  const postTagRecords: { postId: string; tagId: string }[] = [];

  for (const postId of postIds) {
    const tagCount = Math.floor(Math.random() * 4) + 1; // 1-4 tags
    const selectedTags = getRandomTags(tagIds, tagCount);

    for (const tagId of selectedTags) {
      postTagRecords.push({ postId, tagId });
    }
  }

  await insertInBatches(db, postTags, postTagRecords);

  console.info(`Seeded ${postTagRecords.length} post-tag associations`);

  return postTagRecords;
}
