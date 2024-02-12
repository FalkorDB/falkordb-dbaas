variable "deployment_name" {
  type = string
}

variable "allow_ports_pod" {
  type    = list(string)
  default = []
}

variable "cidr_block" {
  type = string
}