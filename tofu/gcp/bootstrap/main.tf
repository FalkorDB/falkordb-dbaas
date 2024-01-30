
module "seed_project" {
  source = "./seed_project"

  org_id             = var.org_id
  billing_account_id = var.billing_account_id
  seed_project_id    = var.seed_project_id

  parent_folder_id = var.root_folder_id

  state_bucket_name_prefix = var.state_bucket_name_prefix
}
