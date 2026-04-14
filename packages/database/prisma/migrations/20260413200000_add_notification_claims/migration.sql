ALTER TABLE "NotificationEvent"
ADD COLUMN "claimedAt" TIMESTAMP(3),
ADD COLUMN "claimedBy" TEXT;

CREATE INDEX "NotificationEvent_claimedAt_createdAt_id_idx"
ON "NotificationEvent"("claimedAt", "createdAt", "id");
