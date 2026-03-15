import React from "react";
import { ToastMessage } from "primereact/toast";

export const ToastContext = React.createContext<{
  showMessage: (message: ToastMessage) => void;
}>({
  showMessage: () => {},
});
