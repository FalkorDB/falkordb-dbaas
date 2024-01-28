
###### STATE ######
variable "state_bucket_name" {
  type = string
}

###### PROJECT ######
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
  default = "10.130.1.0/24"
}

variable "subnet_proxy_only_cidr" {
  type    = string
  default = "10.130.2.0/24"
}

variable "ip_range_pods" {
  type    = string
  default = "10.130.10.0/24"
}

variable "ip_range_services" {
  type    = string
  default = "10.130.10.0/24"
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

variable "force_destroy_backup_bucket" {
  type    = bool
  default = false
}
