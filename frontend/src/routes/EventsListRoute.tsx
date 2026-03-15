import { DataView } from "primereact/dataview";
import { useFetchEvents } from "../hooks/useFetchEvents";
import { Message } from "primereact/message";
import { errors, empty, admin, common } from "../messages";
import { RegistrationEvent } from "../types";
import { Button } from "primereact/button";
import { timestampToDate } from "../utils";
import React from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";
import { SelectButton } from "primereact/selectbutton";
import { SelectItem, SelectItemOptionsType } from "primereact/selectitem";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { EventAdminActions } from "../components/EventAdminActions";
import { EmptyMessage } from "../components/EmptyMessage";
import { Sidebar } from "primereact/sidebar";
import { AdminLogs } from "../components/AdminLogs";
import { Menu } from "primereact/menu";
import { AdminApiKeys } from "../components/AdminApiKeys";
import { Spinner } from "../components/Spinner";

const EventsDataView = () => {
  const { isLoading, events, error } = useFetchEvents();
  const navigate = useNavigate();

  const EventListItem2 = (event: RegistrationEvent) => {
    return (
      <div className="col-12 sm:col-12 lg:col-4 p-2 flex flex-column">
        <div style={{ flexGrow: 1000 }}>
          <a href={`#/events/${event.id}`}>
            <img
              src={event.image}
              className="card-image"
            />
          </a>
        </div>
        <div
          className="bottom-card"
          onClick={() => {
            navigate(`/events/${event.id}`);
          }}
        >
          <h5 className="">
            <a href={`#/events/${event.id}`}>{event.name}</a>
          </h5>
          <div className="card-footer">
            <div className="flex align-items-center gap-3">
              <span className="flex align-items-center gap-2">
                <i className="pi pi-calendar" />
                <span>{timestampToDate(event.time)}</span>
              </span>
              <div className="flex align-items-center gap-3">
                <span className="flex align-items-center gap-2">
                  <i className="pi pi-users" />
                  <span>
                    {common.registered} {event.people}/{event.max_people}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {isLoading && <Spinner />}
      {!isLoading && error && (
        <Message
          severity="error"
          text={errors.events}
        />
      )}
      {!isLoading && !error && events && events.length === 0 && <EmptyMessage msg={empty.events} />}
      {!isLoading && !error && events && events.length > 0 && (
        <div className="card">
          <DataView
            value={events}
            paginator={true}
            rows={15}
            layout="grid"
            emptyMessage={empty.events}
            itemTemplate={EventListItem2}
          />
        </div>
      )}
    </>
  );
};

const EventsTableView = () => {
  const { isLoading, events, error, refresh } = useFetchEvents(1000);

  const eventDate = React.useCallback((e: RegistrationEvent) => timestampToDate(e.time), []);
  const people = React.useCallback((e: RegistrationEvent) => `${e.people}/${e.max_people}`, []);
  const adminButtons = (e: RegistrationEvent) => (
    <EventAdminActions
      event={e}
      isEventPage={false}
      refresh={refresh}
    />
  );
  const navigate = useNavigate();

  const openEvent = React.useCallback(
    (id: number) => {
      navigate(`/events/${id}`);
    },
    [navigate]
  );

  const name = React.useCallback(
    (e: RegistrationEvent) => (
      <div
        className="hover:underline cursor-pointer hover:text-blue-600"
        onClick={() => openEvent(e.id)}
      >
        {e.name}
      </div>
    ),
    [openEvent]
  );

  return (
    <>
      {isLoading && <Spinner />}
      {!isLoading && error && (
        <Message
          severity="error"
          text={errors.events}
        />
      )}
      {!isLoading && !error && events && events.length === 0 && <EmptyMessage msg={empty.events} />}
      {!isLoading && !error && events && events.length > 0 && (
        <DataTable
          value={events}
          paginator={true}
          dataKey="id"
          rows={10}
          size="small"
          emptyMessage={common.noEvents}
          className="mt-3"
          tableStyle={{ minWidth: "90vw" }}
        >
          <Column
            field="id"
            header="ID"
            style={{ width: "5%" }}
          />
          <Column
            field="name"
            body={name}
            header={common.name}
            style={{ width: "25%" }}
          />
          <Column
            body={eventDate}
            header={common.date}
            style={{ width: "25%" }}
          />
          <Column
            header={common.registered}
            body={people}
            style={{ width: "25%" }}
          />
          <Column
            body={adminButtons}
            header={common.actions}
            style={{ width: "25%" }}
          />
        </DataTable>
      )}
    </>
  );
};

enum ViewMode {
  List,
  Table,
}

export const EventsListRoute: React.FC<{}> = () => {
  const options: SelectItemOptionsType = [
    {
      value: ViewMode.List,
      label: admin.viewList,
    },
    {
      value: ViewMode.Table,
      label: admin.viewTable,
    },
  ];
  const [viewMode, setViewMode] = React.useState<SelectItem>(options[0]);
  const [isAdminLogsVisible, setIsAdminLogsVisible] = React.useState<boolean>(false);
  const [isAdminApiKeysVisible, setIsAdminApiKeysVisible] = React.useState<boolean>(false);
  const showLogs = () => {
    setIsAdminLogsVisible(true);
  };
  const showApiKeys = () => {
    setIsAdminApiKeysVisible(true);
  };
  // eslint-disable-next-line no-null/no-null
  const menuRef = React.useRef<Menu>(null);
  const items = [
    {
      items: [
        {
          label: admin.logs,
          command: () => {
            showLogs();
          },
        },
        {
          label: admin.apiKeys,
          command: () => {
            showApiKeys();
          },
        },
      ],
    },
  ];

  const navigate = useNavigate();

  const newEvent = () => {
    navigate("newEvent");
  };

  const { canUserManageEvents } = usePermissions();
  if (!canUserManageEvents()) {
    return <EventsDataView />;
  }

  return (
    <React.StrictMode>
      <div className="flex flex-row justify-content-between">
        <Button
          label={common.new}
          size="small"
          onClick={newEvent}
        />
        <Button
          icon="pi pi-cog"
          onClick={(event) => menuRef.current?.toggle(event)}
          aria-controls="popup_menu_left"
          aria-haspopup={true}
        />

        <Menu
          model={items}
          popup={true}
          ref={menuRef}
          id="popup_menu_left"
        />

        <SelectButton
          value={viewMode.value}
          onChange={(e) => {
            // eslint-disable-next-line no-null/no-null
            if (e?.value !== undefined && e?.value !== null) {
              setViewMode(options[e.value]);
            }
          }}
          options={options}
        />
      </div>
      <div className="events">
        {viewMode.value === ViewMode.List && <EventsDataView />}
        {viewMode.value === ViewMode.Table && <EventsTableView />}
      </div>
      <Sidebar
        visible={isAdminLogsVisible}
        onHide={() => setIsAdminLogsVisible(false)}
        position="right"
        className="w-full md:w-12 lg:w-8"
      >
        <AdminLogs />
      </Sidebar>
      <Sidebar
        visible={isAdminApiKeysVisible}
        onHide={() => setIsAdminApiKeysVisible(false)}
        position="right"
        className="w-full md:w-12 lg:w-8"
      >
        <AdminApiKeys close={() => setIsAdminApiKeysVisible(false)} />
      </Sidebar>
    </React.StrictMode>
  );
};
