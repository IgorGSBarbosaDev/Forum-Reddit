import { Router } from "express";

import { requireAuth } from "../middlewares/require-auth";
import { commentsRouter } from "../modules/comments/routes";
import { followsRouter } from "../modules/follows/routes";
import { notificationsRouter } from "../modules/notifications/routes";
import { postsRouter } from "../modules/posts/routes";
import { reactionsRouter } from "../modules/reactions/routes";
import { savedPostsRouter } from "../modules/saved-posts/routes";
import { usersRouter } from "../modules/users/routes";

export const router = Router();

router.use("/posts", postsRouter);
router.use("/", commentsRouter);
router.use("/", reactionsRouter);
router.use("/", savedPostsRouter);
router.use("/users", usersRouter);
router.use("/users", followsRouter);
router.use("/internal/notifications", notificationsRouter);

router.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    service: "forum-reddit-api",
  });
});

router.get("/me", requireAuth, (request, response) => {
  response.status(200).json({
    currentUserId: request.currentUser!.id,
    role: request.currentUser!.role,
  });
});
