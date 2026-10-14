import type { InferClientOutputs } from "@orpc/client";
import type { client } from "./orpc";

export type ClientOutputs = InferClientOutputs<typeof client>;

// Post feed/listing types
export type PostFeedOutput = ClientOutputs["app"]["post"]["list"];
export type FeedItem = PostFeedOutput["items"][number];

export type PostDetailOutput = ClientOutputs["app"]["post"]["detail"];

// Feedback Types
export type FeedbackListOutput = ClientOutputs["app"]["feedback"]["list"];
export type FeedbackPanelListOutput =
  ClientOutputs["panel"]["feedback"]["list"];
