import { RestRoutes, getDefaultHeaders } from "../rest";
import { useAsyncActionTracker } from "./useAsyncActionTracker";
import { RegistrationEvent, RegistrationTemplate } from "../types";

export type EventFormData = Omit<RegistrationEvent, "registrations"> & {
  registrations: RegistrationTemplate[];
};

export const useSetApiKey = () => {
  const {
    isLoading: isSubmitting,
    execute: submit,
    data: isCreated,
    error,
  } = useAsyncActionTracker<boolean, { name: string; value: string }>(async (payload) => {
    const response = await fetch(RestRoutes.keys, {
      method: "PUT",
      headers: { ...getDefaultHeaders(), "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      return true;
    }
    const err = response.statusText;
    throw new Error(`Oops, ${err}`);
  });

  return { submit, isSubmitting, error, isCreated };
};
