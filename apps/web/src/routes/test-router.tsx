import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";

import { createAppRouter } from "./router";

type TestRouterProps = {
  initialEntries?: string[];
};

export function TestRouter({ initialEntries = ["/"] }: TestRouterProps) {
  const router = createAppRouter({
    history: createMemoryHistory({ initialEntries }),
  });

  return <RouterProvider router={router} />;
}
