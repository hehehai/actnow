import { nanoid } from "nanoid";
import type { db as DbType } from "../index";
import { feedbacks } from "../schema/feedback";
import { insertInBatches } from "./insert-in-batches";

// Realistic feedback data
const mockFeedbacks = [
  {
    title: "Dark mode toggle not working on mobile",
    content:
      "When I try to switch to dark mode on my iPhone, the toggle switches but the theme doesn't change. Works fine on desktop.",
    status: "REPLIED" as const,
    replyContent:
      "Thank you for reporting this! We've identified the issue with iOS Safari and pushed a fix. Please try clearing your cache and refreshing the page.",
  },
  {
    title: "Feature request: Export posts to CSV",
    content:
      "It would be great to have an option to export all my posts to a CSV file for backup or analysis purposes.",
    status: "PENDING" as const,
    replyContent: null,
  },
  {
    title: "Search not finding archived posts",
    content:
      "When I search for a post that I've already archived, it doesn't show up in the results. Is this intentional?",
    status: "REPLIED" as const,
    replyContent:
      "By default, search only shows active posts. You can toggle 'Include archived' in the search filters to see all posts.",
  },
  {
    title: "Love the new tag system!",
    content:
      "Just wanted to say the new tagging feature is amazing. Makes organizing my tasks so much easier. Great work!",
    status: "REPLIED" as const,
    replyContent:
      "Thank you so much for the kind words! We're glad you're enjoying the tag system. More improvements coming soon!",
  },
  {
    title: "Page loads slowly with many posts",
    content:
      "I have about 500 posts and the page takes 5-6 seconds to load. Any way to improve this?",
    status: "PENDING" as const,
    replyContent: null,
  },
  {
    title: "Keyboard shortcuts documentation",
    content:
      "Are there any keyboard shortcuts available? If so, where can I find the documentation?",
    status: "REPLIED" as const,
    replyContent:
      "Yes! Press '?' anywhere in the app to see all available keyboard shortcuts. We're also adding a dedicated shortcuts page soon.",
  },
  {
    title: "Bug: Duplicate notifications",
    content:
      "I'm receiving duplicate email notifications for the same post updates. Started happening after the last update.",
    status: "PENDING" as const,
    replyContent: null,
  },
  {
    title: "Request: Recurring posts",
    content:
      "Would love to have the ability to create recurring posts (daily, weekly, monthly). This would be super helpful for routine tasks.",
    status: "PENDING" as const,
    replyContent: null,
  },
  {
    title: "Calendar integration",
    content:
      "Any plans to integrate with Google Calendar or Outlook? Would be great to see posts with due dates on my calendar.",
    status: "REPLIED" as const,
    replyContent:
      "Calendar integration is on our roadmap for Q2. We're planning to support Google Calendar, Outlook, and Apple Calendar.",
  },
  {
    title: "Mobile app request",
    content:
      "Is there a mobile app in development? The web version works but a native app would be much better for quick task entry.",
    status: "REPLIED" as const,
    replyContent:
      "We're currently focused on making the web app fully responsive. A native mobile app is planned for later this year.",
  },
  {
    title: "Cannot delete account",
    content:
      "I'm trying to delete my account but the button seems to be disabled. How can I proceed with account deletion?",
    status: "PENDING" as const,
    replyContent: null,
  },
  {
    title: "Suggestion: Subtasks feature",
    content:
      "It would be helpful to break down larger posts into subtasks with their own checkboxes and progress tracking.",
    status: "PENDING" as const,
    replyContent: null,
  },
  {
    title: "Great customer support!",
    content:
      "Had an issue last week and the support team resolved it within hours. Really appreciate the quick response!",
    status: "REPLIED" as const,
    replyContent:
      "Thank you for the feedback! We strive to provide the best support possible. Don't hesitate to reach out if you need anything else.",
  },
  {
    title: "API documentation request",
    content:
      "I'm a developer and would like to integrate your service with my workflow tools. Is there a public API available?",
    status: "REPLIED" as const,
    replyContent:
      "We have a REST API in beta. Please email api@actnow.dev with your use case and we'll send you the documentation and API key.",
  },
  {
    title: "Accessibility improvements needed",
    content:
      "Some buttons don't have proper aria labels and the color contrast in certain areas is too low for visually impaired users.",
    status: "PENDING" as const,
    replyContent: null,
  },
];

// Generate snapshots - 60% chance of having screenshots, 1-2 images when present
function generateSnapshots(feedbackIndex: number): string[] {
  // 60% of feedbacks have screenshots (bug reports typically have them)
  if (feedbackIndex % 5 >= 3) return [];

  const count = (feedbackIndex % 2) + 1; // 1-2 images based on index
  return Array.from(
    { length: count },
    (_, i) =>
      `https://picsum.photos/seed/feedback${feedbackIndex}-snap${i + 1}/1200/800`
  );
}

export async function seedFeedbacks(db: typeof DbType, userIds: string[]) {
  console.info("Seeding feedbacks...");

  // Only use non-admin users for feedback (skip first user which is admin)
  const regularUserIds = userIds.slice(1);
  if (regularUserIds.length === 0) {
    throw new Error("Cannot seed feedbacks without any non-admin users.");
  }

  const feedbackRecords = mockFeedbacks.map((feedback, index) => ({
    id: nanoid(),
    title: feedback.title,
    content: feedback.content,
    snapshots: generateSnapshots(index),
    status: feedback.status,
    replyContent: feedback.replyContent,
    repliedAt: feedback.replyContent ? new Date() : null,
    createdById:
      regularUserIds[Math.floor(Math.random() * regularUserIds.length)]!,
  }));

  await insertInBatches(db, feedbacks, feedbackRecords);

  console.info(`Seeded ${feedbackRecords.length} feedbacks`);

  return feedbackRecords;
}
