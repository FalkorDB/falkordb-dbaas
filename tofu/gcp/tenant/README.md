# GCP: Tenant

This module contains the resources required for each tenant deployment. It configures infrastructure and K8s resources for each tenant.


## Resources

### Backup

Creates a Service Account for the backup, and add permission to access the backup bucket under a specific prefix.


### K8s

Creates the FalkorDB deployment, and backup deployment for the tenant.