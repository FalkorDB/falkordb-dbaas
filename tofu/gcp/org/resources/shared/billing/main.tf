module "project" {
  source  = "terraform-google-modules/project-factory/google"
  version = "~> 14.4.0"

  project_id      = var.project_id
  name            = var.project_name
  folder_id       = var.project_parent_id
  org_id          = var.org_id
  billing_account = var.billing_account_id
  lien            = true

  create_project_sa = false

  activate_apis = [
    "iam.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "servicemanagement.googleapis.com",
    "serviceusage.googleapis.com",
    "storage.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "bigquery.googleapis.com",
  ]
}

# Create BigQuery Dataset for billing export
resource "google_bigquery_dataset" "billing_dataset" {
  dataset_id = "billing_export"
  project    = module.project.project_id
  location   = "EU"
}

# Configure billing account sink
resource "google_logging_billing_account_sink" "billing_sink" {
  name            = "billing-export"
  billing_account = var.billing_account_id
  destination     = "bigquery.googleapis.com/projects/${module.project.project_id}/datasets/${google_bigquery_dataset.billing_dataset.dataset_id}"

  bigquery_options {
    use_partitioned_tables = true
  }
}

resource "google_bigquery_dataset_iam_member" "log_writer" {
  project    = module.project.project_id
  dataset_id = google_bigquery_dataset.billing_dataset.dataset_id
  role       = "roles/bigquery.dataEditor"
  member     = google_logging_billing_account_sink.billing_sink.writer_identity
}

data "google_billing_account" "billing_account" {
  billing_account = var.billing_account_id
}

locals {
  budgets = var.budgets
}
# Define budgets
resource "google_billing_budget" "budgets" {
  for_each = local.budgets

  billing_account = var.billing_account_id
  display_name    = each.value.name

  dynamic "amount" {
    for_each = each.value.amounts
    content {
      specified_amount {
        currency_code = data.google_billing_account.billing_account.currency
        units         = amount.value.specified_amount
      }
      last_period_amount = amount.value.last_period_amount
    }
  }

  dynamic "threshold_rule" {
    for_each = each.value.thresholds
    content {
      threshold_percent = threshold_rule.value.percentage
      spend_threshold   = threshold_rule.value.amount
    }
  }

  dynamic "budget_filter" {
    for_each = each.value.filters
    content {
      credit_types = budget_filter.value.credit_types
      services     = budget_filter.value.services
      projects     = budget_filter.value.projects
      labels       = budget_filter.value.labels
    }
  }

}
