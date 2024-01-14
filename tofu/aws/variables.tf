variable "name" {
  type    = string
  default = "falkordb"
}

variable "region" {
  type    = string
  default = "eu-north-1"
}

variable "k8s_version" {
  type    = string
  default = "1.28"
}

variable "k8s_instance_type" {
  type    = string
  default = "t3.medium"
}

variable "k8s_node_count" {
  type    = number
  default = 2
}

variable "k8s_node_min_count" {
  type    = number
  default = 2
}

variable "k8s_node_max_count" {
  type    = number
  default = 3
}

variable "backup_retention_period" {
  type    = number
  default = 30
}