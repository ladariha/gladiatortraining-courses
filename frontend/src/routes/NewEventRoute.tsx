import { useNavigate } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";
import React from "react";
import { EventForm } from "../components/EventForm";

export const NewEventRoute: React.FC<{}> = () => {
  const { canUserManageEvents } = usePermissions();
  const navigate = useNavigate();

  if (!canUserManageEvents()) {
    navigate("/");
    return <></>;
  }

  return <EventForm />;
};
