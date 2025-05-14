provider "aws" {
  region = var.region
  # assume_role {
  #   role_arn = var.assume_role_arn
  # }
}

# Cluster User Role
data "aws_iam_policy_document" "cluster_user_policy" {
  statement {
    effect = "Allow"

    actions   = ["eks:ListClusters", "eks:DescribeCluster"]
    resources = ["*"]
  }
}

resource "aws_iam_role" "cluster_user_role" {
  name               = "ClusterUserRole"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "eks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    },
    {
        "Effect": "Allow",
        "Principal": {
            "Federated": "arn:aws:iam::${var.account_id}:oidc-provider/accounts.google.com"
        },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
            "StringEquals": {
                "accounts.google.com:aud": "${var.cluster_user_role_audience}"
            }
        }
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "cluster_user_policy" {
  name   = "ClusterUserPolicy"
  role   = aws_iam_role.cluster_user_role.id
  policy = data.aws_iam_policy_document.cluster_user_policy.json
}


resource "aws_iam_openid_connect_provider" "google" {
  url = "https://accounts.google.com"

  client_id_list = var.google_client_ids
}
