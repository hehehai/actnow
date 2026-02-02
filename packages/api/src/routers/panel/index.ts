import { feedbackPanelRouter } from "./feedback";
import { postRouter } from "./post";
import { statRouter } from "./stat";
import { tagRouter } from "./tag";
import { userRouter } from "./user";

export const panelRouter = {
  user: userRouter,
  stat: statRouter,
  post: postRouter,
  tag: tagRouter,
  feedback: feedbackPanelRouter,
};
