# LDAP User Import Script

This script imports users into LDAP for FalkorDB instances by fetching instance data from the Omnistrate API.

## Workflow

1. **Authenticate with Omnistrate API** using email/password credentials
2. **Retrieve all instances** for a specified service, environment, and optionally product tier
3. **Extract credentials** from each instance's `result_params`:
   - `falkordbUser` (username)
   - `falkordbPassword` (password)
4. **Create LDAP users** via the customer-ldap API with standard ALLOWED_ACL permissions

## Usage

```bash
python3 scripts/import_users_ldap.py \
  --omnistrate-email user@example.com \
  --omnistrate-password "password123" \
  --omnistrate-service-id "service-abc-123" \
  --omnistrate-environment-id "env-xyz-456" \
  --product-tier "FalkorDB Cloud" \
  --ldap-api-url https://customer-ldap.dev.falkordb.cloud \
  --gcp-service-account-email "sa@project.iam.gserviceaccount.com" \
  [--dry-run] \
  [--verbose]
```

## Arguments

### Required Arguments

- `--omnistrate-email`: Omnistrate account email for API authentication
- `--omnistrate-password`: Omnistrate account password
- `--omnistrate-service-id`: Omnistrate service ID (identifies the FalkorDB service)
- `--omnistrate-environment-id`: Omnistrate environment ID (e.g., dev, staging, prod)
- `--ldap-api-url`: Base URL of the customer-ldap API
  - Dev: `https://customer-ldap.dev.falkordb.cloud`
  - Prod: `https://customer-ldap.falkordb.cloud`

### Optional Arguments

- `--product-tier`: Filter instances by product tier name (e.g., "FalkorDB Cloud", "FalkorDB Enterprise")
  - If omitted, processes all instances regardless of tier
- `--gcp-service-account-email`: GCP service account email to impersonate for authentication
  - Required for authentication with the customer-ldap API
  - The script will use Application Default Credentials to impersonate this service account
  - Sets `x-auth-mode: gcp-sa` header for GCP service account authentication
- `--dry-run`: Validate and show what would be done without creating users
- `--verbose`: Enable debug logging for troubleshooting

## How It Works

### 1. Fetch Instances from Omnistrate

The script connects to Omnistrate API and retrieves instances in a single call:

```
GET /2022-09-01-00/fleet/service/{serviceId}/environment/{environmentId}/instances
  → Returns all instances for the service/environment
  → Subscription ID is included in each instance body
  → Optionally filters by product tier in Python code
```

### 2. Extract Instance Credentials

For each instance, the script extracts:

```json
{
  "consumptionResourceInstanceResult": {
    "id": "my-instance-123",
    "result_params": {
      "falkordbUser": "admin",
      "falkordbPassword": "securepassword123"
    }
  }
}
```

### 3. Create LDAP Users

For each instance with valid credentials, creates an LDAP user:

```
POST /v1/instances/{instanceId}
{
  "username": "admin",
  "password": "securepassword123",
  "acl": "~* +INFO +CLIENT +DBSIZE +PING +HELLO +AUTH ... +MONITOR"
}
```

The ACL matches the `ALLOWED_ACL` constant from `backend/services/customer-ldap/src/constants.ts`.

## ACL Permissions

All users are created with the standard `ALLOWED_ACL` permissions:

```
~* +INFO +CLIENT +DBSIZE +PING +HELLO +AUTH +RESTORE +DUMP +DEL +EXISTS +UNLINK +TYPE +FLUSHALL +TOUCH +EXPIRE +PEXPIREAT +TTL +PTTL +EXPIRETIME +RENAME +RENAMENX +SCAN +DISCARD +EXEC +MULTI +UNWATCH +WATCH +ECHO +SLOWLOG +WAIT +WAITAOF +READONLY +GRAPH.INFO +GRAPH.LIST +GRAPH.QUERY +GRAPH.RO_QUERY +GRAPH.EXPLAIN +GRAPH.PROFILE +GRAPH.DELETE +GRAPH.CONSTRAINT +GRAPH.SLOWLOG +GRAPH.BULK +GRAPH.CONFIG +GRAPH.COPY +CLUSTER +COMMAND +GRAPH.MEMORY +MEMORY +BGREWRITEAOF +MODULE|LIST +MONITOR
```

This grants:
- **Key access**: `~*` (all keys)
- **Commands**: All whitelisted FalkorDB and Redis commands
- **Graph operations**: Query, read-only query, delete, explain, profile, constraints, etc.
- **Redis operations**: Info, client management, key operations, transactions, persistence, etc.

## Authentication

### Omnistrate API Authentication

The script authenticates with Omnistrate using email/password:

```
POST https://api.omnistrate.cloud/2022-09-01-00/signin
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response includes a JWT token used for subsequent API calls.

### Customer-LDAP API Authentication

The customer-ldap API uses GCP service account impersonation for authentication:

1. **Provide GCP Service Account Email**: Pass the service account email via `--gcp-service-account-email`
2. **Impersonation**: The script uses Application Default Credentials (ADC) to impersonate the service account
3. **Token Generation**: Gets an access token for the impersonated service account
4. **Authentication Header**: Sets `x-auth-mode: gcp-sa` header to indicate GCP service account authentication mode
5. **Authorization**: Passes the token in the `Authorization: Bearer {token}` header

**Prerequisites**:
- `google-auth` Python library installed: `pip install google-auth`
- Application Default Credentials configured (e.g., via `gcloud auth application-default login`)
- IAM permissions to impersonate the target service account

## Examples

### Dry Run (Validation Only)

```bash
python3 scripts/import_users_ldap.py \
  --omnistrate-email admin@falkordb.com \
  --omnistrate-password "mypassword" \
  --omnistrate-service-id "srv_12345" \
  --omnistrate-environment-id "env_prod" \
  --ldap-api-url https://customer-ldap.falkordb.cloud \
  --dry-run
```

### Import Users for All Product Tiers

```bash
python3 scripts/import_users_ldap.py \
  --omnistrate-email admin@falkordb.com \
  --omnistrate-password "mypassword" \
  --omnistrate-service-id "srv_12345" \
  --omnistrate-environment-id "env_prod" \
  --ldap-api-url https://customer-ldap.falkordb.cloud \
  --gcp-service-account-email "ldap-importer@project.iam.gserviceaccount.com"
```

### Import Users for Specific Product Tier

```bash
python3 scripts/import_users_ldap.py \
  --omnistrate-email admin@falkordb.com \
  --omnistrate-password "mypassword" \
  --omnistrate-service-id "srv_12345" \
  --omnistrate-environment-id "env_prod" \
  --product-tier "FalkorDB Cloud" \
  --ldap-api-url https://customer-ldap.falkordb.cloud \
  --gcp-service-account-email "ldap-importer@project.iam.gserviceaccount.com" \
  --verbose
```

### Import to Dev Environment

```bash
python3 scripts/import_users_ldap.py \
  --omnistrate-email admin@falkordb.com \
  --omnistrate-password "mypassword" \
  --omnistrate-service-id "srv_12345" \
  --omnistrate-environment-id "env_dev" \
  --ldap-api-url https://customer-ldap.dev.falkordb.cloud \
  --gcp-service-account-email "ldap-importer@project.iam.gserviceaccount.com"
```

## Error Handling

The script handles common scenarios:

- **Missing Credentials**: Instances without `falkordbUser` or `falkordbPassword` are skipped
- **Duplicate Users**: If a user already exists (HTTP 409), it's logged as a warning but counted as success
- **Network Errors**: Connection failures are logged and counted as failures
- **Authentication Errors**: HTTP 401/403 errors indicate invalid credentials or expired session cookie
- **Omnistrate API Errors**: Any API failures during instance fetching will abort the script

## Output

### Example Output with Detailed Reporting

```
2026-02-23 08:00:00 - INFO - Authenticating with Omnistrate API
2026-02-23 08:00:01 - INFO - Successfully authenticated with Omnistrate API
2026-02-23 08:00:01 - INFO - Starting import process
2026-02-23 08:00:01 - INFO - Fetching instances for service srv_12345, environment env_prod
2026-02-23 08:00:02 - INFO - Found 5 subscriptions
2026-02-23 08:00:03 - INFO - Found 12 total instances
2026-02-23 08:00:04 - INFO - Successfully created user 'admin' in instance 'instance-001'
2026-02-23 08:00:05 - WARNING - User 'admin' already exists in instance 'instance-002'
2026-02-23 08:00:06 - INFO - Successfully created user 'dbuser' in instance 'instance-003'
2026-02-23 08:00:07 - WARNING - Instance instance-004: Missing falkordbUser in result_params, skipping
2026-02-23 08:00:08 - INFO - Successfully created user 'admin' in instance 'instance-005'
...
2026-02-23 08:00:20 - INFO - ======================================================================
2026-02-23 08:00:20 - INFO - IMPORT REPORT
2026-02-23 08:00:20 - INFO - ======================================================================
2026-02-23 08:00:20 - INFO - Total Instances: 12
2026-02-23 08:00:20 - INFO -   ✓ Success: 10
2026-02-23 08:00:20 - INFO -   ✗ Failed:  0
2026-02-23 08:00:20 - INFO -   ⊘ Skipped: 2
2026-02-23 08:00:20 - INFO - ======================================================================
2026-02-23 08:00:20 - INFO -
2026-02-23 08:00:20 - INFO - SUCCESSFUL IMPORTS:
2026-02-23 08:00:20 - INFO - ----------------------------------------------------------------------
2026-02-23 08:00:20 - INFO -   ✓ instance-001                           | user: admin
2026-02-23 08:00:20 - INFO -   ✓ instance-002                           | user: admin
2026-02-23 08:00:20 - INFO -   ✓ instance-003                           | user: dbuser
2026-02-23 08:00:20 - INFO -   ✓ instance-005                           | user: admin
...
2026-02-23 08:00:20 - INFO -
2026-02-23 08:00:20 - INFO - SKIPPED INSTANCES:
2026-02-23 08:00:20 - INFO - ----------------------------------------------------------------------
2026-02-23 08:00:20 - INFO -   ⊘ instance-004
2026-02-23 08:00:20 - INFO -     Reason: Missing falkordbUser in result_params
2026-02-23 08:00:20 - INFO -   ⊘ instance-007
2026-02-23 08:00:20 - INFO -     Reason: Missing falkordbPassword in result_params
2026-02-23 08:00:20 - INFO -
2026-02-23 08:00:20 - INFO - ======================================================================
```

The script provides a comprehensive report including:
- **Summary statistics**: Total instances processed, success/failure/skipped counts
- **Successful imports**: List of all instances where users were created successfully
- **Failed imports**: List of failures with error reasons
- **Skipped instances**: List of instances that couldn't be processed with detailed reasons

## Exit Codes

- `0` - Success (all users created or already exist)
- `1` - Failure (one or more users failed to create, or Omnistrate API error)

## Troubleshooting

### "Failed to authenticate with Omnistrate"

Your Omnistrate credentials are invalid or the API is unreachable. Verify:
- Email and password are correct
- You have access to the Omnistrate account
- Network connectivity to `api.omnistrate.cloud`

### "Failed to get GCP service account token"

Issues with GCP service account impersonation. Check:
- `google-auth` library is installed: `pip install google-auth`
- Application Default Credentials are configured: `gcloud auth application-default login`
- You have the `roles/iam.serviceAccountTokenCreator` role on the target service account
- The service account email is correct

### "401 Unauthorized" or "403 Forbidden" (LDAP API)

Authentication with the LDAP API failed. Verify:
- GCP service account email is correct
- The impersonated service account has necessary permissions
- The `x-auth-mode: gcp-sa` header is being set correctly

### "Instance missing falkordbUser or falkordbPassword"

The instance's `result_params` doesn't contain the required credentials. This can happen for:
- Newly created instances that haven't been fully provisioned
- Instances in error state
- Old instances from before credentials were added to result_params

These instances are safely skipped.

### "Failed to fetch instances from Omnistrate"

Check:
- Service ID and Environment ID are correct
- You have permission to access those resources in Omnistrate
- Network connectivity is working

## Security Considerations

- **Omnistrate Credentials**: Store securely, never commit to git
- **GCP Service Account**: Use dedicated service account with minimal required permissions
- **Passwords**: Instance credentials are extracted from Omnistrate and sent to LDAP API over HTTPS
- **ACL Restrictions**: All users get the same standard ACL. Customize if needed for different security profiles.

## Related Files

- Script: `scripts/import_users_ldap.py`
- Documentation: `scripts/import_users_ldap.README.md`
- Customer LDAP Service: `backend/services/customer-ldap/`
- API Routes: `backend/services/customer-ldap/src/routes/v1/instances/`
- Constants: `backend/services/customer-ldap/src/constants.ts` (ALLOWED_ACL)
