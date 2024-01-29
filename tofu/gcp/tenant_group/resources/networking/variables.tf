variable "project_id" {
  type = string
}

variable "tenant_group_name" {
  type = string
}

variable "region" {
  type = string
}

variable "subnet_cidr" {
  type = string
}

variable "subnet_proxy_only_cidr" {
  type = string
}

variable "tenant_group_size" {
  type = number
}

variable "ip_range_pods" {
  type = string
}

variable "ip_range_services" {
  type = string
}
variable "deployment_port" {
  type = number 
}