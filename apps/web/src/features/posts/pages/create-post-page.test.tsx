import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { createQueryClient } from "../../../app/providers/query-client";
import { AuthSessionProvider } from "../../auth-context/auth-context";
import { server } from "../../../test/server";
import { CreatePostPage } from "./create-post-page";

const STORAGE_KEY = "forum-reddit.dev-auth";

function renderPage() {
  const queryClient = createQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthSessionProvider>
        <MemoryRouter>
          <CreatePostPage />
        </MemoryRouter>
      </AuthSessionProvider>
    </QueryClientProvider>,
  );
}

describe("CreatePostPage", () => {
  it("blocks publishing when the configured session is invalid", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        userId: "ghost-user",
        role: "user",
      }),
    );

    server.use(
      http.get("/api/me", () =>
        HttpResponse.json(
          {
            message: "Authenticated user not found.",
            code: "CURRENT_USER_NOT_FOUND",
          },
          { status: 404 },
        ),
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Sessao invalida")).toBeTruthy();
      expect(screen.getByText("Authenticated user not found.")).toBeTruthy();
    });

    expect(screen.queryByRole("button", { name: "Publicar post" })).toBeNull();
  });
});
