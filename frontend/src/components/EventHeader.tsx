import React from "react";
import { RegistrationEvent, RegistrationTemplate } from "../types";
import { isPastDate, timestampToDate } from "../utils";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";
import { common, event as eventMsg, admin } from "../messages";
import { Button } from "primereact/button";
import { EventAdminActions } from "./EventAdminActions";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { Tag } from "primereact/tag";
import { RegisterSidebar } from "./RegisterSidebar";
import { ToastContext } from "../context/ToastContext";

const getRegisterButtonLabel = (isRegistrationEnded: boolean, isFull: boolean) => {
  if (isRegistrationEnded) {
    return eventMsg.pastRegistration;
  }

  if (isFull) {
    return eventMsg.fullRegistration;
  }

  return eventMsg.register;
};

export const EventHeader: React.FC<{
  event: RegistrationEvent;
  isDetailView?: boolean;
  refresh: () => void;
}> = ({ event, isDetailView, refresh }) => {
  const isRegistrationEnded = isPastDate(event.registration_end);
  const isFull = event.people >= event.max_people;
  const isRegistrationEnabled = !isRegistrationEnded && event.visible && !isFull;
  const buttonLbl = getRegisterButtonLabel(isRegistrationEnded, isFull);
  const navigate = useNavigate();
  const { canUserManageEvents } = usePermissions();

  const [sidebarRegistration, setSidebarRegistration] = React.useState<RegistrationTemplate>();

  const registrationsData = React.useMemo<RegistrationTemplate[]>(() => {
    if (!event.registrations || event.registrations.length < 2) {
      return [];
    }
    let options: RegistrationTemplate[];
    try {
      options = JSON.parse(event.registrations) as RegistrationTemplate[];
    } catch (_e) {
      options = [];
    }
    return options;
  }, [event]);

  const registrations = React.useMemo<MenuItem[]>(() => {
    const spaceLeft = event.max_people - event.people;
    return registrationsData
      .filter((o) => {
        if (spaceLeft < o.number_of_people) {
          return false;
        }
        return true;
      })
      .map((o) => ({
        label: `${o.name} (${o.price} Kč)`,
        command: () => {
          setSidebarRegistration(o);
        },
      }));
  }, [registrationsData, event]);

  const openEvent = React.useCallback(() => {
    navigate(`/events/${event.id}`);
  }, [event, navigate]);

  // eslint-disable-next-line no-null/no-null
  const menuRef = React.useRef<Menu>(null);

  const { showMessage } = React.useContext(ToastContext);
  const showConfirmation = () => {
    showMessage({
      severity: "info",
      summary: common.done,
      detail: common.regDone,
    });
  };

  return (
    <>
      {sidebarRegistration && (
        <RegisterSidebar
          registrationType={sidebarRegistration}
          event={event}
          onHide={(success: boolean) => {
            setSidebarRegistration(undefined);
            if (success) {
              showConfirmation();
              refresh();
            }
          }}
        />
      )}

      <div className={`flex flex-column sm:flex-row justify-content-between ${isDetailView ? "align-items-center" : "align-items-end"}  flex-1 gap-4`}>
        <div className="flex flex-column align-items-center sm:align-items-start gap-3">
          {isDetailView && (
            <div className="flex align-items-center">
              <a
                className="back-link mr-2"
                href="#/"
              >
                <i className="pi pi-arrow-left" />
                &nbsp;
                {common.back}
              </a>
              <h1>{event.name} </h1>
              {canUserManageEvents() && (
                <div style={{ marginBottom: "10px !important" }}>
                  <Tag
                    className="ml-2"
                    severity={event.visible ? "success" : "warning"}
                    value={event.visible ? admin.visible : admin.notVisible}
                  />
                </div>
              )}
            </div>
          )}
          {!isDetailView && (
            <div className="flex align-items-center">
              <div
                className="text-2xl font-bold text-900 hover:underline cursor-pointer hover:text-blue-600"
                onClick={openEvent}
              >
                {event.name}
              </div>
              {canUserManageEvents() && (
                <Tag
                  className="ml-2"
                  severity={event.visible ? "success" : "warning"}
                  value={event.visible ? admin.visible : admin.notVisible}
                />
              )}
            </div>
          )}
          {!isDetailView && <div className="text-sm">{event.short_description}</div>}
          <div className="flex align-items-center gap-3">
            <span className="flex align-items-center gap-2">
              <i className="pi pi-calendar" />
              <span className="font-semibold">{timestampToDate(event.time)}</span>
            </span>

            <span className="text-red-600">
              {eventMsg.closedRegistration}:&nbsp;
              {timestampToDate(event.registration_end)}
            </span>
          </div>
          {isDetailView && (
            <div className="flex align-items-center gap-3">
              <span className="flex align-items-center gap-2">
                <i className="pi pi-users" />
                <span className="font-semibold">
                  {common.registered} {event.people}/{event.max_people}
                </span>
              </span>
            </div>
          )}
        </div>
        <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
          {!isDetailView && (
            <span className="text-xl font-semibold">
              <span className="flex align-items-center gap-2">
                <i className="pi pi-user" />
                <span className="font-semibold">
                  {event.people} / {event.max_people}
                </span>
              </span>
            </span>
          )}
          {canUserManageEvents() && (
            <EventAdminActions
              isEventPage={!!isDetailView}
              refresh={refresh}
              event={event}
            />
          )}
          {(registrations.length === 1 || event.visible === 0 || isRegistrationEnded || isFull) && (
            <Button
              label={`${buttonLbl} (${registrationsData[0].price} Kč)`}
              icon="pi pi-shopping-cart"
              onClick={() => setSidebarRegistration(registrationsData[0])}
              disabled={!isRegistrationEnabled}
            />
          )}
          {registrations.length > 1 && isRegistrationEnabled && (
            <>
              <Menu
                className="regMenu"
                model={registrations}
                popup={true}
                ref={menuRef}
                id="popup_menu_right"
                popupAlignment="right"
              />
              <Button
                label={buttonLbl}
                icon="pi pi-shopping-cart"
                className="mr-2"
                onClick={(e) => menuRef.current?.toggle(e)}
                aria-controls="popup_menu_right"
                aria-haspopup={true}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};
