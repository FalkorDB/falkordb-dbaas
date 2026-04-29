# IAM role for Prowler to perform read-only SOC 2 compliance scanning
# in the AWS app-plane account. Assumed by Prowler CronJobs running
# in EKS spoke clusters via IRSA (IAM Roles for Service Accounts).
#
# Attached policies:
#   - SecurityAudit (AWS managed) — read-only access to most AWS services
#   - ViewOnlyAccess (AWS managed) — additional read access for console resources

resource "aws_iam_role" "prowler_scanner" {
  name = "prowler-soc2-scanner"
  path = "/security/"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "arn:aws:iam::${aws_organizations_account.account.id}:oidc-provider/${var.eks_oidc_issuer}"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${var.eks_oidc_issuer}:sub" = [
              "system:serviceaccount:security:prowler",
              "system:serviceaccount:security:grype",
            ]
            "${var.eks_oidc_issuer}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })

  tags = {
    Purpose     = "soc2-compliance-scanning"
    ManagedBy   = "tofu"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "prowler_security_audit" {
  role       = aws_iam_role.prowler_scanner.name
  policy_arn = "arn:aws:iam::aws:policy/SecurityAudit"
}

resource "aws_iam_role_policy_attachment" "prowler_view_only" {
  role       = aws_iam_role.prowler_scanner.name
  policy_arn = "arn:aws:iam::aws:policy/job-function/ViewOnlyAccess"
}

# Additional inline policy for resources not covered by SecurityAudit
resource "aws_iam_role_policy" "prowler_additional" {
  name = "prowler-additional-permissions"
  role = aws_iam_role.prowler_scanner.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ProwlerAdditionalRead"
        Effect = "Allow"
        Action = [
          "account:Get*",
          "appstream:Describe*",
          "codeartifact:List*",
          "codebuild:BatchGet*",
          "ds:Get*",
          "ds:Describe*",
          "ds:List*",
          "ec2:GetEbsEncryptionByDefault",
          "ecr:Describe*",
          "ecr:GetRegistryPolicy",
          "elasticfilesystem:DescribeBackupPolicy",
          "glue:GetConnections",
          "glue:GetSecurityConfiguration*",
          "glue:SearchTables",
          "lambda:GetFunction*",
          "macie2:GetMacieSession",
          "s3:GetAccountPublicAccessBlock",
          "shield:DescribeProtection",
          "shield:GetSubscriptionState",
          "ssm-incidents:List*",
          "support:Describe*",
          "tag:GetTagKeys",
          "wellarchitected:List*",
        ]
        Resource = "*"
      }
    ]
  })
}

output "prowler_role_arn" {
  value       = aws_iam_role.prowler_scanner.arn
  description = "ARN of the Prowler IAM role for IRSA binding"
}
