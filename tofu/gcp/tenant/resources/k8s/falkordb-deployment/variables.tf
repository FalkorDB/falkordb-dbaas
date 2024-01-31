variable "tenant_name" {
  type = string
}

variable "falkordb_version" {
  type = string
}

variable "falkordb_password" {
  type      = string
  sensitive = true
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

variable "deployment_port" {
  type    = number
  default = 6379
}

variable "deployment_neg_name" {
  type = string
}

variable "deployment_namespace" {
  type = string
}
variable "deployment_monitoring_namespace" {
  type = string
}
