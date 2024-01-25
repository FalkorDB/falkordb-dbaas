variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "me-west1"
}

variable "tenant_group_name" {
  type = string
}

variable "vpc_name" {
  type = string
}

variable "subnet_name" {
  type = string
}

variable "subnet_cidr" {
  type    = string
  default = "10.0.0.0/22"
}

variable "subnet_proxy_only_cidr_range" {
  type    = string
  default = "11.0.0.0/22"
}

variable "tenant_group_size" {
  type    = number
  default = 20
}

variable "cluster_name" {
  type = string
}

variable "node_pools" {
  type = list(map(any))

  default = [ {
    name         = "default-pool"
    machine_type = "n1-standard-2"
    disk_size_gb = 10
  } ]
}

variable "force_destroy_bucket" {
  type    = bool
  default = false
}
