function withParam(segment: string) {
  return `:${segment}`;
}

function join(...segments: string[]) {
  return segments.join("/");
}

function joinWeb(...segments: string[]) {
  const joined = segments.join("/");
  return joined === "" ? "/" : joined;
}

export const ApiRoutes = {
  health: "/health",
  me: "/me",
  posts: {
    root: "/posts",
    byId: (postId = withParam("postId")) => join("/posts", postId),
    comments: (postId = withParam("postId")) => join("/posts", postId, "comments"),
    like: (postId = withParam("postId")) => join("/posts", postId, "like"),
    save: (postId = withParam("postId")) => join("/posts", postId, "save"),
    status: (postId = withParam("postId")) => join("/posts", postId, "status"),
    pin: (postId = withParam("postId")) => join("/posts", postId, "pin"),
  },
  comments: {
    byId: (commentId = withParam("commentId")) => join("/comments", commentId),
    replies: (commentId = withParam("commentId")) => join("/comments", commentId, "replies"),
    like: (commentId = withParam("commentId")) => join("/comments", commentId, "like"),
  },
  users: {
    root: "/users",
    byId: (userId = withParam("userId")) => join("/users", userId),
    followers: (userId = withParam("userId")) => join("/users", userId, "followers"),
    following: (userId = withParam("userId")) => join("/users", userId, "following"),
    relationship: (userId = withParam("userId")) => join("/users", userId, "relationship"),
    follow: (userId = withParam("userId")) => join("/users", userId, "follow"),
  },
  savedPosts: {
    mine: "/me/saved-posts",
  },
  notificationsAdmin: {
    root: "/internal/notifications",
    process: "/internal/notifications/process",
  },
} as const;

export const WebRoutes = {
  home: "/",
  posts: {
    create: "/posts/new",
    byId: (postId = withParam("postId")) => joinWeb("", "posts", postId),
    edit: (postId = withParam("postId")) => joinWeb("", "posts", postId, "edit"),
  },
  users: {
    byId: (userId = withParam("userId")) => joinWeb("", "users", userId),
    followers: (userId = withParam("userId")) => joinWeb("", "users", userId, "followers"),
    following: (userId = withParam("userId")) => joinWeb("", "users", userId, "following"),
  },
  savedPosts: "/saved",
  adminTools: "/admin/tools",
} as const;
