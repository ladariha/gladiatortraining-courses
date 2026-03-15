import React from "react";
import { useAsyncActionTracker } from "./useAsyncActionTracker";
import { RestRoutes, getDefaultHeaders } from "../rest";

export type ErrorLog = {
  time: string;
  msg: string;
};

export const useFetchLogs = () => {
  const {
    data: logs,
    isLoading,
    execute,
    error,
  } = useAsyncActionTracker<ErrorLog[]>(async () => {
    const response = await fetch(`${RestRoutes.logs}`, {
      method: "GET",
      headers: getDefaultHeaders(),
    });
    if (response.ok) {
      const json = await response.json();
      return json.items as ErrorLog[];
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

  return { isLoading, logs, error, refresh };
};
