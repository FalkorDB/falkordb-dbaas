
###### PROJECT ######

variable "org_id" {
    type = string
}
variable "project_id" {
    type = string
}

variable "project_name" {
    type = string
}

variable "project_parent_id" {
    type = string
}

variable "billing_account_id" {
    type = string
}

variable "state_bucket_name" {
  type = string  
}

###### NETWORKING ######

variable "public_network_name" {
    type = string
}

variable "public_network_subnets" {
    type = set(
        object({
            name = string
            region = string
            cidr = string
        })
    )
}