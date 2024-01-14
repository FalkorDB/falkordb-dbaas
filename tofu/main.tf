module "aws" {
  source = "./aws"
}
module "k8s" {
  source                                      = "./k8s"
  falkordb_eks_cluster_name                   = module.aws.falkordb_eks_cluster_name
  falkordb_eks_endpoint                       = module.aws.falkordb_eks_endpoint
  falkordb_cluster_certificate_authority_data = module.aws.falkordb_cluster_certificate_authority_data
  falkordb_s3_backup_location                 = module.aws.falkordb_s3_backup_location
}