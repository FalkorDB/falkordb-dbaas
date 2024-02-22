locals {
  quotas = nonsensitive(toset(flatten([
    for project in var.monitored_projects : [
      {
        project_id   = project
        quota_metric = "compute.googleapis.com/cpus_all_regions"
        limit_name   = "CPUS-ALL-REGIONS-per-project",
        threshold    = "0.75"
      },
      {
        project_id   = project
        quota_metric = "compute.googleapis.com/ssd_total_storage"
        limit_name   = "SSD-TOTAL-GB-per-project-region",
        threshold    = "0.75"
      },
      {
        project_id   = project
        quota_metric = "compute.googleapis.com/global_in_use_addresses"
        limit_name   = "IN-USE-ADDRESSES-per-project-region",
        threshold    = "0.75"
      },
    ]
  ])))
}

resource "google_monitoring_alert_policy" "policies" {
  for_each = {
    for quota in local.quotas : "${quota.project_id}-${quota.limit_name}" => quota
  }

  project      = var.project_id
  display_name = "Quota threshold exceeded - ${each.value.project_id} - ${each.value.limit_name}"
  combiner     = "OR"
  conditions {
    display_name = "Quota threshold exceeded - ${each.value.project_id} - ${each.value.limit_name}"
    condition_monitoring_query_language {
      query    = <<EOT
fetch consumer_quota
| filter resource.project_id=='${each.value.project_id}'
| { metric serviceruntime.googleapis.com/quota/allocation/usage
    | filter metric.quota_metric=='${each.value.quota_metric}'
    | map add [metric.limit_name: '${each.value.limit_name}']
    | align next_older(1d)
    | group_by [resource.project_id,resource.service,metric.quota_metric,metric.limit_name]
        ,.max
        ; metric serviceruntime.googleapis.com/quota/limit
    | filter metric.quota_metric=='${each.value.quota_metric}'&&metric.limit_name=='${each.value.limit_name}'
    | align next_older(1d)
    | group_by [resource.project_id,resource.service,metric.quota_metric,metric.limit_name]
        ,.min
  }
| ratio
| every 30s
|condition gt(val(), 0.8 '1')
EOT
      duration = "60s"
    }
  }

  notification_channels = [
    for email in var.email_addresses : google_monitoring_notification_channel.basic[email].id
  ]
}

resource "google_monitoring_notification_channel" "basic" {
  for_each = {
    for email in var.email_addresses : email => email
  }
  project      = var.project_id
  display_name = "Quota threshold exceeded - ${each.value}"
  type         = "email"
  labels = {
    email_address = "${each.value}"
  }
  force_delete = true
}
