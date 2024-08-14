
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

variable "budgets" {
  type = set(object({
    name = string
    amounts = list(object({
      last_period_amount = optional(bool)
      specified_amount   = optional(number)
    }))
    thresholds = list(object({
      percentage  = number
      spend_basis = optional(string, "CURRENT_SPEND")
    }))
    filters = optional(list(object({
      credit_types = list(string)
      services     = list(string)
      projects     = list(string)
      labels       = list(string)
    })), [])
  }))
}
