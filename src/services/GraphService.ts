import { Client } from "@microsoft/microsoft-graph-client";
import { AuthCodeMSALBrowserAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser";
import { PublicClientApplication, AccountInfo } from "@azure/msal-browser";
import { Event } from "../types/calendar";
import { loginRequest } from "../config/auth";

export class GraphService {
  private client: Client;
  private pca: PublicClientApplication;
  private account: AccountInfo;
  private pollingInterval: number | null = null;

  constructor(pca: PublicClientApplication, account: AccountInfo) {
    this.pca = pca;
    this.account = account;
    const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(pca, {
      account: account,
      scopes: loginRequest.scopes,
      interactionType: "popup"
    });

    this.client = Client.initWithMiddleware({
      authProvider: authProvider,
    });
  }

  private async ensureAccess() {
    try {
      await this.pca.acquireTokenSilent({
        ...loginRequest,
        account: this.account
      });
    } catch (error) {
      console.log("Silent token acquisition failed, acquiring token using popup");
      await this.pca.acquireTokenPopup(loginRequest);
    }
  }

  startPolling(callback: (events: Event[]) => void) {
    if (this.pollingInterval) return;
    
    const poll = async () => {
      try {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        
        const events = await this.getEvents(startDate, endDate);
        callback(events);
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    poll(); // Initial fetch
    this.pollingInterval = window.setInterval(poll, 5000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  async getEvents(startDate: Date, endDate: Date): Promise<Event[]> {
    try {
      await this.ensureAccess();
      
      const response = await this.client
        .api("/me/calendarview")
        .query({
          startDateTime: startDate.toISOString(),
          endDateTime: endDate.toISOString(),
          $top: 100
        })
        .select("id,subject,start,end,location,attendees,bodyPreview")
        .orderby("start/dateTime")
        .get();

      return response.value.map((event: any) => ({
        id: event.id,
        title: event.subject,
        start: new Date(event.start.dateTime + 'Z'),
        end: new Date(event.end.dateTime + 'Z'),
        type: "meeting",
        location: event.location?.displayName,
        description: event.bodyPreview,
        participants: event.attendees?.map((a: any) => a.emailAddress.address) || [],
      }));
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  }

  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    try {
      await this.ensureAccess();

      const eventData = {
        subject: event.title,
        start: {
          dateTime: event.start.toISOString().split('.')[0],
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: event.end.toISOString().split('.')[0],
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        location: event.location ? {
          displayName: event.location,
        } : undefined,
        body: {
          contentType: "text",
          content: event.description || "",
        },
        attendees: event.participants?.map((email) => ({
          emailAddress: {
            address: email,
          },
          type: "required",
        })) || [],
      };

      const response = await this.client
        .api("/me/events")
        .post(eventData);

      return {
        id: response.id,
        title: response.subject,
        start: new Date(response.start.dateTime + 'Z'),
        end: new Date(response.end.dateTime + 'Z'),
        type: event.type,
        location: response.location?.displayName,
        description: response.bodyPreview,
        participants: response.attendees?.map((a: any) => a.emailAddress.address) || [],
      };
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  async updateEvent(event: Event): Promise<Event> {
    try {
      await this.ensureAccess();

      const eventData = {
        subject: event.title,
        start: {
          dateTime: event.start.toISOString().split('.')[0],
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: event.end.toISOString().split('.')[0],
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        location: event.location ? {
          displayName: event.location,
        } : undefined,
        body: {
          contentType: "text",
          content: event.description || "",
        },
        attendees: event.participants?.map((email) => ({
          emailAddress: {
            address: email,
          },
          type: "required",
        })) || [],
      };

      await this.client
        .api(`/me/events/${event.id}`)
        .update(eventData);

      return event;
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.ensureAccess();
      await this.client
        .api(`/me/events/${eventId}`)
        .delete();
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  }
}