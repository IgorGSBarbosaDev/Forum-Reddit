export type ActiveUserGuard = {
  assertActiveUser(currentUserId: string): Promise<void>;
};
