
data "aws_organizations_organizational_unit" "ou" {
  name      = var.workloads_ou_name
  parent_id = var.workloads_ou_parent_id
}

data "aws_organizations_organizational_unit_child_accounts" "children" {
  parent_id = data.aws_organizations_organizational_unit.ou.id
}

locals {
  workload_accounts = try(
    tomap({
      for account in data.aws_organizations_organizational_unit_child_accounts.children.accounts : account.name => account
    }),
    {}
  )
  app_plane_account                 = local.workload_accounts[var.app_plane_account_name]
  app_plane_trail_bucket_name       = nonsensitive("${lower(replace(var.app_plane_account_name, " ", "-"))}-cloudtrail-${random_bytes.suffix.hex}")
  app_plane_access_logs_bucket_name = nonsensitive("${lower(replace(var.app_plane_account_name, " ", "-"))}-access-logs-${random_bytes.suffix.hex}")
}

resource "random_bytes" "suffix" {
  length = 4
}


provider "aws" {
  alias = "app-plane-account"
  assume_role {
    role_arn = "arn:aws:iam::${local.app_plane_account.id}:role/OrganizationAccountAccessRole"
  }
}

# Bucket policy to allow CloudTrail to write logs to the bucket
data "aws_iam_policy_document" "cloudtrail_bucket_policy" {
  statement {
    effect    = "Allow"
    actions   = ["s3:GetBucketAcl"]
    resources = ["arn:aws:s3:::${local.app_plane_trail_bucket_name}"]
    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }
  }

  statement {
    effect    = "Allow"
    actions   = ["s3:PutObject"]
    resources = ["arn:aws:s3:::${local.app_plane_trail_bucket_name}/*"]
    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }
  }
}


module "aws-s3-bucket" {
  source                   = "trussworks/s3-private-bucket/aws"
  bucket                   = local.app_plane_trail_bucket_name
  use_account_alias_prefix = false
  enable_analytics         = false

  custom_bucket_policy = data.aws_iam_policy_document.cloudtrail_bucket_policy.json

  providers = {
    aws = aws.app-plane-account
  }
}

data "aws_iam_policy_document" "access_logs_bucket_policy" {

  statement {
    effect    = "Allow"
    actions   = ["s3:GetBucketAcl"]
    resources = ["arn:aws:s3:::${local.app_plane_access_logs_bucket_name}"]
    principals {
      type        = "Service"
      identifiers = ["delivery.logs.amazonaws.com"]
    }
  }

  statement {
    effect    = "Allow"
    actions   = ["s3:PutObject"]
    resources = ["arn:aws:s3:::${local.app_plane_access_logs_bucket_name}/*"]
    principals {
      type        = "Service"
      identifiers = ["delivery.logs.amazonaws.com"]
    }
  }
}

module "aws-s3-bucket-access-logs" {
  source                   = "trussworks/s3-private-bucket/aws"
  bucket                   = local.app_plane_access_logs_bucket_name
  use_account_alias_prefix = false
  enable_analytics         = false

  custom_bucket_policy = data.aws_iam_policy_document.access_logs_bucket_policy.json

  providers = {
    aws = aws.app-plane-account
  }
}

# Role Cluster Reader
data "aws_iam_policy_document" "import_export_job_assume_role_policy" {
  statement {
    effect    = "Allow"
    actions   = ["eks:DescribeCluster", "eks:ListClusters"]
    resources = ["*"]
  }
}

resource "aws_iam_role" "import_export_job" {
  name               = "ImportExportJobRole"
  assume_role_policy = data.aws_iam_policy_document.import_export_job_assume_role_policy.json
}

data "aws_eks_clusters" "all_clusters" {}

resource "aws_iam_role_policy_attachment" "import_export_job" {
  for_each = toset(data.aws_eks_clusters.all_clusters.names)

  role       = aws_iam_role.import_export_job.name
  # Add pod execution role policy
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterAdminPolicy"
}
