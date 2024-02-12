variable "deployment_name" {
  type = string
}

variable "deployment_namespace" {
  type = string
}

variable "allow_ports_pod" {
  type    = list(string)
  default = []
}

variable "cidr_blocks" {
  type    = list(string)
  default = []
}
