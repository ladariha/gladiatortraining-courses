import { HashRouter, Route, Routes } from "react-router-dom";
import { EventsListRoute } from "./routes/EventsListRoute";
import { useWhoAmI } from "./hooks/useWhoAmI";
import { UserContext } from "./context/UserContext";
import { UserRole } from "./types";
import React from "react";
import { PrimeReactProvider } from "primereact/api";
import { errors } from "./messages";
import { Message } from "primereact/message";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import { EventRoute } from "./routes/EventRoute";
import { NewEventRoute } from "./routes/NewEventRoute";
import { EditEventRoute } from "./routes/EditEventRoute";
import { Toast, ToastMessage } from "primereact/toast";
import { ToastContext } from "./context/ToastContext";
import { Spinner } from "./components/Spinner";

export const App = () => {
  const { role: whoAmIRole, isLoading, error } = useWhoAmI();

  const [role, setRole] = React.useState<UserRole | undefined>(UserRole.Visitor);

  const [msg, setMsg] = React.useState<ToastMessage>();

  // eslint-disable-next-line no-null/no-null
  const toast = React.useRef<Toast>(null);

  React.useEffect(() => {
    setRole(whoAmIRole);
  }, [whoAmIRole]);

  React.useEffect(() => {
    if (msg) {
      toast.current?.show(msg);
    }
  }, [msg]);

  return (
    <PrimeReactProvider>
      <Toast ref={toast} />
      <ToastContext.Provider value={{ showMessage: setMsg }}>
        <UserContext.Provider value={{ role, setRole }}>
          {isLoading && <Spinner />}
          {!isLoading && error && (
            <Message
              severity="error"
              text={errors.load}
            />
          )}
          {!isLoading && !error && (
            <HashRouter>
              <Routes>
                <Route
                  path="/"
                  Component={EventsListRoute}
                />
                <Route
                  path="/events/:id/edit"
                  Component={EditEventRoute}
                />
                <Route
                  path="/events/:id"
                  Component={EventRoute}
                />
                <Route
                  path="/newEvent"
                  Component={NewEventRoute}
                />
              </Routes>
            </HashRouter>
          )}
        </UserContext.Provider>
      </ToastContext.Provider>
    </PrimeReactProvider>
  );
};
