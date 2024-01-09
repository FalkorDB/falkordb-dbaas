# FalkorDBaaS

This repository contains OpenTofu templates to deploy FalkorDB on cloud.

# Prerequisite

1. OpenTofu CLI
2. kubectl
3. Helm
4. AWS CLI

# Scripts

Scripts to help work with this repository

1. tofu_init.sh: Initialize OpenTofu working directory.
2. tofu_upgrade.sh: Upgrade OpenTofu dependency.
3. tofu_new_workspace.sh: Create workspace for deployment.
4. tofu_select_workspace.sh: Switch between workspaces.
5. tofu_delete_workspace.sh: Delete workspace.
6. tofu_list_workspace.sh: List available workspaces.
7. tofu_plan.sh: Generate execution plan to be deployed.
8. tofu_apply.sh: Deploy the plan to the cloud provider.
9. tofu_destroy.sh: Delete the deployment from the cloud provider.
10. tofu_fmt.sh: Format the *.tf files.
11. helm_install.sh: Manual install FalkorDB resources on K8S.
12. helm_upgrade.sh: Upgrade the FalkorDB release on K8S.
13. helm_uninstall.sh: Uninstall the FalkorDB release from K8S.
14. helm_add_monitoring.sh: Add the prometheus-community helm charts repository to K8S.
15. helm_install_monitoring.sh: Install the kube-prometheus-stack

# Charts

1. values.yaml: example values used for deploying FalkorDB on K8S using the bitnami/redis helm charts.

# Tofu

This folder contains OpenTofu templates to deploy FalkorDB.