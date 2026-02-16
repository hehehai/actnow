import type { InferClientOutputs } from "@orpc/client";
import type { client } from "./orpc";

export type ClientOutputs = InferClientOutputs<typeof client>;

// Post feed/listing types
export type PostFeedOutput = ClientOutputs["app"]["post"]["list"];
export type FeedItem = PostFeedOutput["items"][number];

export type PostDetailOutput = ClientOutputs["app"]["post"]["detail"];

export type TrendingOutput = ClientOutputs["app"]["post"]["trending"];

// Like Types
export type UserLikesOutput = ClientOutputs["app"]["like"]["getUserLikes"];
export type LikeItem = UserLikesOutput["items"][number];

// Feedback Types
export type FeedbackListOutput = ClientOutputs["app"]["feedback"]["list"];
export type FeedbackPanelListOutput =
  ClientOutputs["panel"]["feedback"]["list"];
