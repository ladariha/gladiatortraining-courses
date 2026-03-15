import React from "react";
import { useAsyncActionTracker } from "./useAsyncActionTracker";
import { RestRoutes, getDefaultHeaders } from "../rest";
import { errors } from "../messages";

export const useTogglePaid = () => {
  const { isLoading, execute, error, data } = useAsyncActionTracker<boolean, { groupId: number; desiredPaidStatus: number }>(
    async ({ desiredPaidStatus, groupId }) => {
      const response = await fetch(`${RestRoutes.registrationGroup}/${groupId}`, {
        method: "PUT",
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          action: "paidChange",
          value: desiredPaidStatus,
        }),
      });
      if (!response.ok) {
        throw new Error(errors.load);
      }
      return true;
    }
  );

  const setPaidStatus = React.useCallback(
    async (desiredPaidStatus: number, groupId: number) => {
      await execute({ desiredPaidStatus, groupId });
    },
    [execute]
  );

  return { isLoading, error, setPaidStatus, result: data };
};
