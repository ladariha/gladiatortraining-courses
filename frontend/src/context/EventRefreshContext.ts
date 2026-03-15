import React from "react";

export const EventRefreshContext = React.createContext<{
  refreshKey: number;
  setRefreshKey: (v: number) => void;
}>({
  refreshKey: 0,
  setRefreshKey: () => {},
});
