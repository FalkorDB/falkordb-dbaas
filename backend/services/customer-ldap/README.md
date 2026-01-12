# Customer LDAP Service

A production-ready control plane backend service that manages LDAP users across multiple application planes in the FalkorDB DBaaS infrastructure.

## Overview

This service provides a unified API for managing LDAP users on different application plane LDAP servers. It handles authentication, authorization, establishes secure connections to application plane Kubernetes clusters, and processes Omnistrate lifecycle webhooks to automatically provision and deprovision users.

## Features

- **Multi-Cloud Support**: Works with both GCP and AWS Kubernetes clusters
- **Secure Authentication**: Validates requests against Omnistrate API with JWT session cookies
- **Session Management**: Issues JWT session cookies (15-minute validity) to avoid repeated Omnistrate API calls
- **Connection Caching**: Caches K8s port forward connections per instance with health validation
- **Role-Based Access Control**: Supports reader (list only) and writer (full CRUD) permissions
- **K8s Port Forwarding**: Securely connects to LDAP servers through Kubernetes API
- **Omnistrate Webhooks**: Automated user provisioning on instance creation/deletion
- **API Versioning**: All endpoints versioned under `/v1/` for future compatibility
- **Health Checks**: Kubernetes-ready liveness and readiness probes
- **Production Ready**: Graceful shutdown, rollback transactions, connection health validation, PII masking

## Architecture

### Components

1. **Repositories**
   - `OmnistrateRepository`: Authenticates tokens and retrieves instance details
   - `K8sRepository`: Manages Kubernetes configuration and port forwarding
   - `LdapRepository`: Communicates with LDAP server API
   - `SessionRepository`: Manages JWT session cookies
   - `ConnectionCacheRepository`: Caches K8s port forward connections (15-minute TTL)
   - `LdapService`: Wraps LDAP operations with ACL validation

3. **Routes** (All under `/v1/`)
   - **Health Checks**
     - `GET /v1/health` - Liveness probe
     - `GET /v1/readiness` - Readiness probe
   
   - **User Mana (User Management)

1. Client sends request with Omnistrate JWT token (or session cookie if available)
2. If session cookie exists and is valid, skip to step 6
3. Validate token against Omnistrate API
4. Check user's subscription role (root/writer/reader)
5. Create session cookie and set it in response
6. Retrieve instance details (cloud provider, region, cluster) from session
7. Check connection cache for existing K8s port forward (cache key: instanceId)
8. Validate cached connection health (3-second timeout check)
9. If cache miss or unhealthy: Establish K8s connection and create port forward to LDAP pod, then cache it
10. If cache hit and healthy: Reuse existing port forward connection
11. Execute LDAP operation with automatic rollback on failure
12. Return result (connection remains open in cache for 15 minutes)

### Webhook Flow (Instance Lifecycle)

**Instance Created:**
1. Omnistrate sends webhook to `/v1/omnistrate/instance-created`
2. Authenticate webhook using `OMNISTRATE_WEBHOOK_SECRET` bearer token
3. Fetch instance details from Omnistrate API
4. Extract FalkorDB credentials from `resultParams`
5. Create LDAP user with allowed ACL permissions
6. Returns 200 (idempotent), 201 (created), 503 (retry), or 500 (error)

**Instance Deleted:**
1. Omnistrate sends webhook to `/v1/omnistrate/instance-deleted`
2. Authenticate webhook using `OMNISTRATE_WEBHOOK_SECRET` bearer token
3. Fetch instance details from Omnistrate API
4. List and delete all users for the instance
5. Always returns 200 (inconsistent state acceptable)

### Request Flow

1. Client sends request with Omnistrate JWT token (or session cookie if available)
2. If session cookie exists and is valid, skip to step 6
3. Validate token against Omnistrate API
4. Check user's subscription role (root/writer/reader)
5. Create session cookie and set it in response
6. Retrieve instance details (cloud provider, region, cluster) from session
7. Check connection cache for existing K8s port forward (cache key: instanceId)
8. Validate cached connection health (3-second timeout check)
9. If cache miss or unhealthy: Establish K8s connection and create port forward to LDAP pod, then cache it
10. If cache hit and healthy: Reuse existing port forward connection
11. Execute LDAP operation with automatic rollback on failure
12. Return result (connection remains open in cache for 15 minutes)

## API Documentation

### Authentication

All requests require either:
- **Authorization header**: `Bearer <omnistrate-jwt-token>`
- **Session cookie**: `ldap-session` (automatically set after first successful request)

### Endpoints

### Health Checks

### Health Checks

```
GET /v1/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-12T08:00:00.000Z"
}
```

```
GET /v1/readiness
```

**Response:**
```json
{
  "status": "ready",
  "timestamp": "2026-01-12T08:00:00.000Z"
}
```

#### List Users

#### List Users

```
GET /v1/instances/:instanceId/users?subscriptionId=<subscription-id>
```

**Response:**
```json
{
  "users": [
    {
      "username": "user1",
      "acl": "rw"
    },
    {
      "username": "user2",
      "acl": "r"
    }
  ]
}
```

#### Create User
#### Create User

```
POST /v1/instances/:instanceId/users?subscriptionId=<subscription-id>
```

**Request Body:**
```json
{
  "username": "newuser",
  "password": "securepassword",
  "acl": "rw"
}
```

**Response:**
```json
{
  "message": "User created successfully"
}
```

#### Update User

```
PATCH /v1/instances/:instanceId/users/:username?subscriptionId=<subscription-id>
```

**Request Body:**
```json
{
  "password": "newpassword",
  "acl": "r"
}
```

**Response:**
```json
{
  "message": "User modified successfully"
}
```

#### Delete User

```
DELETE /v1/instances/:instanceId/users/:username?subscriptionId=<subscription-id>
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

#### Omnistrate Webhooks

##### Instance Created

```
POST /v1/omnistrate/instance-created
Authorization: Bearer <OMNISTRATE_WEBHOOK_SECRET>
```

**Request Body:**
```json
{
  "instanceId": "inst-123",
  "subscriptionId": "sub-456"
}
```

**Response (201):**
```json
{
  "message": "User created successfully"
}
```

**Response (200 - Idempotent):**
```json
{
  "message": "User already exists"
}
```

##### Instance Deleted

```
POST /v1/omnistrate/instance-deleted
Authorization: Bearer <OMNISTRATE_WEBHOOK_SECRET>
```

**Request Body:**
```json
{
  "instanceId": "inst-123",
  "subscriptionId": "sub-456"
}
```

**Response (200):**
```json
{
  "message": "User deletion completed",
  "deletedCount": 3,
  "failedCount": 0
}
```

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `NODE_ENV` | No | Environment (development/production/test) | `development` |
| `PORT` | No | Server port | `3013` |
| `OMNISTRATE_EMAIL` | Yes | Omnistrate API email | - |
| `OMNISTRATE_PASSWORD` | Yes | Omnistrate API password | - |
| `OMNISTRATE_SERVICE_ID` | Yes | Omnistrate service ID | - |
| `OMNISTRATE_ENVIRONMENT_ID` | Yes | Omnistrate environment ID | - |
| `OMNISTRATE_WEBHOOK_SECRET` | Yes | Secret for authenticating Omnistrate webhooks | - |
| `JWT_SECRET` | Yes | Secret key for signing session cookies | - |
| `APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT` | No | GCP project ID for application planes | - |
| `AWS_TARGET_AUDIENCE` | No | AWS target audience for authentication | - |
| `AWS_ROLE_ARN` | No | AWS role ARN for authentication | - |
| `SERVICE_NAME` | No | Service name | `customer-ldap` |
| `CORS_ORIGINS` | No | CORS origins (comma-separated or `*`) | `*` |
| `REQUEST_TIMEOUT_MS` | No | Global request timeout | `30000` |
| `LDAP_CONNECTION_TIMEOUT_MS` | No | LDAP API call timeout | `10000` |
| `K8S_PORT_FORWARD_TIMEOUT_MS` | No | K8s operation timeout | `15000` |

## Development
| `NODE_ENV` | No | Environment (development/production/test) | `development` |
| `PORT` | No | Server port | `3013` |
| `OMNISTRATE_EMAIL` | Yes | Omnistrate API email | - |
| `OMNISTRATE_PASSWORD` | Yes | Omnistrate API password | - |
| `OMNISTRATE_SERVICE_ID` | Yes | Omnistrate service ID | - |
| `OMNISTRATE_ENVIRONMENT_ID` | Yes | Omnistrate environment ID | - |
| `OMNISTRATE_WEBHOOK_SECRET` | Yes | Secret for authenticating Omnistrate webhooks | - |
| `JWT_SECRET` | Yes | Secret key for signing session cookies | - |
| `APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT` | No | GCP project ID for application planes | - |
| `AWS_TARGET_AUDIENCE` | No | AWS target audience for authentication | - |
| `AWS_ROLE_ARN` | No | AWS role ARN for authentication | - |
| `SERVICE_NAME` | No | Service name | `customer-ldap` |
| `CORS_ORIGINS` | No | CORS origins (comma-separated or `*`) | `*` |
| `REQUEST_TIMEOUT_MS` | No | Global request timeout | `30000` |
| `LDAP_CONNECTION_TIMEOUT_MS` | No | LDAP API call timeout | `10000` |
| `K8S_PORT_FORWARD_TIMEOUT_MS` | No | K8s operation timeout | `15000`
```json
{
  "message": "User already exists"
}
```

##### Instance Deleted

```
POST /v1/omnistrate/instance-deleted
Authorization: Bearer <OMNISTRATE_WEBHOOK_SECRET>
```

**Request Body:**
```json
{
  "instanceId": "inst-123",
  "subscriptionId": "sub-456"
}
```

**Response (200):**
```json
{
  "message": "User deletion completed",
  "deletedCount": 3,
  "failedCount": 0

#### Create User

```
POST /instances/:instanceId/users?subscriptionId=<subscription-id>
```

**Request Body:**
```json
{
  "username": "newuser",
  "password": "securepassword",
  "acl": "rw"
}
```

**Response:**
```json
{
  "message": "User created successfully"
}
## Security & Production Features

### Security

1. **Session Cookies**: HTTP-only, secure (in production), 15-minute expiry
2. **Token Validation**: All tokens validated against Omnistrate API
3. **Role-Based Access**: Readers can only list, writers can perform all operations
4. **Webhook Authentication**: Bearer token validation for Omnistrate webhooks
5. **PII Masking**: Usernames, passwords, and tokens redacted from logs
6. **CORS Configuration**: Configurable origins via environment variable
7. **Connection Isolation**: Each instance has its own cached connection

### Production Features

1. **Graceful Shutdown**: Handles SIGTERM/SIGINT, closes connections cleanly
2. **Connection Caching**: Cached K8s port forwards with 15-minute TTL
3. **Health Validation**: Connection health checks with 3-second timeout
4. **Automatic Cleanup**: Expired connections automatically closed every 5 minutes
5. **Transaction Rollback**: Multi-step operations roll back on failure
6. **Request Timeouts**: Configurable per operation type
7. **Connection Health**: Validates cached connections before reuse
8. **Performance**: 60-75% faster for repeated operations on same instance

### Performance

**Connection Caching Benefits**:
- First request to an instance: ~2-3 seconds (K8s auth + port forward + LDAP operation)
- Subsequent requests (within 15 minutes): ~100-200ms (only LDAP operation)
- Health validation overhead: ~50ms (3-second timeout, fails fast)
- Multiple operations on same instance: 60-75% faster

**Webhook Performance**:
- Idempotent operations: ~100-200ms (detects existing users)
- New user creation: ~2-3 seconds (first connection) or ~100-200ms (cached)
- Rollback on failure: Automatically deletes partially created resources

See [CONNECTION_CACHING.md](./CONNECTION_CACHING.md) and [PRODUCTION_IMPROVEMENTS.md](./PRODUCTION_IMPROVEMENTS.md) for detailed documentation.

## LDAP Server Requirements
## LDAP Server Requirements

The LDAP server must:
- Run in namespace: `ldap-auth`
- Have a service: `ldap-auth-service` on port `8080`
- Have pods starting with prefix: `ldap-auth-rs`
- Store bearer token in Kubernetes secret: `ldap-auth-secret` (key: `token`)
- Expose REST API endpoints:
  - `GET /api/v1/ca-certificate` - Get CA certificate
  - `GET /api/users/:org` - List users in organization
  - `POST /api/users` - Create user
  - `PUT /api/users/:org/:username` - Modify user
  - `DELETE /api/users/:org/:username` - Delete user
  - `GET /api/groups/:org` - List groups in organization
  - `POST /api/groups` - Create group
  - `PUT /api/groups/:org/:groupname` - Modify group
  - `DELETE /api/groups/:org/:groupname` - Delete group
  - `POST /api/groups/:org/:groupname/members` - Add user to group

## Project Structure

```
src/
├── routes/
│   └── v1/                          # Version 1 API
│       ├── health.routes.ts         # Health check endpoints
│       ├── instances/               # User management routes
│       │   ├── router.ts
│       │   ├── handlers/
│       │   └── hooks/
│       └── omnistrate/              # Webhook routes
│           ├── router.ts
│           ├── handlers/
│           └── hooks/
├── services/                        # Business logic
│   ├── AuthService.ts
│   ├── UserService.ts
│   └── LdapService.ts
├── repositories/                    # Data access
│   ├── omnistrate/
│   ├── k8s/
│   ├── ldap/
│   ├── session/
│   └── connection-cache/
└── schemas/                         # TypeBox schemas
    ├── dotenv.ts
    └── users.ts
```

## Kubernetes Deployment

When deploying to Kubernetes:

1. Store secrets in Kubernetes Secrets:
   - `OMNISTRATE_WEBHOOK_SECRET`
   - `JWT_SECRET`
   - `OMNISTRATE_PASSWORD`

2. Configure probes:
   ```yaml
   livenessProbe:
     httpGet:
       path: /v1/health
       port: 3013
     initialDelaySeconds: 10
     periodSeconds: 30
   
   readinessProbe:
     httpGet:
       path: /v1/readiness
       port: 3013
     initialDelaySeconds: 5
     periodSeconds: 10
   ```

3. Set graceful shutdown:
   ```yaml
   terminationGracePeriodSeconds: 30
   ```

4. Configure CORS for production:
   ```yaml
   env:
     - name: CORS_ORIGINS
       value: "https://console.falkordb.com,https://api.falkordb.com"
   ```

5. Implement rate limiting at Ingress/LoadBalancer level

## Development

### Install Dependencies

```bash
pnpm install
```

### Run Tests

```bash
# Unit tests
pnpm test

# Integration tests (requires real credentials)
pnpm test -- tests/integration
```

### Start Development Server

```bash
pnpm start
```

### Build

```bash
pnpm build
```

### Run Production

```bash
pnpm serve
```

## Testing

The project includes comprehensive tests:

### Unit Tests
- `tests/repositories/` - Repository layer tests
- `tests/services/` - Service layer tests

### Integration Tests
- `tests/integration/` - End-to-end API tests

Run tests with:
```bash
pnpm test
```

## Security Considerations

1. **Session Cookies**: HTTP-only, secure (in production), 15-minute expiry
2. **Token Validation**: All tokens validated against Omnistrate API
3. **Role-Based Access**: Readers can only list, writers can perform all operations
4. **Connection Caching**: Connections cached per instance with 15-minute TTL, aligned with session expiry
5. **Automatic Cleanup**: Expired connections automatically closed every 5 minutes
6. **Connection Isolation**: Each instance has its own cached connection (keyed by instanceId)
7. **No Data Caching**: Instance details not cached (stored in session cookie)

## Performance

**Connection Caching Benefits**:
- First request to an instance: ~2-3 seconds (K8s auth + port forward + LDAP operation)
- Subsequent requests (within 15 minutes): ~100-200ms (only LDAP operation)
- Multiple operations on same instance: 60-75% faster

See [CONNECTION_CACHING.md](./CONNECTION_CACHING.md) for detailed performance analysis.

## LDAP Server Requirements

The LDAP server must:
- Run in namespace: `ldap-auth`
- Have a service: `ldap-auth-service` on port `8080`
- Have pods starting with prefix: `ldap-auth-rs`
- Expose REST API endpoints:
  - `GET /users` - List users
  - `POST /users` - Create user
  - `PUT /users/:username` - Modify user
  - `DELETE /users/:username` - Delete user

## License

SSPL
