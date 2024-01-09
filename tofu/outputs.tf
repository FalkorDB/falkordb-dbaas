output "configure_kubectl" {
  description = "Configure kubectl: make sure you're logged in with the correct AWS profile and run the following command to update your kubeconfig"
  value       = "aws eks --region ${var.region} update-kubeconfig --name ${module.eks.cluster_name}"
}
output "falkordb_s3_backup_location" {
  description = "S3 backup location"
  value       = local.falkordb_s3_backup_location
}