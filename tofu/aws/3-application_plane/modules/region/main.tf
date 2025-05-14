provider "aws" {
  region = var.region
  # assume_role {
  #   role_arn = var.assume_role_arn
  # }
}

data "aws_eks_clusters" "clusters" {}

# for each cluster in the account, add an access entry for the cluster user role
resource "aws_eks_access_entry" "cluster_auth" {
  for_each = toset(data.aws_eks_clusters.clusters.names)

  cluster_name  = each.key
  principal_arn = var.role_arn
}

resource "aws_eks_access_policy_association" "cluster_auth_association" {
  for_each = toset(data.aws_eks_clusters.clusters.names)

  cluster_name  = each.key
  principal_arn = var.role_arn
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"

  access_scope {
    type = "cluster"
  }
}
