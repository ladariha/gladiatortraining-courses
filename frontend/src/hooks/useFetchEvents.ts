import React from "react";
import { RegistrationEvent } from "../types";
import { useAsyncActionTracker } from "./useAsyncActionTracker";
import { RestRoutes, getDefaultHeaders } from "../rest";

export const useFetchEvents = (limit = 20) => {
  const {
    data: events,
    isLoading,
    execute,
    error,
  } = useAsyncActionTracker<RegistrationEvent[]>(async () => {
    const response = await fetch(`${RestRoutes.events}/${limit}`, {
      method: "GET",
      headers: getDefaultHeaders(),
    });
    if (response.ok) {
      const json = await response.json();
      return json.items as RegistrationEvent[];
    }
    throw new Error("Oops");
  });

  React.useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = React.useCallback(() => {
    execute();
  }, [execute]);

  return { isLoading, events, error, refresh };
};
