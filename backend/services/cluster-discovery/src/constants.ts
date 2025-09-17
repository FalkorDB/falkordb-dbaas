
export const ARGOCD_NAMESPACE = 'argocd';

export const AWS_CREDENTIALS_SECRET_NAME = "aws-profile"

export const PAGERDUTY_INTEGRATION_KEY_SECRET_NAME = "pagerduty-service-key"
export const PAGERDUTY_INTEGRATION_KEY_SECRET_NAMESPACE = "observability"
export const PAGERDUTY_INTEGRATION_KEY_SECRET_KEY = "api-key"

export const VMUSER_SECRET_NAMESPACE = "observability"
export const VMUSER_SOURCE_SECRET_NAME = (clusterId: string) => `${clusterId}-vmuser`
export const VMUSER_TARGET_SECRET_NAME = "vmuser" 
