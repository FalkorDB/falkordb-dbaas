output "configure_kubectl" {
  description = "Configure kubectl: make sure you're logged in with the correct AWS profile and run the following command to update your kubeconfig"
  value       = "aws eks --region ${var.region} update-kubeconfig --name ${module.eks.cluster_name}"
}
output "falkordb_eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}
output "falkordb_s3_backup_name" {
  description = "Backup bucket name"
  value       = module.falkordb_backup_s3_bucket.s3_bucket_id
}

output "falkordb_eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "falkordb_eks_cluster_certificate_autority" {
  description = "EKS cluster certificate autority"
  value       = module.eks.cluster_certificate_authority_data
}

output "falkordb_eks_cluster_role_arn" {
  description = "EKS cluster role ARN"
  value       = module.eks.cluster_iam_role_arn
}

output "falkordb_eks_cluster_oidc_issuer_url" {
  description = "EKS cluster OIDC issuer URL"
  value       = module.eks.cluster_oidc_issuer_url
}

output "falkordb_eks_cluster_oidc_issuer_arn" {
  description = "EKS cluster OIDC issuer ARN"
  value       = module.eks.oidc_provider_arn
}