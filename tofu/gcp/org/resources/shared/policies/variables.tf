variable "org_id" {
  type = string
}

variable "domains_to_allow" {
  type = list(string)
}

variable "enforce_policies" {
  type = bool
}