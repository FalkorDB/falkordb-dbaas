# GCP: Tenant Group

This module contains the tenant groups that are deployed in the system. This includes the following:
- Networking
- DNS
- Cluster
- K8s resources
- Backup

## Resources

### Networking

The Networking module is responsible for creating the VPC and subnets required for the tenant group. It also reserves an IP address for the tenant group.


### DNS

The DNS module is responsible for creating the DNS zone for the tenant group.


### Cluster

The Cluster module is responsible for creating the GKE Cluster.


### K8s resources

The K8s resources module is responsible for installing the required resources in the GKE Cluster, including service accounts roles and bindings, monitoring, and external DNS.


### Backup

The Backup module is responsible for creating the backup bucket for the tenant group.
