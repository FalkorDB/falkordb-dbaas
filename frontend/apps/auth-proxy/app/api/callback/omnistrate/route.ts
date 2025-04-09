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

  if (payload.Service !== 'FalkorDB' && payload.service_name !== 'FalkorDB') {
    console.log(`Ignoring event for service ${payload.Service}`);
    return NextResponse.json({}, { status: 200 });
  }

  switch (eventType) {
    case "UserSubscription":
      return subscriptionCreatedHandler({
        orgName: payload.subscription_id,
        id: payload.user_id,
        email: payload.user_email,
      });
    case 'UserUnsubscribed':
      return subscriptionDeletedHandler({
        orgName: payload.subscription_id
      });
    case 'UserSubscriptionInvite':
      return userCreatedHandler({
        orgName: payload.subscription_id,
        email: payload.user_email,
        id: payload.user_id
      });
    case 'UserSubscriptionRevoked':
      return userDeletedHandler({
        orgName: payload.subscription_id,
        id: payload.user_id
      });
    case 'SuccessfulDeployment':
      return instanceCreatedHandler({
        orgName: payload.subscription_id,
        folderName: payload.instance_id,
      });
    case 'SuccessfulDelete':
      return instanceDeletedHandler({
        orgName: payload.subscription_id,
        folderName: payload.instance_id,
      });
  }

  return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
}