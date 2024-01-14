output "configure_kubectl" {
  description = "Configure kubectl: make sure you're logged in with the correct AWS profile and run the following command to update your kubeconfig"
  value       = "aws eks --region ${var.region} update-kubeconfig --name ${module.eks.cluster_name}"
}
output "falkordb_eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}
output "falkordb_eks_endpoint" {
  description = "EKS endpoint"
  value       = module.eks.cluster_endpoint
}
output "falkordb_cluster_certificate_authority_data" {
  description = "EKS cluster certificate authority data"
  value       = module.eks.cluster_certificate_authority_data
}
output "falkordb_s3_backup_location" {
  description = "S3 backup location"
  value       = local.falkordb_s3_backup_location
}