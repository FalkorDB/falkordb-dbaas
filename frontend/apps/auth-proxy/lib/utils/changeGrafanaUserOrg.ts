
import { Client } from '../types/grafana-api';

export async function changeUserCurrentOrg(client: Client, userEmail: string, orgID: number) {
  try {
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
