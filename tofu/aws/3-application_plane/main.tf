locals {
  assume_role_arn = "arn:aws:iam::${var.app_plane_account_id}:role/OrganizationAccountAccessRole"
}
#### PROVIDERS ####
# provider "aws" {
#   alias = "default"
#   assume_role {
#     role_arn = local.assume_role_arn
#   }
# }

locals {
  regions = [
    "af-south-1",
    "ap-east-1",
    "ap-northeast-1",
    "ap-northeast-2",
    "ap-northeast-3",
    "ap-south-1",
    "ap-south-2",
    "ap-southeast-1",
    "ap-southeast-2",
    "ap-southeast-3",
    "ap-southeast-4",
    "ap-southeast-5",
    "ap-southeast-7",
    "ca-central-1",
    "ca-west-1",
    "eu-central-1",
    "eu-central-2",
    "eu-north-1",
    "eu-south-1",
    "eu-south-2",
    "eu-west-1",
    "eu-west-2",
    "eu-west-3",
    "il-central-1",
    "me-central-1",
    "me-south-1",
    "mx-central-1",
    "sa-east-1",
    "us-east-1",
    "us-east-2",
    "us-west-1",
    "us-west-2",
  ]
}

module "global" {
  source          = "./modules/global"
  region          = "us-east-1"
  account_id      = var.app_plane_account_id
  assume_role_arn = local.assume_role_arn

  google_client_ids          = var.google_client_ids
  cluster_user_role_audience = var.cluster_user_role_audience

}

# module "region_af-south-1" {
#   source = "./modules/region"

#   region          = "af-south-1"
#   assume_role_arn = local.assume_role_arn
#   role_arn        = module.global.cluster_user_role_arn
# }

# module "region_ap-east-1" {
#   source = "./modules/region"

#   region          = "ap-east-1"
#   assume_role_arn = local.assume_role_arn
#   role_arn        = module.global.cluster_user_role_arn
# }

module "region_ap-northeast-1" {
  source = "./modules/region"

  region          = "ap-northeast-1"
  assume_role_arn = local.assume_role_arn
  role_arn        = module.global.cluster_user_role_arn
}

module "region_ap-northeast-2" {
  source = "./modules/region"

  region          = "ap-northeast-2"
  assume_role_arn = local.assume_role_arn
  role_arn        = module.global.cluster_user_role_arn
}

module "region_ap-northeast-3" {
  source = "./modules/region"

  region          = "ap-northeast-3"
  assume_role_arn = local.assume_role_arn
  role_arn        = module.global.cluster_user_role_arn
}

module "region_ap-south-1" {
  source = "./modules/region"

  region          = "ap-south-1"
  assume_role_arn = local.assume_role_arn
  role_arn        = module.global.cluster_user_role_arn
}

# module "region_ap-south-2" {
#   source = "./modules/region"

#   region          = "ap-south-2"
#   assume_role_arn = local.assume_role_arn
#   role_arn        = module.global.cluster_user_role_arn
# }

module "region_ap-southeast-1" {
  source = "./modules/region"

  region          = "ap-southeast-1"
  assume_role_arn = local.assume_role_arn
  role_arn        = module.global.cluster_user_role_arn
}

module "region_ap-southeast-2" {
  source = "./modules/region"

  region          = "ap-southeast-2"
  assume_role_arn = local.assume_role_arn
  role_arn        = module.global.cluster_user_role_arn
}

# module "region_ap-southeast-3" {
#   source = "./modules/region"

#   region          = "ap-southeast-3"
#   assume_role_arn = local.assume_role_arn
#   role_arn        = module.global.cluster_user_role_arn
# }

# module "region_ap-southeast-4" {
#   source = "./modules/region"

#   region          = "ap-southeast-4"
#   assume_role_arn = local.assume_role_arn
#   role_arn        = module.global.cluster_user_role_arn
# }

# module "region_ap-southeast-5" {
#   source = "./modules/region"

#   region          = "ap-southeast-5"
#   assume_role_arn = local.assume_role_arn
#   role_arn        = module.global.cluster_user_role_arn
# }

# module "region_ap-southeast-7" {
#   source = "./modules/region"

#   region          = "ap-southeast-7"
#   assume_role_arn = local.assume_role_arn
#   role_arn        = module.global.cluster_user_role_arn
# }

module "region_ca-central-1" {
  source = "./modules/region"

  region          = "ca-central-1"
  assume_role_arn = local.assume_role_arn
  role_arn        = module.global.cluster_user_role_arn
}

# module "region_ca-west-1" {
#   source = "./modules/region"

#   region          = "ca-west-1"
#   assume_role_arn = local.assume_role_arn
#   role_arn        = module.global.cluster_user_role_arn
# }

module "region_eu-central-1" {
  source = "./modules/region"

  region          = "eu-central-1"
  assume_role_arn = local.assume_role_arn
  role_arn        = module.global.cluster_user_role_arn
}

# module "region_eu-central-2" {
#   source = "./modules/region"

#   region          = "eu-central-2"
#   assume_role_arn = local.assume_role_arn
#   role_arn        = module.global.cluster_user_role_arn
# }

module "region_eu-north-1" {
  source = "./modules/region"

  region          = "eu-north-1"
  assume_role_arn = local.assume_role_arn
  role_arn        = module.global.cluster_user_role_arn
}

# module "region_eu-south-1" {
#   source = "./modules/region"

#   region          = "eu-south-1"
#   assume_role_arn = local.assume_role_arn
#   role_arn        = module.global.cluster_user_role_arn
# }

# module "region_eu-south-2" {
#   source = "./modules/region"

#   region          = "eu-south-2"
#   assume_role_arn = local.assume_role_arn
#   role_arn        = module.global.cluster_user_role_arn
# }

module "region_eu-west-1" {
  source = "./modules/region"

  region          = "eu-west-1"
  assume_role_arn = local.assume_role_arn
  role_arn        = module.global.cluster_user_role_arn
}

module "region_eu-west-2" {
  source = "./modules/region"

  region          = "eu-west-2"
  assume_role_arn = local.assume_role_arn
  role_arn        = module.global.cluster_user_role_arn
}

module "region_eu-west-3" {
  source = "./modules/region"

  region          = "eu-west-3"
  assume_role_arn = local.assume_role_arn
  role_arn        = module.global.cluster_user_role_arn
}

module "region_il-central-1" {
  source = "./modules/region"

  region          = "il-central-1"
  assume_role_arn = local.assume_role_arn
  role_arn        = module.global.cluster_user_role_arn
}

# module "region_me-central-1" {
#   source = "./modules/region"

#   region          = "me-central-1"
#   assume_role_arn = local.assume_role_arn
#   role_arn        = module.global.cluster_user_role_arn
# }

# module "region_me-south-1" {
#   source = "./modules/region"

#   region          = "me-south-1"
#   assume_role_arn = local.assume_role_arn
#   role_arn        = module.global.cluster_user_role_arn
# }

# module "region_mx-central-1" {
#   source = "./modules/region"

#   region          = "mx-central-1"
#   assume_role_arn = local.assume_role_arn
#   role_arn        = module.global.cluster_user_role_arn
# }

module "region_sa-east-1" {
  source = "./modules/region"

  region          = "sa-east-1"
  assume_role_arn = local.assume_role_arn
  role_arn        = module.global.cluster_user_role_arn
}

module "region_us-east-1" {
  source = "./modules/region"

  region          = "us-east-1"
  assume_role_arn = local.assume_role_arn
  role_arn        = module.global.cluster_user_role_arn
}

module "region_us-east-2" {
  source = "./modules/region"

  region          = "us-east-2"
  assume_role_arn = local.assume_role_arn
  role_arn        = module.global.cluster_user_role_arn
}

module "region_us-west-1" {
  source = "./modules/region"

  region          = "us-west-1"
  assume_role_arn = local.assume_role_arn
  role_arn        = module.global.cluster_user_role_arn
}

module "region_us-west-2" {
  source = "./modules/region"

  region          = "us-west-2"
  assume_role_arn = local.assume_role_arn
  role_arn        = module.global.cluster_user_role_arn
}
