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

variable "vpc_name" {
  type    = string
}

variable "subnet_name" {
  type    = string
}

variable "cluster_name" {
  type = string
}


variable "tenant_group_name" {
  type = string
}

variable "tenant_name" {
  type = string
}

variable "tenant_namespace" {
  type = string
}

variable "deployment_name" {
  type = string
}

variable "deployment_image" {
  type    = string
  default = "redis:latest"
}

variable "deployment_port" {
  type    = number
  default = 6379
}

variable "deployment_service_name" {
  type = string
}

variable "deployment_neg" {
  type = string
}

variable "exposed_port" {
  type    = number
  default = 30000

  validation {
    condition     = var.exposed_port >= 30000 && var.exposed_port <= 32767
    error_message = "Exposed port must be between 30000 and 32767"
  }
}

locals {
  tenant_namespace        = "${var.tenant_name}-ns"
  deployment_name         = "${var.tenant_name}-deployment"
  deployment_service_name = "${var.tenant_name}-service"
  deployment_neg          = "${var.tenant_name}-neg"
}
