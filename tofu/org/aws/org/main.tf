# Create Workloads OU
resource "aws_organizations_organizational_unit" "workloads" {
  name      = var.workloads_ou_name
  parent_id = var.workloads_ou_parent_id
}


resource "aws_organizations_account" "account" {
  name              = var.app_plane_account_name
  email             = var.app_plane_account_email
  parent_id         = aws_organizations_organizational_unit.workloads.id
  role_name         = "OrganizationAccountAccessRole"
  close_on_deletion = false

  depends_on = [ aws_organizations_organizational_unit.workloads ]

  lifecycle {
    ignore_changes = [role_name, name]
  }
}