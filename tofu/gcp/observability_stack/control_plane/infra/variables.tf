variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "ip_range_subnet" {
  type = string
}

variable "ip_range_pods" {
  type = string
}

variable "ip_range_services" {
  type = string
}

variable "default_max_pods_per_node" {
  type    = number
  default = 25
}
