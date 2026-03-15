import React from "react";
import { UserRole } from "../types";

export const UserContext = React.createContext<{
  role?: UserRole;
  setRole: (u?: UserRole) => void;
}>({
  role: UserRole.Visitor,
  setRole: () => {},
});
