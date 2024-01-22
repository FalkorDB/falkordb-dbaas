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
7. tofu_plan_aws.sh: Generate execution plan to be deployed for the AWS target.
7. tofu_plan_k8s.sh: Generate execution plan to be deployed for the K8S target.
8. tofu_apply.sh: Deploy the plan to the cloud provider.
9. tofu_apply_aws.sh: Deploy the AWS target to the cloud provider.
10. tofu_apply_k8s.sh: Deploy the K8S target to the cloud provider.
11. tofu_destroy.sh: Delete the deployment from the cloud provider.
12. tofu_output.sh: Show deployment output.
13. tofu_show.sh: Show the state configuration.
14. tofu_test.sh: Run Tofu tests.
15. aws_update_kubeconfig.sh: Update kubectl config.
16. kubectl_connect_falkordb_master.sh: Port forward into the FalkorDB master node.
17. kubectl_connect_grafana.sh: Port forward into the grafana gui.
18. kubectl_connect_prometheus.sh: Port forward into the prometheus gui.
19. kubectl_connect_alertmanager.sh: Port forward into the alert manager gui.

# Tofu

This folder contains OpenTofu templates to deploy FalkorDB.