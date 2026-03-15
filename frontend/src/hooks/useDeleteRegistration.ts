import React from "react";
import { useAsyncActionTracker } from "./useAsyncActionTracker";
import { RestRoutes, getDefaultHeaders } from "../rest";
import { errors } from "../messages";

export const useDeleteRegistration = () => {
  const { isLoading, execute, error, data } = useAsyncActionTracker<boolean, { groupId: number }>(async ({ groupId }) => {
    const response = await fetch(`${RestRoutes.registrationGroup}/${groupId}`, {
      method: "DELETE",
      headers: getDefaultHeaders(),
    });
    if (!response.ok) {
      throw new Error(errors.load);
    }

    return true;
  });

  const deleteRegistration = React.useCallback(
    async (groupId: number) => {
      await execute({ groupId });
    },
    [execute]
  );

  return { isLoading, error, deleteRegistration, result: data };
};
