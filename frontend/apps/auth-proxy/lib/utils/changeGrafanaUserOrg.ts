import { Document, OpenAPIClientAxios } from "openapi-client-axios";
import grafanaApi from '../openapi/grafana-api.json';
import { Client } from '../types/grafana-api';

export async function changeUserCurrentOrg(userEmail: string, orgID: string) {
  try {
    let client: Client;
    try {
      const api = new OpenAPIClientAxios({
        definition: grafanaApi as unknown as Document,
        axiosConfigDefaults: {
          baseURL: process.env.INTERNAL_GRAFANA_URL,
          auth: {
            username: process.env.GRAFANA_SA_USERNAME ?? "",
            password: process.env.GRAFANA_SA_PASSWORD ?? "",
          },
        },
      });
      client = await api.init<Client>();
    } catch (error) {
      console.error("failed to initialize client", error);
      throw error;
    }

    let userId: number | undefined;
    try {
      const user = await client.getUserByLoginOrEmail(userEmail);
      userId = user.data.id;
    } catch (error) {
      console.error("failed to get user by email", userEmail, error);
      throw error;
    }

    if (!userId) {
      throw new Error("User ID not found for email: " + userEmail);
    }

    try {
      await client.post(`/users/${userId}/using/${orgID}`);
    } catch (error) {
      console.error("failed to change current org for user %s to org %s", userId, orgID);
      throw error;
    }

  } catch (error) {
    console.error("Error changing user organization", error);
  }
}
