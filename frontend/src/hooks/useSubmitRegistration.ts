import { RestRoutes, getDefaultHeaders } from "../rest";
import { useAsyncActionTracker } from "./useAsyncActionTracker";

export type RegistrationTemplate = {
  gdpr: number;
  date_of_birth?: number;
  name: string;
  last_name: string;
  email?: string;
  address?: string;
  phone?: string;
  sex?: string;
};

export type RegisterFormData = {
  registrations: RegistrationTemplate[];
  registration_type_name: string;
  club: string;
};

export const useSubmitRegistration = () => {
  const {
    isLoading: isSubmitting,
    execute: submit,
    error,
  } = useAsyncActionTracker<boolean, { payload: RegisterFormData; eventId: number }>(async ({ payload, eventId }) => {
    const response = await fetch(`${RestRoutes.registrations}/${eventId}`, {
      method: "POST",
      headers: { ...getDefaultHeaders(), "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      return true;
    }
    const err = response.statusText;
    throw new Error(`Oops, ${err}`);
  });

  return { submit, isSubmitting, error };
};
