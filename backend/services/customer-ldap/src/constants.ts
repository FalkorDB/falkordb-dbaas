// Session and cookie configuration
export const SESSION_COOKIE_NAME = 'api.falkordb.cloud_customer-ldap-session';
export const SESSION_EXPIRY_SECONDS = 15 * 60; // 15 minutes
export const SESSION_EXPIRY_MS = SESSION_EXPIRY_SECONDS * 1000; // 15 minutes in milliseconds

// Connection cache configuration
export const CACHE_CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// LDAP server configuration
export const LDAP_NAMESPACE = 'ldap-auth';
export const LDAP_SERVICE_NAME = 'ldap-auth-service';
export const LDAP_SERVICE_PORT = 8080;
export const LDAP_POD_PREFIX = 'ldap-auth-rs';
export const LDAP_SECRET_NAME = 'ldap-auth-secrets';
export const LDAP_SECRET_TOKEN_KEY = 'API_BEARER_TOKEN';

// ACL
export const ALLOWED_ACL = '+INFO +CLIENT +DBSIZE +PING +HELLO +AUTH +RESTORE +DUMP +DEL +EXISTS +UNLINK +TYPE +FLUSHALL +TOUCH +EXPIRE +PEXPIREAT +TTL +PTTL +EXPIRETIME +RENAME +RENAMENX +SCAN +DISCARD +EXEC +MULTI +UNWATCH +WATCH +ECHO +SLOWLOG +WAIT +WAITAOF +READONLY +GRAPH.INFO +GRAPH.LIST +GRAPH.QUERY +GRAPH.RO_QUERY +GRAPH.EXPLAIN +GRAPH.PROFILE +GRAPH.DELETE +GRAPH.CONSTRAINT +GRAPH.SLOWLOG +GRAPH.BULK +GRAPH.CONFIG +GRAPH.COPY +CLUSTER +COMMAND +GRAPH.MEMORY +MEMORY +BGREWRITEAOF \'+MODULE|LIST\'';
