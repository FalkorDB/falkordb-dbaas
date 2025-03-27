import { NextRequest, NextResponse } from "next/server";
import { instanceCreatedHandler } from '../../../../lib/handlers/instanceCreated'
import { instanceDeletedHandler } from '../../../../lib/handlers/instanceDeleted'
import { subscriptionCreatedHandler } from '../../../../lib/handlers/subscriptionCreated'
import { subscriptionDeletedHandler } from '../../../../lib/handlers/subscriptionDeleted'
import { userCreatedHandler } from '../../../../lib/handlers/userCreated'
import { userDeletedHandler } from '../../../../lib/handlers/userDeleted'

export const POST = async (req: NextRequest) => {

  const token = req.headers.get("Authorization");
  if (!token || token !== process.env.GRAFANA_WEBHOOK_API_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventType, payload } = await req.json();

  console.log(`Received event of type ${eventType} with payload:`, payload);


  switch (eventType) {
    case "UserSubscription":
      return subscriptionCreatedHandler(payload);
    case 'UserUnsubscribed':
      return subscriptionDeletedHandler(payload);
    case 'UserSubscriptionInvite':
      return userCreatedHandler(payload);
    case 'UserSubscriptionRevoked':
      return userDeletedHandler(payload);
    case 'SuccessfulDeployment':
      return instanceCreatedHandler(payload);
    case 'SuccessfulDelete':
      return instanceDeletedHandler(payload);
  }

  return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
}