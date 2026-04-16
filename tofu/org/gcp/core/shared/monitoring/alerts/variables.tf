
variable "project_id" {
  type = string
}

variable "monitored_projects" {
  type    = set(string)
  default = []
}

variable "email_addresses" {
  type = set(string)
}