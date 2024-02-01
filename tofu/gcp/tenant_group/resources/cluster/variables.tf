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
  type = list(string)
}

variable "master_ipv4_cidr_block" {
  type = string
  default = "172.16.0.32/28"
}