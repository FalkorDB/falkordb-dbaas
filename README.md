# FalkorDBaaS

This repository contains OpenTofu templates to deploy FalkorDB on cloud.

# Prerequisite

1. OpenTofu CLI
2. kubectl
3. Helm
4. AWS CLI
5. GCloud CLI
6. Velero CLI

# Scripts

Scripts to help work with this repository

1. add_cluster.sh: Add a new application plane cluster to ArgoCD.
2. tofu_init.sh: Initialize OpenTofu working directory.
3. tofu_upgrade.sh: Upgrade OpenTofu dependency.
4. tofu_new_workspace.sh: Create workspace for deployment.
5. tofu_select_workspace.sh: Switch between workspaces.
6. tofu_delete_workspace.sh: Delete workspace.
7. tofu_list_workspace.sh: List available workspaces.
8. tofu_plan.sh: Generate execution plan to be deployed.
9. tofu_plan_aws.sh: Generate execution plan to be deployed for the AWS target.
10. tofu_plan_k8s.sh: Generate execution plan to be deployed for the K8S target.
11. tofu_apply.sh: Deploy the plan to the cloud provider.
12. tofu_apply_aws.sh: Deploy the AWS target to the cloud provider.
13. tofu_apply_k8s.sh: Deploy the K8S target to the cloud provider.
14. tofu_destroy.sh: Delete the deployment from the cloud provider.
15. tofu_output.sh: Show deployment output.
16. tofu_show.sh: Show the state configuration.
17. tofu_test.sh: Run Tofu tests.
18. aws_update_kubeconfig.sh: Update kubectl config.
19. kubectl_connect_falkordb_master.sh: Port forward into the FalkorDB master node.
20. kubectl_connect_grafana.sh: Port forward into the grafana gui.
21. kubectl_connect_prometheus.sh: Port forward into the prometheus gui.
22. kubectl_connect_alertmanager.sh: Port forward into the alert manager gui.
23. gcp_update_kubeconfig.sh: Update kubectl config. Args: 1=cluster-name, 2=region, 3=project-name 

# Tofu

This folder contains OpenTofu templates to deploy FalkorDB.


# Folder Structure

## GCP

- tofu/gcp: Contain the folder structure for the organization to be deployed on GCP
  - [bootstrap](./tofu/gcp/bootstrap/README.md): Contain the terraform resources for bootstrapping the projects and creating the state bucket 
  - [org](./tofu/gcp/org/README.md): Contain the files for creating the Organization hierarchy and projects required for the system. It also activates required APIs and setup Service Accounts and permissions
  - [tenant_group](./tofu/gcp/tenant_group/README.md): Contain the files to provision a Tenant Group in GCP, including infrastructure and setting up the cluster resources
  - [tenant](./tofu/gcp/tenant/README.md): Contain the files to provision a Tenant inside a Tenant Group in GCP, including infrastructure and setting up the cluster resources
