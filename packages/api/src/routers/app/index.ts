import { feedbackRouter } from "./feedback";
import { likeRouter } from "./like";
import { postRouter } from "./post";
import { appUserRouter } from "./user";

export const appRouter = {
  feedback: feedbackRouter,
  post: postRouter,
  like: likeRouter,
  user: appUserRouter,
};
