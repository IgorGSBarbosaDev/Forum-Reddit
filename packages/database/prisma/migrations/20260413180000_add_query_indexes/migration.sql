CREATE INDEX "Post_deletedAt_status_isPinned_createdAt_id_idx"
ON "Post"("deletedAt", "status", "isPinned", "createdAt", "id");

CREATE INDEX "Follow_followingId_createdAt_id_idx"
ON "Follow"("followingId", "createdAt", "id");

CREATE INDEX "Follow_followerId_createdAt_id_idx"
ON "Follow"("followerId", "createdAt", "id");

CREATE INDEX "NotificationEvent_processedAt_createdAt_id_idx"
ON "NotificationEvent"("processedAt", "createdAt", "id");
