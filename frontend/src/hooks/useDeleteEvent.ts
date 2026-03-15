import React from "react";
import { useAsyncActionTracker } from "./useAsyncActionTracker";
import { RestRoutes, getDefaultHeaders } from "../rest";
import { errors } from "../messages";

export enum VisibilityChange {
  Visible = "visible",
  Hide = "hide",
  HardDelete = "delete",
}

export const useDeleteEvent = (id: number) => {
  const { isLoading, execute, error } = useAsyncActionTracker<void, VisibilityChange>(async (desiredVisibility: VisibilityChange) => {
    const response = await fetch(`${RestRoutes.event}/${id}`, {
      method: "DELETE",
      headers: getDefaultHeaders(),
      body: JSON.stringify({ visible: desiredVisibility }),
    });
    if (!response.ok) {
      throw new Error(errors.load);
    }
  });

  const setVisibility = React.useCallback(
    async (desiredVisibility: VisibilityChange) => {
      await execute(desiredVisibility);
    },
    [execute]
  );

  const deleteCompletely = React.useCallback(async () => {
    await execute(VisibilityChange.HardDelete);
  }, [execute]);

  return { isLoading, error, setVisibility, deleteCompletely };
};
