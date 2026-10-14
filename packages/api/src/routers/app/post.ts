import {
  postDetailSchema,
  postFeedSchema,
  postSearchSchema,
} from "@actnow/common";
import { publicProcedure } from "../../index";
import {
  getPostDetailService,
  listPostsService,
  searchPostsService,
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
};
