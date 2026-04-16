# Google Workflows: alert-reaction automation.
#
# Workflow: falkordb-instance-memory-threshold-exceeded
#   Triggered by Alertmanager when a FalkorDB instance exceeds its memory
#   threshold. Steps:
#     1. Parse instanceId + threshold from the alert payload
#     2. Fetch Omnistrate credentials from Secret Manager
#     3. Authenticate to Omnistrate API and get the subscription
#     4. Retrieve the list of users for that subscription
#     5. Fetch the Brevo transactional email API key from Secret Manager
#     6. Send a templated email to each affected user via Brevo
#
# Required secrets (in Secret Manager of var.project_id):
#   OMNISTRATE_EMAIL, OMNISTRATE_PASSWORD — service account for Omnistrate API
#   BREVO_API_KEY                         — Brevo transactional email API key

resource "google_workflows_workflow" "memory_threshold_exceeded" {
  name        = "falkordb-instance-memory-threshold-exceeded"
  description = "Workflow to handle memory threshold exceeded alerts from GKE"
  project     = var.project_id
  region      = var.region

  service_account = google_service_account.alert_reaction_actions.email

  source_contents = <<-EOF
main:
  params: [args]
  steps:
    # 1. Extract instanceId from the incoming Pub/Sub message
    - extract_instance_id:
        assign:
          - instance_id: $${args.labels.namespace}
          - threshold: $${args.annotations.threshold}

    # 2. Retrieve credentials from Secret Manager
    - retrieve_email:
        call: googleapis.secretmanager.v1.projects.secrets.versions.accessString
        args:
          project_id: ${var.project_id}
          secret_id: OMNISTRATE_EMAIL
        result: email_secret
    - retrieve_password:
        call: googleapis.secretmanager.v1.projects.secrets.versions.accessString
        args:
          project_id: ${var.project_id}
          secret_id: OMNISTRATE_PASSWORD
        result: password_secret

    # 3. Call Auth API to retrieve the JWT
    - authenticate_api:
        call: http.post
        args:
          url: "https://api.omnistrate.cloud/2022-09-01-00/signin"
          body:
            email: $${email_secret}
            password: $${password_secret}
          headers:
            Content-Type: "application/json"
        result: auth_response
    - extract_jwt:
        assign:
          - jwt_token: $${auth_response.body.jwtToken}
          - auth_header: $${"Bearer " + jwt_token}

    # 4. Get instance details and subscriptionId
    - get_subscription_id:
        call: http.get
        args:
          url: $${"https://api.omnistrate.cloud/2022-09-01-00/fleet/service/${var.omnistrate_service_id}/environment/${var.omnistrate_environment_id}/instance/" + instance_id}
          headers:
            Authorization: $${auth_header}
        result: instance_details_response
    - extract_subscription_id:
        assign:
          - subscription_id: $${instance_details_response.body.subscriptionId}

    # 5. Get list of users
    - get_users_list:
        call: http.get
        args:
          url: $${"https://api.omnistrate.cloud/2022-09-01-00/fleet/service/${var.omnistrate_service_id}/environment/${var.omnistrate_environment_id}/users?subscriptionId=" + subscription_id}
          headers:
            Authorization: $${auth_header}
        result: users_response
    - extract_users_emails:
        assign:
          - users: $${users_response.body.users}

    # 6. Retrieve Brevo API Key from Secret Manager
    - retrieve_brevo_key:
        call: googleapis.secretmanager.v1.projects.secrets.versions.accessString
        args:
          project_id: ${var.project_id}
          secret_id: BREVO_API_KEY
        result: brevo_secret

    # 7. Iterate through users and send email via Brevo
    - send_emails_to_users:
        for:
          value: user
          in: $${users}
          steps:
            - call_brevo_api:
                call: http.post
                args:
                  url: "https://api.brevo.com/v3/smtp/email"
                  headers:
                    Content-Type: "application/json"
                    # Brevo uses the 'api-key' header for authentication
                    api-key: $${brevo_secret}
                  body:
                    # Sender details (must be a verified Brevo sender)
                    sender:
                      name: "FalkorDB Cloud"
                      email: "no-reply@falkordb.cloud"
                    # Recipient details
                    to:
                      - email: $${user.email}
                    templateId: 1
                    params:
                      instance_id: $${instance_id}
                      threshold: $${threshold}
                result: brevo_call_result

    - final_success:
        return: "Alert processed successfully for instance: $${instance_id}"
EOF

}

resource "google_project_iam_member" "invoker" {
  project = var.project_id
  role    = "roles/workflows.invoker"
  member  = "serviceAccount:${google_service_account.alert_reaction_actions.email}"
}
