import { useQuery } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { createQueryClient } from "../../components/providers/query-client";
import { AuthSessionProvider, useAuthSession } from "../../features/auth-context/auth-context";
import { useCommentTree } from "../../features/comments/hooks/use-comment-tree";
import { useFeedPosts } from "../../features/posts/hooks/use-feed-posts";
import { usePostDetail } from "../../features/posts/hooks/use-post-detail";
import { server } from "../../test/server";
import { queryKeys } from "./query-keys";
import { useForumApi } from "./use-forum-api";

function SessionControls() {
  const { reset, setUserId } = useAuthSession();

  return (
    <div>
      <button type="button" onClick={() => reset()}>
        public
      </button>
      <button type="button" onClick={() => setUserId("user-1")}>
        user-1
      </button>
      <button type="button" onClick={() => setUserId("user-2")}>
        user-2
      </button>
      <button type="button" onClick={() => setUserId("ghost-user")}>
        ghost
      </button>
    </div>
  );
}

function FeedProbe() {
  const feedQuery = useFeedPosts({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    order: "desc",
  });

  return <div data-testid="feed-state">{String(feedQuery.data?.data[0]?.likedByMe ?? false)}</div>;
}

function PostProbe() {
  const postQuery = usePostDetail("post-1");

  return <div data-testid="post-state">{String(postQuery.data?.savedByMe ?? false)}</div>;
}

function CommentsProbe() {
  const commentsQuery = useCommentTree("post-1");

  return <div data-testid="comment-state">{String(commentsQuery.data?.[0]?.likedByMe ?? false)}</div>;
}

function ProfileProbe() {
  const api = useForumApi();
  const { viewerId } = useAuthSession();

  const profileQuery = useQuery({
    queryKey: queryKeys.users.profile("target-user", viewerId),
    queryFn: () => api.users.getProfile("target-user"),
  });

  return <div data-testid="profile-state">{String(profileQuery.data?.following ?? false)}</div>;
}

function SessionAwareQueryHarness() {
  return (
    <>
      <SessionControls />
      <FeedProbe />
      <PostProbe />
      <CommentsProbe />
      <ProfileProbe />
    </>
  );
}

function renderHarness() {
  const queryClient = createQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthSessionProvider>
        <SessionAwareQueryHarness />
      </AuthSessionProvider>
    </QueryClientProvider>,
  );
}

describe("session-aware query keys", () => {
  it("refetches personalized queries when the viewer changes", async () => {
    const viewersByPath: Record<string, string[]> = {
      "/api/me": [],
      "/api/posts": [],
      "/api/posts/post-1": [],
      "/api/posts/post-1/comments": [],
      "/api/users/target-user": [],
    };

    function resolveViewer(request: Request) {
      return request.headers.get("x-user-id") ?? "public";
    }

    server.use(
      http.get("/api/me", ({ request }) => {
        const viewer = resolveViewer(request);
        viewersByPath["/api/me"].push(viewer);

        if (viewer === "public" || viewer === "ghost-user") {
          return HttpResponse.json(
            { message: "Authenticated user not found.", code: "CURRENT_USER_NOT_FOUND" },
            { status: 404 },
          );
        }

        return HttpResponse.json({
          currentUserId: viewer,
          role: "user",
        });
      }),
      http.get("/api/posts", ({ request }) => {
        const viewer = resolveViewer(request);
        viewersByPath["/api/posts"].push(viewer);

        return HttpResponse.json({
          data: [
            {
              id: "post-1",
              title: "Post",
              contentPreview: null,
              author: null,
              status: "ACTIVE",
              isPinned: false,
              commentsCount: 1,
              likesCount: viewer === "user-1" ? 1 : 0,
              likedByMe: viewer === "user-1",
              savedByMe: false,
              createdAt: "2026-04-08T10:00:00.000Z",
              updatedAt: "2026-04-08T10:00:00.000Z",
            },
          ],
          meta: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
          },
        });
      }),
      http.get("/api/posts/post-1", ({ request }) => {
        const viewer = resolveViewer(request);
        viewersByPath["/api/posts/post-1"].push(viewer);

        return HttpResponse.json({
          id: "post-1",
          title: "Post",
          content: "Body",
          author: null,
          status: "ACTIVE",
          isPinned: false,
          wasEdited: false,
          editCount: 0,
          lastEditedAt: null,
          deletedAt: null,
          commentsCount: 1,
          likesCount: 0,
          likedByMe: false,
          savedByMe: viewer === "user-1",
          acceptsComments: true,
          createdAt: "2026-04-08T10:00:00.000Z",
          updatedAt: "2026-04-08T10:00:00.000Z",
        });
      }),
      http.get("/api/posts/post-1/comments", ({ request }) => {
        const viewer = resolveViewer(request);
        viewersByPath["/api/posts/post-1/comments"].push(viewer);

        return HttpResponse.json([
          {
            id: "comment-1",
            postId: "post-1",
            parentId: null,
            depth: 0,
            content: "Comment",
            author: null,
            wasEdited: false,
            editCount: 0,
            lastEditedAt: null,
            deletedAt: null,
            likesCount: viewer === "user-1" ? 1 : 0,
            likedByMe: viewer === "user-1",
            createdAt: "2026-04-08T10:00:00.000Z",
            updatedAt: "2026-04-08T10:00:00.000Z",
            replies: [],
          },
        ]);
      }),
      http.get("/api/users/target-user", ({ request }) => {
        const viewer = resolveViewer(request);
        viewersByPath["/api/users/target-user"].push(viewer);

        return HttpResponse.json({
          id: "target-user",
          username: "target.user",
          displayName: "Target User",
          bio: null,
          following: viewer === "user-1",
          followersCount: viewer === "user-1" ? 1 : 0,
          followingCount: 0,
        });
      }),
    );

    renderHarness();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByTestId("feed-state").textContent).toBe("false");
      expect(screen.getByTestId("post-state").textContent).toBe("false");
      expect(screen.getByTestId("comment-state").textContent).toBe("false");
      expect(screen.getByTestId("profile-state").textContent).toBe("false");
    });

    await user.click(screen.getByRole("button", { name: "user-1" }));

    await waitFor(() => {
      expect(screen.getByTestId("feed-state").textContent).toBe("true");
      expect(screen.getByTestId("post-state").textContent).toBe("true");
      expect(screen.getByTestId("comment-state").textContent).toBe("true");
      expect(screen.getByTestId("profile-state").textContent).toBe("true");
    });

    await user.click(screen.getByRole("button", { name: "user-2" }));

    await waitFor(() => {
      expect(screen.getByTestId("feed-state").textContent).toBe("false");
      expect(screen.getByTestId("post-state").textContent).toBe("false");
      expect(screen.getByTestId("comment-state").textContent).toBe("false");
      expect(screen.getByTestId("profile-state").textContent).toBe("false");
    });

    await user.click(screen.getByRole("button", { name: "ghost" }));

    await waitFor(() => {
      expect(screen.getByTestId("feed-state").textContent).toBe("false");
      expect(screen.getByTestId("post-state").textContent).toBe("false");
      expect(screen.getByTestId("comment-state").textContent).toBe("false");
      expect(screen.getByTestId("profile-state").textContent).toBe("false");
    });

    await user.click(screen.getByRole("button", { name: "public" }));

    await waitFor(() => {
      expect(screen.getByTestId("feed-state").textContent).toBe("false");
      expect(screen.getByTestId("post-state").textContent).toBe("false");
      expect(screen.getByTestId("comment-state").textContent).toBe("false");
      expect(screen.getByTestId("profile-state").textContent).toBe("false");
    });

    expect(viewersByPath["/api/me"]).toEqual(["user-1", "user-2", "ghost-user"]);
    expect(viewersByPath["/api/posts"]).toEqual(["public", "user-1", "public", "user-2"]);
    expect(viewersByPath["/api/posts/post-1"]).toEqual(["public", "user-1", "public", "user-2"]);
    expect(viewersByPath["/api/posts/post-1/comments"]).toEqual(["public", "user-1", "public", "user-2"]);
    expect(viewersByPath["/api/users/target-user"]).toEqual(["public", "user-1", "public", "user-2"]);
  });
});
