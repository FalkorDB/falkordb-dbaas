
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
      last_period_amount = bool
      specified_amount   = number
    }))
    thresholds = list(object({
      percentage = number
      amount     = number
    }))
    filters = list(object({
      credit_types = list(string)
      services     = list(string)
      projects     = list(string)
      labels       = list(string)
    }))
  }))
}
