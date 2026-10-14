import { feedbackPanelRouter } from "./feedback";
import { postRouter } from "./post";
import { statRouter } from "./stat";
import { userRouter } from "./user";

export const panelRouter = {
  user: userRouter,
  stat: statRouter,
  post: postRouter,
  feedback: feedbackPanelRouter,
};
