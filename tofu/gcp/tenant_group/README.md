# GCP: Tenant Group

This module contains the tenant groups that are deployed in the system. 
It is divided into two folders: `infra` and `k8s`.

The `infra` folder contain the infrastructure resources:
- Networking
- DNS
- Cluster
- Backup
- 
The `k8s` folder contains the k8s resources, including namespaces, service accounts, roles, and bindings.

This includes the following:
- K8s resources

## Resources

### Infra: Networking

The Networking module is responsible for creating the VPC and subnets required for the tenant group. It also reserves an IP address for the tenant group.


### Infra: DNS

The DNS module is responsible for creating the DNS zone for the tenant group.


### Infra: Cluster

The Cluster module is responsible for creating the GKE Cluster.


### Infra: Backup

The Backup module is responsible for creating the backup bucket for the tenant group.


### K8s: K8s resources

The K8s resources module is responsible for installing the required resources in the GKE Cluster, including service accounts roles and bindings, monitoring, and external DNS.

