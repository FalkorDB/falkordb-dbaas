variable "project_id" {
  type        = string
  description = "GCP project ID of the control-plane project."
}

variable "region" {
  type        = string
  description = "GCP region for all control-plane infrastructure resources."
}

variable "zones" {
  type        = list(string)
  description = "GCP zones within the region for GKE node pool placement."
}

variable "ip_range_subnet" {
  type        = string
  description = "CIDR range for the primary VPC subnet."
}

variable "ip_range_pods" {
  type        = string
  description = "Secondary CIDR range for GKE pod IPs."
}

variable "ip_range_services" {
  type        = string
  description = "Secondary CIDR range for GKE service cluster IPs."
}

variable "default_max_pods_per_node" {
  type        = number
  default     = 25
  description = "Maximum number of pods per GKE node. Controls IP aliasing density."
}

variable "db_exporter_sa_id" {
  type        = string
  description = "Unique account ID (not email) for the db-exporter service account to create."
}

variable "omnistrate_service_id" {
  type        = string
  description = "Omnistrate service ID used to tag the alert-reaction workflow."
}

variable "omnistrate_environment_id" {
  type        = string
  description = "Omnistrate environment ID used to tag the alert-reaction workflow."
}

variable "spoke_nat_cidrs" {
  type        = list(string)
  description = "NAT gateway CIDRs of spoke clusters allowed to reach the Wazuh Manager. Each entry should be a /32 or CIDR of the spoke's NAT IP."
  default     = []
}
