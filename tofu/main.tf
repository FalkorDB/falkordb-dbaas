module "aws" {
  source                  = "./aws"
  name                    = var.name
  region                  = var.region
  k8s_version             = var.k8s_version
  k8s_instance_type       = var.k8s_instance_type
  k8s_node_count          = var.k8s_node_count
  k8s_node_min_count      = var.k8s_node_min_count
  k8s_node_max_count      = var.k8s_node_max_count
  backup_retention_period = var.backup_retention_period
}
module "k8s" {
  source                                      = "./k8s"
  falkordb_version                            = var.falkordb_version
  falkordb_cpu                                = var.falkordb_cpu
  falkordb_memory                             = var.falkordb_memory
  persistance_size                            = var.persistance_size
  falkordb_replicas                           = var.falkordb_replicas
  grafana_admin_password                      = var.grafana_admin_password
  backup_schedule                             = var.backup_schedule
  falkordb_domain                             = var.falkordb_domain
  falkordb_hosted_zone_id                     = var.falkordb_hosted_zone_id
  falkordb_eks_cluster_name                   = module.aws.falkordb_eks_cluster_name
  falkordb_eks_endpoint                       = module.aws.falkordb_eks_endpoint
  falkordb_cluster_certificate_authority_data = module.aws.falkordb_cluster_certificate_authority_data
  falkordb_s3_backup_location                 = module.aws.falkordb_s3_backup_location
  falkordb_eks_oidc_issuer                    = module.aws.falkordb_eks_oidc_issuer
  falkordb_eks_oidc_provider_arn              = module.aws.falkordb_eks_oidc_provider_arn
}