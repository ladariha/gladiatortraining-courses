import React from "react";
import { Registration } from "../types";
import { useAsyncActionTracker } from "./useAsyncActionTracker";
import { RestRoutes, getDefaultHeaders } from "../rest";

const sortAndGroupByGroup = (items: Registration[]): Registration[] => {
  const result: Registration[] = [];

  const mapByGroupId = new Map<number, Registration[]>();

  items.forEach((item) => {
    const group = mapByGroupId.get(item.group_id) || [];
    if (item.is_leader) {
      group.unshift(item);
    } else {
      group.push(item);
    }
    mapByGroupId.set(item.group_id, group);
  });

  const groups = Array.from(mapByGroupId.values());
  groups.forEach((group) => result.push(...group));

  return result;
};

export const useFetchRegistrations = (eventId: number) => {
  const {
    data: registrations,
    isLoading,
    execute,
    error,
  } = useAsyncActionTracker<Registration[]>(async () => {
    const response = await fetch(`${RestRoutes.registrations}/${eventId}`, {
      method: "GET",
      headers: getDefaultHeaders(),
    });
    if (response.ok) {
      const json = await response.json();
      return sortAndGroupByGroup(json.items as Registration[]);
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

  return { isLoading, registrations, error, refresh };
};
