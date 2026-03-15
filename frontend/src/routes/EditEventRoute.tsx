import { useNavigate, useParams } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";
import React from "react";
import { EventForm } from "../components/EventForm";
import { useFetchEvent } from "../hooks/useFetchEvent";
import { Message } from "primereact/message";
import { errors } from "../messages";
import { EventFormData } from "../hooks/useSubmitEvent";
import { RegistrationTemplate } from "../types";
import { Spinner } from "../components/Spinner";

const EditEvent: React.FC<{ id: string }> = ({ id }) => {
  const { error, event, isLoading } = useFetchEvent(parseInt(id, 10));
  const [eventData, setEventData] = React.useState<EventFormData>();

  React.useEffect(() => {
    if (event) {
      setEventData({
        ...event,
        registrations: JSON.parse(event?.registrations) as RegistrationTemplate[],
      });
    } else {
      setEventData(undefined);
    }
  }, [event]);

  return (
    <>
      {isLoading && <Spinner />}
      {!isLoading && error && (
        <Message
          severity="error"
          text={errors.event}
        />
      )}
      {!isLoading && !error && eventData && <EventForm defaultData={eventData} />}
    </>
  );
};

export const EditEventRoute: React.FC<{}> = () => {
  const { canUserManageEvents } = usePermissions();
  const navigate = useNavigate();
  const { id } = useParams();

  if (!canUserManageEvents() || !id) {
    navigate("/");
    return <></>;
  }

  return <EditEvent id={id} />;
};
