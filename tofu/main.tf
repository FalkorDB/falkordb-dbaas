provider "aws" {
  region = var.region
  assume_role {
    role_arn = var.assume_role_arn
  }
}
module "aws" {
  source             = "./aws"
  name               = var.name
  region             = var.region
  assume_role_arn    = var.assume_role_arn
  eks_auth_role      = var.eks_auth_role
  k8s_version        = var.k8s_version
  k8s_instance_type  = var.k8s_instance_type
  k8s_node_count     = var.k8s_node_count
  k8s_node_min_count = var.k8s_node_min_count
  k8s_node_max_count = var.k8s_node_max_count
}


provider "kubernetes" {
  host                   = module.aws.falkordb_eks_cluster_endpoint
  cluster_ca_certificate = base64decode(module.aws.falkordb_eks_cluster_certificate_autority)

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", module.aws.falkordb_eks_cluster_name, "--role-arn", var.assume_role_arn]
  }
}


provider "helm" {
  kubernetes {
    host                   = module.aws.falkordb_eks_cluster_endpoint
    cluster_ca_certificate = base64decode(module.aws.falkordb_eks_cluster_certificate_autority)

    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", module.aws.falkordb_eks_cluster_name, "--role-arn", var.assume_role_arn]
    }
  }
}

data "aws_caller_identity" "current" {
}


module "k8s" {
  source                    = "./k8s"
  region                    = var.region
  assume_role_arn           = var.assume_role_arn
  falkordb_eks_cluster_name = module.aws.falkordb_eks_cluster_name
  falkordb_s3_backup_name   = module.aws.falkordb_s3_backup_name
  tenant_name               = var.name
  falkordb_version          = var.falkordb_version
  falkordb_cpu              = var.falkordb_cpu
  falkordb_memory           = var.falkordb_memory
  persistance_size          = var.persistance_size
  falkordb_replicas         = var.falkordb_replicas
  grafana_admin_password    = var.grafana_admin_password
  backup_schedule           = var.backup_schedule
  falkordb_domain           = var.falkordb_domain
  falkordb_hosted_zone_id   = var.falkordb_hosted_zone_id
  falkordb_password         = var.falkordb_password
  backup_retention_period   = var.backup_retention_period

  falkordb_eks_cluster_oidc_issuer_url = module.aws.falkordb_eks_cluster_oidc_issuer_url
  falkordb_eks_cluster_oidc_issuer_arn = module.aws.falkordb_eks_cluster_oidc_issuer_arn

  key_administrators = [
    # Verify which roles should have access
    var.assume_role_arn,
  ]

  key_service_roles_for_autoscaling = [
    # required for the ASG to manage encrypted volumes for nodes
    "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/aws-service-role/autoscaling.amazonaws.com/AWSServiceRoleForAutoScaling",
    # required for the cluster / persistentvolume-controller to create encrypted PVCs
    module.aws.falkordb_eks_cluster_role_arn
  ]

  depends_on = [module.aws]
}
