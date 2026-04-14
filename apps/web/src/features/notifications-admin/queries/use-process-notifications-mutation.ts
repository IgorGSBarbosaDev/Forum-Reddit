import { useMutation } from "@tanstack/react-query";

import { useForumApi } from "../../../shared/api/use-forum-api";

export function useProcessNotificationsMutation() {
  const api = useForumApi();

  return useMutation({
    mutationFn: () => api.notificationsAdmin.processPending(),
  });
}
