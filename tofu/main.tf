provider "aws" {
  region = var.region
}

provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
  }
}

resource "kubernetes_cluster_role" "falkordb_role" {
  metadata {
    name = "falkordb-role"
  }

  rule {
    api_groups = [""]
    resources  = ["pods"]
    verbs      = ["get", "watch", "list"]
  }
  rule {
    api_groups = [""]
    resources  = ["pods/exec"]
    verbs      = ["create"]
  }
}

resource "kubernetes_cluster_role_binding" "falkordb_role_binding" {
  metadata {
    name = "falkordb-role-binding"
  }
  role_ref {
    name      = "falkordb-role"
    kind      = "ClusterRole"
    api_group = "rbac.authorization.k8s.io"
  }
  subject {
    kind      = "ServiceAccount"
    name      = "default"
    namespace = "default"
  }
}

resource "kubernetes_cron_job_v1" "falkorbd_backup" {
  metadata {
    name = "falkordb-backup"
  }
  spec {
    concurrency_policy = "Replace"
    schedule           = var.backup_schedule
    job_template {
      metadata {}
      spec {
        backoff_limit              = 2
        ttl_seconds_after_finished = 10
        template {
          metadata {}
          spec {
            container {
              name  = "backup"
              image = "amazon/aws-cli"
              # https://docs.aws.amazon.com/eks/latest/userguide/install-kubectl.html
              command = ["/bin/sh", "-c", "curl -O https://s3.us-west-2.amazonaws.com/amazon-eks/1.28.3/2023-11-14/bin/linux/amd64/kubectl; chmod +x kubectl; ./kubectl exec falkordb-redis-master-0 -- redis-cli -a '${random_password.password.result}' save; ./kubectl cp falkordb-redis-master-0:/data/dump.rdb dump.rdb -c redis; ls -l; aws s3 cp dump.rdb s3://${local.falkordb_s3_backup_location}/dump$(date +'%Y-%m-%d_%H-%M-%S').rdb"]
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_config_map" "falkordb_grafana_dashboard" {
  metadata {
    name = "falkordb-grafana-dashboard-redis"
    labels = {
      grafana_dashboard = "1"
    }
  }
  data = {
    "falkordb.json" = "${file("${path.module}/dashboards/falkordb.json")}"
  }
}

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
    }
  }
}

resource "random_password" "password" {
  length           = 16
  special          = true
  override_special = ""
}

resource "helm_release" "falkordb" {
  name = "falkordb"

  repository = "https://charts.bitnami.com/bitnami"
  chart      = "redis"

  set {
    name  = "global.redis.password"
    value = random_password.password.result
  }
  set {
    name  = "image.repository"
    value = "falkordb/falkordb"
  }
  set {
    name  = "image.tag"
    value = var.falkordb_version
  }
  set_list {
    name  = "master.extraFlags"
    value = ["--loadmodule", "/FalkorDB/bin/linux-x64-release/src/falkordb.so"]
  }
  set {
    name  = "master.persistence.size"
    value = var.persistance_size
  }
  set {
    name  = "replica.replicaCount"
    value = var.falkordb_replicas
  }
  set_list {
    name  = "replica.extraFlags"
    value = ["--loadmodule", "/FalkorDB/bin/linux-x64-release/src/falkordb.so"]
  }
  set {
    name  = "replica.persistence.size"
    value = var.persistance_size
  }
  set {
    name  = "metrics.enabled"
    value = true
  }
  set {
    name  = "metrics.serviceMonitor.enabled"
    value = true
  }
  set {
    name  = "metrics.serviceMonitor.namespace"
    value = "default"
  }
  set {
    name  = "metrics.serviceMonitor.additionalLabels.release"
    value = "falkordb-monitoring"
  }
  set_list {
    name  = "metrics.serviceMonitor.relabelings[0].sourceLabels"
    value = ["__meta_kubernetes_pod_name"]
  }
  set {
    name  = "metrics.serviceMonitor.relabelings[0].action"
    value = "Replace"
  }
  set {
    name  = "metrics.serviceMonitor.relabelings[0].targetLabel"
    value = "instance"
  }
  set {
    name  = "metrics.serviceMonitor.relabelings[0].regex"
    value = "(.*redis.*)"
  }
}

resource "helm_release" "falkordb-monitoring" {
  name = "falkordb-monitoring"

  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"

  set {
    name  = "grafana.adminPassword"
    value = var.grafana_admin_password
  }
  set {
    name  = "grafana.additionalDataSources[0].name"
    value = "FalkorDB"
  }
  # https://redisgrafana.github.io/redis-datasource/provisioning/
  set_list {
    name  = "grafana.plugins"
    value = ["redis-datasource"]
  }
  set {
    name  = "grafana.additionalDataSources[0].type"
    value = "redis-datasource"
  }
  set {
    name  = "grafana.additionalDataSources[0].url"
    value = "falkordb-redis-master:6379"
  }
  set {
    name  = "grafana.additionalDataSources[0].secureJsonData.password"
    value = random_password.password.result
  }
  set {
    name  = "grafana.additionalDataSources[0].editable"
    value = "true"
  }
}

data "aws_caller_identity" "current" {}
data "aws_availability_zones" "available" {}

locals {
  vpc_cidr = "10.0.0.0/16"
  azs      = slice(data.aws_availability_zones.available.names, 0, 3)

  tags = {
    customer = var.name
  }

  falkordb_s3_backup_location = "${module.falkordb_backup_s3_bucket.s3_bucket_id}/backups"
}

################################################################################
# Cluster
################################################################################

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.21"

  cluster_name                   = var.name
  cluster_version                = var.k8s_version
  cluster_endpoint_public_access = true

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    initial = {
      instance_types = [var.k8s_instance_type]

      min_size     = var.k8s_node_min_count
      max_size     = var.k8s_node_max_count
      desired_size = var.k8s_node_count
    }
  }

  tags = local.tags
}

################################################################################
# EKS Blueprints Addons
################################################################################

module "eks_blueprints_addons" {
  source  = "aws-ia/eks-blueprints-addons/aws"
  version = "~> 1.0"

  cluster_name      = module.eks.cluster_name
  cluster_endpoint  = module.eks.cluster_endpoint
  cluster_version   = module.eks.cluster_version
  oidc_provider_arn = module.eks.oidc_provider_arn

  create_delay_dependencies = [for group in module.eks.eks_managed_node_groups : group.node_group_arn]

  eks_addons = {
    aws-ebs-csi-driver = {
      service_account_role_arn = module.ebs_csi_driver_irsa.iam_role_arn
    }
    coredns    = {}
    vpc-cni    = {}
    kube-proxy = {}
  }

  tags = local.tags
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["pods.eks.amazonaws.com"]
    }

    actions = [
      "sts:AssumeRole",
      "sts:TagSession"
    ]
  }
}

resource "aws_iam_role" "falkordb_backup_role" {
  name               = "eks-pod-identity-falkordb_backup_role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy_attachment" "falkordb_backup_role_policy_attachment" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
  role       = aws_iam_role.falkordb_backup_role.name
}

resource "aws_eks_pod_identity_association" "falkordb_backup_association" {
  cluster_name    = module.eks.cluster_name
  namespace       = "default"
  service_account = "default"
  role_arn        = aws_iam_role.falkordb_backup_role.arn
}

resource "aws_eks_addon" "eks_pod_identity" {
  cluster_name                = module.eks.cluster_name
  addon_name                  = "eks-pod-identity-agent"
  addon_version               = "v1.0.0-eksbuild.1"
  resolve_conflicts_on_update = "OVERWRITE"
}

################################################################################
# Supporting Resources
################################################################################

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = var.name
  cidr = local.vpc_cidr

  azs             = local.azs
  private_subnets = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 4, k)]
  public_subnets  = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k + 48)]

  enable_nat_gateway = true
  single_nat_gateway = true

  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = 1
  }

  tags = local.tags
}

#tfsec:ignore:*
module "falkordb_backup_s3_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 3.0"

  bucket_prefix = "${var.name}-"

  attach_deny_insecure_transport_policy = true
  attach_require_latest_tls_policy      = true

  acl = "private"

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  control_object_ownership = true
  object_ownership         = "BucketOwnerPreferred"

  versioning = {
    status     = true
    mfa_delete = false
  }

  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  tags = local.tags
}

resource "aws_s3_bucket_lifecycle_configuration" "falkordb_backup_s3_bucket_lifecycle_configuration" {
  bucket = module.falkordb_backup_s3_bucket.s3_bucket_id

  rule {
    id = "falkordb-rule"

    filter {
      prefix = "backups/"
    }

    expiration {
      days = var.backup_retention_period
    }
    abort_incomplete_multipart_upload {
      days_after_initiation = 3
    }

    status = "Enabled"
  }
}

module "ebs_kms_key" {
  source  = "terraform-aws-modules/kms/aws"
  version = "~> 1.5"

  description = "Customer managed key to encrypt EKS managed node group volumes"

  # Policy
  key_administrators = [data.aws_caller_identity.current.arn]
  key_service_roles_for_autoscaling = [
    # required for the ASG to manage encrypted volumes for nodes
    "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/aws-service-role/autoscaling.amazonaws.com/AWSServiceRoleForAutoScaling",
    # required for the cluster / persistentvolume-controller to create encrypted PVCs
    module.eks.cluster_iam_role_arn,
  ]

  # Aliases
  aliases = ["eks/${var.name}/ebs"]

  tags = local.tags
}

module "ebs_csi_driver_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.20"

  role_name_prefix = "${module.eks.cluster_name}-ebs-csi-driver-"

  attach_ebs_csi_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:ebs-csi-controller-sa"]
    }
  }

  tags = local.tags
}