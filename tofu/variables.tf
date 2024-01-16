variable "name" {
  type = string
}

variable "region" {
  type = string
}

variable "k8s_version" {
  type = string
}

variable "k8s_instance_type" {
  type = string
}

variable "k8s_node_count" {
  type = number
}

variable "k8s_node_min_count" {
  type = number
}

variable "k8s_node_max_count" {
  type = number
}

variable "backup_retention_period" {
  type = number
}

variable "falkordb_version" {
  type = string
}

variable "falkordb_cpu" {
  type = string
}

variable "falkordb_memory" {
  type = string
}

variable "persistance_size" {
  type = string
}

variable "falkordb_replicas" {
  type = number
}

variable "grafana_admin_password" {
  type = string
}

variable "backup_schedule" {
  type = string
}

variable "falkordb_domain" {
  type = string
}

variable "falkordb_hosted_zone_id" {
  type = string
}