variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "cluster_endpoint" {
  type = string
}

variable "cluster_ca_certificate" {
  type = string
}

variable "cluster_name" {
  type = string
}

variable "github_organization" {
  type    = string
  default = "FalkorDB"
}

variable "github_repository" {
  type    = string
  default = "falkordb-observability-cluster"
}