variable "project" {
  type = string
}

variable "region" {
  type    = string
  default = "me-west1"
}

variable "zone" {
  type    = string
  default = "me-west1-a"
}

variable "tenant_group_name" {
  type    = string
}

variable "vpc_name" {
  type    = string
}

variable "subnet_name" {
  type    = string
}

variable "subnet_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "subnet_proxy_only_cidr_range" {
  type    = string
  default = "11.0.0.0/16"
}

variable "secondary_ip_range" {
  type = string
  default = "value"
}

variable "tenant_group_size" {
  type    = number
  default = 20
}

variable "cluster_name" {
  type    = string
}

variable "node_pool_machine_type" {
  type    = string
  default = "e2-medium"
}

variable "node_pool_disk_size" {
  type    = number
  default = 20
}


locals {
  vpc_name = "${var.tenant_group_name}-vpc"
  subnet_name = "${var.tenant_group_name}-subnet"
  cluster_name = "${var.tenant_group_name}-cluster"
}