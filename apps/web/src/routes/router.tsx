import type { RouterHistory } from "@tanstack/history";

import { createRoute, createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { WebRoutes } from "@forum-reddit/routes";

import { AppShell } from "../app/layout/app-shell";
import { NotFoundPage } from "../components/ui/not-found-page";
import { NotificationsAdminPage } from "../features/notifications-admin/pages/notifications-admin-page";
import { CreatePostPage } from "../features/posts/pages/create-post-page";
import { EditPostPage } from "../features/posts/pages/edit-post-page";
import { FeedPage } from "../features/posts/pages/feed-page";
import { PostDetailPage } from "../features/posts/pages/post-detail-page";
import { SavedPostsPage } from "../features/saved-posts/pages/saved-posts-page";
import { UserFollowersPage } from "../features/users/pages/user-followers-page";
import { UserFollowingPage } from "../features/users/pages/user-following-page";
import { UserProfilePage } from "../features/users/pages/user-profile-page";

const rootRoute = createRootRoute({
  component: AppShell,
  notFoundComponent: NotFoundPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: WebRoutes.home,
  component: FeedPage,
});

const createPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: WebRoutes.posts.create,
  component: CreatePostPage,
});

const postDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: WebRoutes.posts.byId("$postId"),
  component: PostDetailPage,
});

const editPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: WebRoutes.posts.edit("$postId"),
  component: EditPostPage,
});

const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: WebRoutes.users.byId("$userId"),
  component: UserProfilePage,
});

const userFollowersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: WebRoutes.users.followers("$userId"),
  component: UserFollowersPage,
});

const userFollowingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: WebRoutes.users.following("$userId"),
  component: UserFollowingPage,
});

const savedPostsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: WebRoutes.savedPosts,
  component: SavedPostsPage,
});

const adminToolsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: WebRoutes.adminTools,
  component: NotificationsAdminPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  createPostRoute,
  postDetailRoute,
  editPostRoute,
  userProfileRoute,
  userFollowersRoute,
  userFollowingRoute,
  savedPostsRoute,
  adminToolsRoute,
]);

export function createAppRouter(options: { history?: RouterHistory } = {}) {
  return createRouter({
    routeTree,
    history: options.history,
    defaultPreload: "intent",
    scrollRestoration: true,
  });
}

export const router = createAppRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}
