
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
