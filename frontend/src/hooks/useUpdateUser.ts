import { DataTableRowEditCompleteEvent } from "primereact/datatable";
import React from "react";
import { RestRoutes, getDefaultHeaders } from "../rest";
import { ToastContext } from "../context/ToastContext";
import { admin, common, errors, formError } from "../messages";
import { isValidDate, isValidEmail, isValidPhone, isValidString } from "../utils";

type Payload = {
  name: string;
  last_name: string;
  email: string;
  date_of_birth: number;
  address: string;
  club: string;
  phone: string;
  sex: string;
};

const validateForm = (data: Record<string, string | undefined>, dateOfBirth: number) => {
  const errorFields: string[] = [];
  if (!isValidString(data.name)) {
    errorFields.push(common.firstName);
  }
  if (!isValidString(data.last_name)) {
    errorFields.push(common.lastName);
  }
  if (!isValidString(data.address)) {
    errorFields.push(common.address);
  }
  if (!isValidEmail(data.email)) {
    errorFields.push(common.email);
  }
  if (!isValidPhone(data.phone)) {
    errorFields.push(common.phone);
  }
  if (!isValidDate(dateOfBirth)) {
    errorFields.push(common.birthDate);
  }
  if (errorFields.length > 0) {
    return `${formError.fields} ${errorFields.join(", ")}`;
  }

  return undefined;
};

export const useUpdateUser = () => {
  const { showMessage } = React.useContext(ToastContext);

  const updateUser = React.useCallback(
    async (event: DataTableRowEditCompleteEvent, userId: number, dateOfBirth: number) => {
      const validationResult = validateForm(event.newData, dateOfBirth);
      if (validationResult) {
        showMessage({
          severity: "error",
          summary: common.wrongData,
          detail: validationResult,
        });
      }

      try {
        const payload: Payload = {
          address: event.newData.address,
          last_name: event.newData.last_name,
          name: event.newData.name,
          sex: event.newData.sex,
          phone: event.newData.phone,
          email: event.newData.email,
          date_of_birth: dateOfBirth,
          club: event.newData.club,
        };

        const response = await fetch(`${RestRoutes.registeredUser}/${userId}`, {
          method: "PUT",
          headers: getDefaultHeaders(),
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error("Oops");
        }
        showMessage({
          severity: "success",
          summary: admin.userUpdated,
        });
      } catch (e) {
        showMessage({
          severity: "error",
          summary: common.error,
          detail: errors.load,
        });
      }
    },
    [showMessage]
  );

  return { updateUser };
};
