variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "zones" {
  type = list(string)
}

variable "tenant_group_name" {
  type = string
}

variable "vpc_name" {
  type = string
}

variable "subnetwork_name" {
  type = string
}

variable "ip_range_pods" {
  type = string
}

variable "ip_range_services" {
  type = string
}

variable "node_pools" {
  type = list(map(any))
}

variable "node_pools_tags" {
  type     = list(string)
  nullable = true
  default  = []
}

variable "cluster_deletion_protection" {
  type    = bool
  default = true
}

variable "default_max_pods_per_node" {
  type    = number
  default = 20
}

variable "enable_private_nodes" {
  type    = bool
  default = true
}
