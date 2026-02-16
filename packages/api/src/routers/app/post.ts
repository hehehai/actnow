import {
  postDeleteSchema,
  postDetailSchema,
  postFeedSchema,
  postSearchSchema,
  postSimilarSchema,
  postTagsByTypeSchema,
  postTrackViewSchema,
  postTrendingSchema,
  postUpsertSchema,
} from "@actnow/common";
import { protectedProcedure, publicProcedure } from "../../index";
import {
  createPostService,
  deletePostService,
  getPostDetailService,
  getSimilarPostsService,
  getTagsByTypeService,
  getTrendingPostsService,
  listPostsService,
  searchPostsService,
  trackPostViewService,
  updatePostService,
} from "../../services/app/post-service";

export const postRouter = {
  list: publicProcedure
    .input(postFeedSchema)
    .handler(async ({ context, input }) => listPostsService(context, input)),

  detail: publicProcedure
    .input(postDetailSchema)
    .handler(async ({ context, input }) =>
      getPostDetailService(context, input)
    ),

  search: publicProcedure
    .input(postSearchSchema)
    .handler(async ({ context, input }) => searchPostsService(context, input)),

  trending: publicProcedure
    .input(postTrendingSchema)
    .handler(async ({ context, input }) =>
      getTrendingPostsService(context, input)
    ),

  tagsByType: publicProcedure
    .input(postTagsByTypeSchema)
    .handler(async ({ context, input }) =>
      getTagsByTypeService(context, input)
    ),

  trackView: publicProcedure
    .input(postTrackViewSchema)
    .handler(async ({ context, input }) =>
      trackPostViewService(context, input)
    ),

  create: protectedProcedure
    .input(postUpsertSchema.omit({ id: true }))
    .handler(async ({ context, input }) => createPostService(context, input)),

  update: protectedProcedure
    .input(postUpsertSchema)
    .handler(async ({ context, input }) => updatePostService(context, input)),

  delete: protectedProcedure
    .input(postDeleteSchema)
    .handler(async ({ context, input }) => deletePostService(context, input)),

  similar: publicProcedure
    .input(postSimilarSchema)
    .handler(async ({ context, input }) =>
      getSimilarPostsService(context, input)
    ),
};
