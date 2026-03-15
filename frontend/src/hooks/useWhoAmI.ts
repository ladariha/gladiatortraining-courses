import React from "react";
import { UserRole } from "../types";
import { useAsyncActionTracker } from "./useAsyncActionTracker";
import { RestRoutes, getDefaultHeaders } from "../rest";

export const useWhoAmI = () => {
  const {
    data: role,
    isLoading,
    execute,
    error,
  } = useAsyncActionTracker<UserRole | undefined>(
    async () => {
      const response = await fetch(RestRoutes.whoAmI, {
        method: "GET",
        headers: getDefaultHeaders(),
      });
      if (response.ok) {
        const json = await response.json();
        return json.role as UserRole;
      }
      return UserRole.Visitor;
    },
    undefined,
    false,
    true
  );

  React.useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isLoading, role, error };
};
