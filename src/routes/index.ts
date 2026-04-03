import { Router } from "express";

import { requireAuth } from "../middlewares/require-auth";
import { postsRouter } from "../modules/posts/routes";

export const router = Router();

router.use("/posts", postsRouter);

router.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    service: "forum-reddit-api",
  });
});

router.get("/me", requireAuth, (request, response) => {
  response.status(200).json({
    currentUserId: request.currentUser!.id,
  });
});
