import React from "react";
import { RegistrationEvent } from "../types";
import { Button } from "primereact/button";
import { admin, common } from "../messages";
import { useNavigate } from "react-router-dom";
import { VisibilityChange, useDeleteEvent } from "../hooks/useDeleteEvent";
import { ConfirmPopup } from "primereact/confirmpopup";

export const EventAdminActions: React.FC<{
  event: RegistrationEvent;
  isEventPage: boolean;
  refresh: () => void;
}> = ({ event, refresh, isEventPage }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = React.useState<number>(event.visible);
  const [isDeleteConfirmOpened, setIsDeleteConfirmOpened] = React.useState<boolean>(false);
  const { isLoading, setVisibility, deleteCompletely } = useDeleteEvent(event.id);

  // eslint-disable-next-line no-null/no-null
  const buttonEl = React.useRef<HTMLElement>(null);

  const toggleVisible = React.useCallback(async () => {
    await setVisibility(visible ? VisibilityChange.Hide : VisibilityChange.Visible);
    setVisible(visible ? 0 : 1);
    refresh();
  }, [setVisibility, visible, refresh]);

  const deleteEvent = React.useCallback(async () => {
    await deleteCompletely();
    if (isEventPage) {
      navigate("/");
    } else {
      refresh();
    }
  }, [deleteCompletely, isEventPage, navigate, refresh]);

  return (
    <span className="p-buttonset mr-2">
      {buttonEl.current && (
        <ConfirmPopup
          target={buttonEl.current}
          visible={isDeleteConfirmOpened}
          onHide={() => setIsDeleteConfirmOpened(false)}
          message={admin.confirmDeleteEvent}
          icon="pi pi-exclamation-triangle"
          accept={deleteEvent}
          reject={() => setIsDeleteConfirmOpened(false)}
        />
      )}

      <Button
        label={common.edit}
        onClick={() => navigate(`/events/${event.id}/edit`)}
        icon="pi pi-check"
        size="small"
      />
      <Button
        label={visible ? common.hideEvent : common.publishEvent}
        icon={`pi pi-${visible ? "trash" : "unlock"}`}
        loading={isLoading}
        disabled={isLoading}
        onClick={toggleVisible}
        size="small"
        severity="warning"
      />
      <Button
        label={common.delete}
        icon="pi pi-exclamation-triangle"
        loading={isLoading}
        disabled={isLoading}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ref={buttonEl}
        onClick={() => setIsDeleteConfirmOpened(true)}
        size="small"
        severity="danger"
      />
    </span>
  );
};
