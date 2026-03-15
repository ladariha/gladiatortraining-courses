import { RestRoutes, getDefaultHeaders } from "../rest";
import { useAsyncActionTracker } from "./useAsyncActionTracker";
import { RegistrationEvent, RegistrationTemplate } from "../types";
import { getIBAN } from "../bankUtils";

export type EventFormData = Omit<RegistrationEvent, "registrations"> & {
  registrations: RegistrationTemplate[];
};

export const useSubmitEvent = (isCreate = true) => {
  const {
    isLoading: isSubmitting,
    execute: submit,
    data: eventId,
    error,
  } = useAsyncActionTracker<number, { payload: EventFormData; editorBlocks: string }>(async ({ payload, editorBlocks }) => {
    const response = await fetch(isCreate ? `${RestRoutes.events}` : `${RestRoutes.event}/${payload.id}`, {
      method: isCreate ? "POST" : "PUT",
      headers: { ...getDefaultHeaders(), "content-type": "application/json" },
      body: JSON.stringify({
        ...payload,
        description: editorBlocks,
        iban: getIBAN({
          accountNumber: payload.account_number,
          bankCode: payload.bank_code,
          accountPrefix: payload.prefix || "",
        }),
        registrations: JSON.stringify(payload.registrations),
      }),
    });
    if (response.ok) {
      const json = await response.json();
      return json.id as number;
    }
    const err = response.statusText;
    throw new Error(`Oops, ${err}`);
  });

  return { submit, isSubmitting, error, eventId };
};
