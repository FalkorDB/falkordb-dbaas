
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

variable "vpc_name" {
  type = string
}

variable "cluster_name" {
  type = string
}

variable "health_check_name" {
  type = string
}

variable "ip_address_name" {
  type = string
}

variable "tenant_name" {
  type = string
}

variable "backup_bucket_name" {
  type = string
}

variable "falkordb_version" {
  type = string
}

variable "falkordb_password" {
  type      = string
  sensitive = true
  nullable  = true
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
variable "backup_schedule" {
  type    = string
  default = "0 0 * * *"
}

variable "exposed_port" {
  type = number
  validation {
    condition     = var.exposed_port >= 30000 && var.exposed_port <= 32767
    error_message = "Exposed port must be between 30000 and 32767"
  }
}
variable "dns_zone_name" {
  type = string
}
variable "dns_name" {
  type = string
}
