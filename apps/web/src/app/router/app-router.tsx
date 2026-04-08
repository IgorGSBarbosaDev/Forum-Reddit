import { BrowserRouter, Route, Routes } from "react-router-dom";

import { NotificationsAdminPage } from "../../features/notifications-admin/pages/notifications-admin-page";
import { CreatePostPage } from "../../features/posts/pages/create-post-page";
import { EditPostPage } from "../../features/posts/pages/edit-post-page";
import { FeedPage } from "../../features/posts/pages/feed-page";
import { PostDetailPage } from "../../features/posts/pages/post-detail-page";
import { SavedPostsPage } from "../../features/saved-posts/pages/saved-posts-page";
import { UserFollowersPage } from "../../features/users/pages/user-followers-page";
import { UserFollowingPage } from "../../features/users/pages/user-following-page";
import { UserProfilePage } from "../../features/users/pages/user-profile-page";
import { NotFoundPage } from "../../shared/ui/not-found-page";
import { AppShell } from "../layout/app-shell";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<FeedPage />} />
          <Route path="posts/new" element={<CreatePostPage />} />
          <Route path="posts/:postId" element={<PostDetailPage />} />
          <Route path="posts/:postId/edit" element={<EditPostPage />} />
          <Route path="users/:userId" element={<UserProfilePage />} />
          <Route path="users/:userId/followers" element={<UserFollowersPage />} />
          <Route path="users/:userId/following" element={<UserFollowingPage />} />
          <Route path="saved" element={<SavedPostsPage />} />
          <Route path="admin/tools" element={<NotificationsAdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}