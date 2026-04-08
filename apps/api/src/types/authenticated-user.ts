export type AuthenticatedUser = {
  id: string;
  role: "user" | "moderator" | "admin";
};
