import { feedbackRouter } from "./feedback";
import { postRouter } from "./post";
import { appUserRouter } from "./user";

export const appRouter = {
  feedback: feedbackRouter,
  post: postRouter,
  user: appUserRouter,
};
