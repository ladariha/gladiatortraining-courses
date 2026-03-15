import React from "react";
import { RegistrationEvent } from "../types";
import { useAsyncActionTracker } from "./useAsyncActionTracker";
import { RestRoutes, getDefaultHeaders } from "../rest";
import { errors } from "../messages";

export const useFetchEvent = (id: number) => {
  const {
    data: event,
    isLoading,
    execute,
    error,
  } = useAsyncActionTracker<RegistrationEvent>(async () => {
    const response = await fetch(`${RestRoutes.event}/${id}`, {
      method: "GET",
      headers: getDefaultHeaders(),
    });
    if (response.ok) {
      const json = await response.json();
      return json as RegistrationEvent;
    }
    throw new Error(errors.load);
  });

  React.useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = React.useCallback(() => {
    execute();
  }, [execute]);

  return { isLoading, event, error, refresh };
};
