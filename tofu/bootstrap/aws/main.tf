provider "aws" {
  region = var.region
}

# random suffix
resource "random_id" "suffix" {
  byte_length = 4
}

data "aws_organizations_organizational_unit" "ou" {
  name      = var.ou_name
  parent_id = var.ou_parent_id
}

resource "aws_organizations_account" "account" {
  name              = var.account_name
  email             = var.account_email
  parent_id         = data.aws_organizations_organizational_unit.ou.id
  role_name         = "OrganizationAccountAccessRole"
  close_on_deletion = false
}

provider "aws" {
  alias  = "seed-account"
  region = var.region
  assume_role {
    role_arn = "arn:aws:iam::${aws_organizations_account.account.id}:role/OrganizationAccountAccessRole"
  }
}

resource "aws_s3_bucket" "terraform_state" {
  bucket = "tf-state-${random_id.suffix.hex}"

  provider = aws.seed-account
}

resource "aws_s3_bucket_versioning" "example" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }

  provider = aws.seed-account
}

resource "aws_s3_bucket_object_lock_configuration" "state_lock" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    default_retention {
      mode = "COMPLIANCE"
      days = 14
    }
  }
  
  provider = aws.seed-account
}
