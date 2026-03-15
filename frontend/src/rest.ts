const BASE = `${window.GladiatortrainingRegistrations.baseUrl}/?rest_route=/gtevents/v1/`;

export const RestRoutes = {
  whoAmI: `${BASE}user`,
  registeredUser: `${BASE}registeredUser`,
  keys: `${BASE}keys`,
  mail: `${BASE}mail`,
  events: `${BASE}events`,
  registrations: `${BASE}registrations`,
  registrationGroup: `${BASE}registrationGroup`,
  event: `${BASE}event`,
  logs: `${BASE}errors`,
};

declare global {
  interface Window {
    GladiatortrainingRegistrations: {
      nonce: string;
      baseUrl: string;
    };
  }
}

export const getDefaultHeaders = (): Record<string, string> => {
  const settings = window.GladiatortrainingRegistrations;
  if (settings) {
    return {
      "X-WP-Nonce": settings?.nonce || "",
    };
  }
  return {};
};
