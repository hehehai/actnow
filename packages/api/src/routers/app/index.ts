import { likeRouter } from "./like";
import { postRouter } from "./post";
import { appUserRouter } from "./user";

export const appRouter = {
  post: postRouter,
  like: likeRouter,
  user: appUserRouter,
};
