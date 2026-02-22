# LDAP User Import Script

This script imports users into LDAP for FalkorDB instances via the customer-ldap API.

## Usage

```bash
python3 scripts/import_users_ldap.py \
  --csv-file users.csv \
  --api-url https://customer-ldap.dev.falkordb.cloud \
  --session-cookie "your-session-cookie-value" \
  [--dry-run] \
  [--verbose]
```

## Arguments

- `--csv-file` (required): Path to CSV file containing user data
- `--api-url` (required): Base URL of the customer-ldap API
  - Dev: `https://customer-ldap.dev.falkordb.cloud`
  - Prod: `https://customer-ldap.falkordb.cloud`
- `--session-cookie` (optional): Session cookie for authentication
  - Cookie name: `api.falkordb.cloud_customer-ldap-session`
  - Obtain from browser after logging into FalkorDB Cloud
- `--dry-run` (optional): Validate CSV without creating users
- `--verbose` (optional): Enable debug logging

## CSV Format

The CSV file must contain the following columns:

| Column | Description | Requirements |
|--------|-------------|--------------|
| `instance_id` | FalkorDB instance ID (namespace) | Required |
| `username` | Username to create | Required, min 3 characters |
| `password` | User password | Required, min 6 characters |
| `acl` | ACL permissions string | Required |

### Example CSV

```csv
instance_id,username,password,acl
my-instance-123,testuser1,testpass123,~* +@all
my-instance-123,testuser2,testpass456,~* +graph.QUERY +graph.RO_QUERY +INFO +PING
my-instance-456,adminuser,adminpass789,~* +@all
my-instance-456,readonly,readpass123,~* +graph.RO_QUERY +INFO +PING
```

See `scripts/import_users_ldap.example.csv` for a full example.

## ACL Permissions

The ACL (Access Control List) defines what commands a user can execute. Common patterns:

### Standard Access (Recommended)
```
~* +INFO +CLIENT +DBSIZE +PING +HELLO +AUTH +RESTORE +DUMP +DEL +EXISTS +UNLINK +TYPE +FLUSHALL +TOUCH +EXPIRE +PEXPIREAT +TTL +PTTL +EXPIRETIME +RENAME +RENAMENX +SCAN +DISCARD +EXEC +MULTI +UNWATCH +WATCH +ECHO +SLOWLOG +WAIT +WAITAOF +READONLY +GRAPH.INFO +GRAPH.LIST +GRAPH.QUERY +GRAPH.RO_QUERY +GRAPH.EXPLAIN +GRAPH.PROFILE +GRAPH.DELETE +GRAPH.CONSTRAINT +GRAPH.SLOWLOG +GRAPH.BULK +GRAPH.CONFIG +GRAPH.COPY +CLUSTER +COMMAND +GRAPH.MEMORY +MEMORY +BGREWRITEAOF +MODULE|LIST
```
This is the standard ACL used by the system (matches ALLOWED_ACL constant). Grants access to all keys and all whitelisted commands.

You can also reference it with a placeholder in your code:
```python
from constants import ALLOWED_ACL
acl = f"~* {ALLOWED_ACL}"
```

### Read-Only Access
```
~* +graph.RO_QUERY +graph.INFO +graph.LIST +INFO +PING
```
Grants access to all keys but only read-only graph queries and info commands.

### Custom Access
```
~* +graph.QUERY +graph.RO_QUERY +graph.DELETE +INFO +PING
```
Grants access to specific graph commands.

### Available Commands

The allowed commands are defined in the customer-ldap service (`ALLOWED_ACL` constant). All created users will automatically have access to these commands:

**Graph Commands:**
- `+graph.QUERY` - Graph queries (read/write)
- `+graph.RO_QUERY` - Graph read-only queries
- `+graph.DELETE` - Delete graphs
- `+graph.EXPLAIN` - Query execution plans
- `+graph.PROFILE` - Query profiling
- `+graph.CONSTRAINT` - Constraint management
- `+graph.SLOWLOG` - Slow query log
- `+graph.BULK` - Bulk operations
- `+graph.CONFIG` - Configuration
- `+graph.COPY` - Copy operations
- `+graph.INFO` - Graph information
- `+graph.LIST` - List graphs
- `+graph.MEMORY` - Memory statistics

**Redis Commands:**
- `+INFO`, `+PING`, `+ECHO` - Server info and connectivity
- `+CLIENT`, `+DBSIZE` - Client and database operations
- `+AUTH`, `+HELLO` - Authentication
- `+DEL`, `+EXISTS`, `+UNLINK`, `+TYPE` - Key operations
- `+EXPIRE`, `+PEXPIREAT`, `+TTL`, `+PTTL`, `+EXPIRETIME` - Expiration
- `+RENAME`, `+RENAMENX`, `+SCAN` - Key management
- `+MULTI`, `+EXEC`, `+DISCARD`, `+WATCH`, `+UNWATCH` - Transactions
- `+FLUSHALL`, `+TOUCH` - Database operations
- `+RESTORE`, `+DUMP` - Persistence
- `+SLOWLOG`, `+WAIT`, `+WAITAOF`, `+READONLY` - Monitoring and replication
- `+CLUSTER`, `+COMMAND`, `+MEMORY`, `+MODULE|LIST` - Cluster and system
- `+BGREWRITEAOF` - Background rewrite AOF
- `+MONITOR` - Command monitoring (use with caution - can expose sensitive data)

**Note:** The ACL prefix `~*` grants access to all key patterns. You can restrict key access by using different patterns like `~prefix:*` to only allow keys starting with "prefix:".

For the complete list, see `backend/services/customer-ldap/src/constants.ts` (ALLOWED_ACL constant).

## Authentication

The script requires authentication to the customer-ldap API. You can provide a session cookie:

1. Log into FalkorDB Cloud in your browser
2. Open browser DevTools → Application/Storage → Cookies
3. Find cookie: `api.falkordb.cloud_customer-ldap-session`
4. Copy the cookie value
5. Pass it to the script via `--session-cookie`

**Note**: Session cookies expire after 15 minutes. You may need to refresh the cookie if the script runs for a long time.

## Examples

### Dry Run (Validation Only)

```bash
python3 scripts/import_users_ldap.py \
  --csv-file users.csv \
  --api-url https://customer-ldap.dev.falkordb.cloud \
  --dry-run
```

### Import Users to Dev Environment

```bash
python3 scripts/import_users_ldap.py \
  --csv-file users.csv \
  --api-url https://customer-ldap.dev.falkordb.cloud \
  --session-cookie "eyJhbGc..."
```

### Import Users to Prod Environment

```bash
python3 scripts/import_users_ldap.py \
  --csv-file users.csv \
  --api-url https://customer-ldap.falkordb.cloud \
  --session-cookie "eyJhbGc..." \
  --verbose
```

## Error Handling

The script handles common scenarios:

- **Validation Errors**: Skipped users are logged with details
- **Duplicate Users**: If a user already exists (HTTP 409), it's logged as a warning but counted as success
- **Network Errors**: Connection failures are logged and counted as failures
- **Authentication Errors**: HTTP 401/403 errors indicate invalid or expired session cookie

## Exit Codes

- `0` - Success (all users created or already exist)
- `1` - Failure (one or more users failed to create)

## Output

The script logs:
- Each user creation attempt
- Validation failures
- Network errors
- Final summary statistics

Example output:

```
2026-02-22 16:30:00 - INFO - Starting import from users.csv
2026-02-22 16:30:00 - INFO - Successfully created user 'testuser1' in instance 'my-instance-123'
2026-02-22 16:30:01 - WARNING - User 'testuser2' already exists in instance 'my-instance-123'
2026-02-22 16:30:02 - INFO - Successfully created user 'adminuser' in instance 'my-instance-456'
2026-02-22 16:30:03 - INFO - Successfully created user 'readonly' in instance 'my-instance-456'
2026-02-22 16:30:03 - INFO - --------------------------------------------------
2026-02-22 16:30:03 - INFO - Import Summary:
2026-02-22 16:30:03 - INFO -   Success: 4
2026-02-22 16:30:03 - INFO -   Failed:  0
2026-02-22 16:30:03 - INFO -   Skipped: 0
2026-02-22 16:30:03 - INFO - --------------------------------------------------
```

## Troubleshooting

### "401 Unauthorized" or "403 Forbidden"

Your session cookie has expired or is invalid. Obtain a fresh cookie from the browser.

### "Failed to create user: HTTP 400"

Check the CSV data for validation errors. Common issues:
- Username too short (< 3 characters)
- Password too short (< 6 characters)
- Missing required fields
- Invalid ACL syntax

### "Connection refused" or "Network error"

Verify the API URL is correct and accessible. Check your network connection.

### "Instance not found"

The instance_id may be incorrect or the instance may not exist. Verify instance IDs with the Omnistrate API or FalkorDB Cloud dashboard.

## Security Considerations

- **Passwords**: The CSV file contains plaintext passwords. Store it securely and delete after import.
- **Session Cookies**: Session cookies provide full API access. Keep them confidential.
- **ACL Restrictions**: Always use the principle of least privilege. Grant only necessary permissions.
- **Git**: Do NOT commit CSV files with real credentials to Git. Add `*.csv` to `.gitignore` if needed.

## Related Files

- Script: `scripts/import_users_ldap.py`
- Example CSV: `scripts/import_users_ldap.example.csv`
- Customer LDAP Service: `backend/services/customer-ldap/`
- API Routes: `backend/services/customer-ldap/src/routes/v1/instances/`
