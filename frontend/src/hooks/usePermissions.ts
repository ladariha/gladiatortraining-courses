import React from "react";
import { UserContext } from "../context/UserContext";
import { UserRole } from "../types";

export const usePermissions = () => {
  const { role } = React.useContext(UserContext);

  const canUserManageEvents = () => role === UserRole.Admin;

  return { canUserManageEvents };
};
