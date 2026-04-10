import { isNull } from "@actnow/db";
import { nanoid } from "nanoid";
import type { db as DbType } from "../index";
import { posts } from "../schema/posts";
import { insertInBatches } from "./insert-in-batches";

// Realistic post data
const mockPosts = [
  {
    title: "Complete quarterly report analysis",
    content:
      "Review Q4 financial data, create visualizations, and prepare executive summary for the board meeting next week.",
    isPublic: true,
  },
  {
    title: "Learn TypeScript generics",
    content:
      "Deep dive into advanced TypeScript patterns including conditional types, mapped types, and template literal types.",
    isPublic: true,
  },
  {
    title: "Plan weekend hiking trip",
    content:
      "Research trails in the national park, check weather forecast, prepare gear checklist, and book campsite.",
    isPublic: false,
  },
  {
    title: "Refactor authentication module",
    content:
      "Migrate from session-based auth to JWT tokens, implement refresh token rotation, and add OAuth2 support.",
    isPublic: true,
  },
  {
    title: "Design new landing page",
    content:
      "Create wireframes and high-fidelity mockups for the product landing page. Focus on conversion optimization.",
    isPublic: true,
  },
  {
    title: "Set up home office ergonomics",
    content:
      "Research standing desks, monitor arms, and ergonomic chairs. Create a budget and shopping list.",
    isPublic: false,
  },
  {
    title: "Build REST API documentation",
    content:
      "Set up Swagger/OpenAPI documentation for all endpoints. Include request/response examples and authentication details.",
    isPublic: true,
  },
  {
    title: "Prepare presentation for tech talk",
    content:
      "Create slides about microservices architecture patterns. Include real-world examples and best practices.",
    isPublic: true,
  },
  {
    title: "Organize digital photo library",
    content:
      "Sort photos by year and event, remove duplicates, back up to cloud storage, and create family albums.",
    isPublic: false,
  },
  {
    title: "Implement dark mode feature",
    content:
      "Add theme switching capability with CSS variables, persist user preference, and ensure accessibility compliance.",
    isPublic: true,
  },
  {
    title: "Create monthly budget spreadsheet",
    content:
      "Track income, expenses, savings goals, and investment contributions. Set up automatic categorization.",
    isPublic: false,
  },
  {
    title: "Review and update resume",
    content:
      "Add recent projects, update skills section, get feedback from mentors, and tailor for target roles.",
    isPublic: false,
  },
  {
    title: "Set up CI/CD pipeline",
    content:
      "Configure GitHub Actions for automated testing, linting, and deployment to staging and production environments.",
    isPublic: true,
  },
  {
    title: "Plan team building event",
    content:
      "Research venues, create activity options, send survey to team, and coordinate with HR for budget approval.",
    isPublic: false,
  },
  {
    title: "Write blog post about React hooks",
    content:
      "Cover useState, useEffect, useContext, and custom hooks with practical examples and common pitfalls.",
    isPublic: true,
  },
  {
    title: "Optimize database queries",
    content:
      "Analyze slow queries, add appropriate indexes, implement query caching, and set up monitoring alerts.",
    isPublic: true,
  },
  {
    title: "Learn Spanish basics",
    content:
      "Complete Duolingo lessons, practice with language exchange partner, and watch Spanish TV shows with subtitles.",
    isPublic: false,
  },
  {
    title: "Migrate to new email provider",
    content:
      "Export contacts and emails, set up forwarding, update accounts with new address, and configure email client.",
    isPublic: false,
  },
  {
    title: "Create component library",
    content:
      "Build reusable UI components with Storybook documentation, unit tests, and accessibility features.",
    isPublic: true,
  },
  {
    title: "Research investment options",
    content:
      "Compare index funds, ETFs, and individual stocks. Understand tax implications and create diversified portfolio strategy.",
    isPublic: false,
  },
  {
    title: "Fix mobile responsive issues",
    content:
      "Address layout problems on small screens, optimize touch targets, and improve mobile navigation experience.",
    isPublic: true,
  },
  {
    title: "Prepare for technical interview",
    content:
      "Practice data structures, algorithms, and system design. Review past projects and prepare STAR format answers.",
    isPublic: false,
  },
  {
    title: "Set up home automation",
    content:
      "Install smart lights, configure routines, set up voice assistant integration, and create automation scenes.",
    isPublic: false,
  },
  {
    title: "Write unit tests for payment module",
    content:
      "Cover edge cases, mock external APIs, test error handling, and achieve 90% code coverage target.",
    isPublic: true,
  },
  {
    title: "Plan vacation to Japan",
    content:
      "Research destinations, book flights and accommodations, create itinerary, and learn basic Japanese phrases.",
    isPublic: false,
  },
  {
    title: "Implement search functionality",
    content:
      "Add full-text search with Elasticsearch, implement filters and facets, and optimize for performance.",
    isPublic: true,
  },
  {
    title: "Declutter and organize closet",
    content:
      "Sort clothes by category, donate unused items, implement capsule wardrobe concept, and organize by season.",
    isPublic: false,
  },
  {
    title: "Create API rate limiting",
    content:
      "Implement token bucket algorithm, add Redis-based distributed rate limiting, and create usage dashboards.",
    isPublic: true,
  },
  {
    title: "Start morning exercise routine",
    content:
      "Design 30-minute workout plan, prepare gym bag night before, track progress, and find accountability partner.",
    isPublic: false,
  },
  {
    title: "Build real-time notification system",
    content:
      "Set up WebSocket server, implement push notifications, create notification preferences UI, and add email fallback.",
    isPublic: true,
  },
];

// Generate media URLs - 70% chance of having images, 1-3 images when present
function generateMedia(postIndex: number): string[] {
  // 70% of posts have images
  if (postIndex % 10 >= 7) return [];

  const count = (postIndex % 3) + 1; // 1-3 images based on index
  return Array.from(
    { length: count },
    (_, i) => `https://picsum.photos/seed/post${postIndex}-img${i + 1}/800/600`
  );
}

// Generate random like count
function generateLikes(): number {
  return Math.floor(Math.random() * 150);
}

function generateVisits(): number {
  return Math.floor(Math.random() * 600);
}

export async function seedPosts(db: typeof DbType, userIds: string[]) {
  console.info("Seeding posts...");

  if (userIds.length === 0) {
    throw new Error("Cannot seed posts without any users.");
  }

  const postRecords = mockPosts.map((post, index) => ({
    id: nanoid(),
    prompt: post.title,
    comment: `${post.title}\n\n${post.content}`,
    media: generateMedia(index),
    isPublic: post.isPublic,
    likes: post.isPublic ? generateLikes() : 0,
    visits: post.isPublic ? generateVisits() : 0,
    createdById: userIds[Math.floor(Math.random() * userIds.length)]!,
  }));

  await insertInBatches(db, posts, postRecords);

  // Query actual posts from database to get correct IDs
  const existingPosts = await db
    .select({ id: posts.id, isPublic: posts.isPublic })
    .from(posts)
    .where(isNull(posts.deletedAt));

  console.info(`Seeded/found ${existingPosts.length} posts`);

  return existingPosts;
}
