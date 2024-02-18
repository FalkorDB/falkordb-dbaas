variable "deployment_namespace" {
  type = string
}

variable "deployment_name" {
  type = string
}

variable "label_update_frequency" {
  type    = number
  default = 5
}

variable "headless_name" {
  type    = string
  default = "falkordb-redis-headless"
}

variable "sentinel_port" {
  type = number
}
