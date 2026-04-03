import { Router } from "express";

import { requireAuth } from "../middlewares/require-auth";

export const router = Router();

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
