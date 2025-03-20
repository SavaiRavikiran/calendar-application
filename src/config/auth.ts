export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: [
    "User.Read",
    "Calendars.ReadWrite",
    "Calendars.Read",
    "Calendars.Read.Shared",
    "Calendars.ReadWrite.Shared",
    "Mail.Read",
    "Mail.ReadWrite"
  ]
};

export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  graphCalendarEndpoint: "https://graph.microsoft.com/v1.0/me/events"
};