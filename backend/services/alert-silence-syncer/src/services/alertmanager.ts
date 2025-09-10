import { ALERTMANAGER_URL } from "../constants";
import { AlertmanagerSilence } from "../types";


export async function fetchActiveSilences(): Promise<AlertmanagerSilence[]> {
  try {
    console.log(`[${new Date().toISOString()}] Fetching active silences from Alertmanager...`);
    const response = await fetch(`${ALERTMANAGER_URL}/api/v2/silences`);
    if (!response.ok) {
      console.error(`Error fetching silences: ${response.statusText}`);
      return [];
    }
    const silences: AlertmanagerSilence[] = await response.json();
    return silences.filter(s => s.status.state === 'active');
  } catch (error) {
    console.error('Failed to connect to Alertmanager:', error);
    return [];
  }
}
