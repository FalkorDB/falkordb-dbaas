variable "name" {
  type    = string
  default = "tofu"
}

variable "region" {
  type    = string
  default = "eu-north-1"

}

variable "falkordb_version" {
  type    = string
  default = "4.0"
}

variable "persistance_size" {
  type    = string
  default = "8Gi"
}

variable "falkordb_replicas" {
  type    = number
  default = 1
}

variable "grafana_admin_password" {
  type    = string
  default = "admin"
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

variable "backup_schedule" {
  type    = string
  default = "0 * * * *"
}