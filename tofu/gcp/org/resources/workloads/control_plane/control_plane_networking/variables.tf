
variable "project_id" {
  type = string
}

variable "public_network_name" {
  type = string
}

variable "public_network_subnets" {
  type = set(
    object({
      name   = string
      region = string
      cidr   = string
    })
  )
}