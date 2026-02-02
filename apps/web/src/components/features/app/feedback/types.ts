import type { client } from "@/lib/orpc";

type FeedbackListResponse = Awaited<
  ReturnType<typeof client.features.feedback.list>
>;

export type FeedbackRow = FeedbackListResponse[number];

export type FeedbackStatus = "ALL" | "PENDING" | "REPLIED";
