async function seed() {
  const { createDb } = await import("./index");
  const { createLocalD1Database } = await import("./local-d1");
  const { runAllSeeds } = await import("./seeds");
  const { account, session, user, verification } = await import(
    "./schema/auth"
  );
  const { eventLogs } = await import("./schema/events");
  const { feedbacks } = await import("./schema/feedback");
  const { postLikes, posts } = await import("./schema/posts");
  const { postTags, tags } = await import("./schema/tags");
  const { database, dispose } = await createLocalD1Database();
  const db = createDb(database);

  try {
    console.info("Resetting local D1 seed tables...\n");

    await db.delete(eventLogs);
    await db.delete(verification);
    await db.delete(session);
    await db.delete(account);
    await db.delete(feedbacks);
    await db.delete(postLikes);
    await db.delete(postTags);
    await db.delete(posts);
    await db.delete(tags);
    await db.delete(user);

    await runAllSeeds(db);
  } finally {
    await dispose();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
