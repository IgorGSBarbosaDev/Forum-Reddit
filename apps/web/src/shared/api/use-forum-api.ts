import { useMemo } from "react";

import { useAuthSession } from "../../features/auth-context/auth-context";
import { createForumApi } from "./forum-api";
import { createHttpClient } from "./http-client";

export function useForumApi() {
  const { headers } = useAuthSession();

  return useMemo(() => {
    const client = createHttpClient({
      baseUrl: "/api",
      getAuthHeaders: () => headers,
    });

    return createForumApi(client);
  }, [headers]);
}