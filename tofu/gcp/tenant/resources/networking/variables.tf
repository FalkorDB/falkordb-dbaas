variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "tenant_name" {
  type = string
}

variable "vpc_name" {
  type = string
}

variable "deployment_neg_name" {
  type = string
}

variable "health_check_name" {
  type = string
}

variable "ip_address_name" {
  type = string
}

variable "exposed_port" {
  type = number
}

variable "source_ip_ranges" {
  type = list(string)
}

variable "max_connections_per_endpoint" {
  type    = number
  default = 9999
}
