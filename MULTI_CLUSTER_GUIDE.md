# Multi-Cluster Configuration Guide

## Overview

The service now supports connecting to multiple MongoDB clusters. You can specify which cluster to use on a per-request basis, or use the default cluster when no cluster is specified.

## Configuration

### 1. Environment Variables

Add cluster configurations to your `.env` file:

```ini
# Default cluster (used when no cluster parameter is provided)
MONGO_URI="mongodb+srv://user:pass@cluster0.mongodb.net"
MONGO_OPTIONS="?retryWrites=true&w=majority"

# Additional clusters - use format: MONGO_URI_<CLUSTER_NAME>
MONGO_URI_PRODUCTION="mongodb+srv://user:pass@prod.mongodb.net"
MONGO_OPTIONS_PRODUCTION="?retryWrites=true&w=majority"

MONGO_URI_STAGING="mongodb+srv://user:pass@staging.mongodb.net"
MONGO_OPTIONS_STAGING="?retryWrites=true&w=majority"

MONGO_URI_ANALYTICS="mongodb+srv://user:pass@analytics.mongodb.net"
MONGO_OPTIONS_ANALYTICS="?retryWrites=true&w=majority"
```

**Naming Convention:**
- Cluster names are case-insensitive in requests
- Environment variables must be uppercase: `MONGO_URI_<CLUSTER_NAME>`
- Example: `cluster: "production"` → looks for `MONGO_URI_PRODUCTION`

### 2. Request Format

Add an optional `cluster` parameter to any request body:

```json
{
  "cluster": "production",
  "database": "mydb",
  "collection": "users",
  "filter": { "status": "active" }
}
```

## Usage Examples

### Default Cluster (Backward Compatible)

Omit the `cluster` parameter to use the default `MONGO_URI`:

```bash
curl -X POST http://localhost:7438/api/findOne \
-H "Content-Type: application/json" \
-H "x-api-key: your_key" \
-H "x-api-secret: your_secret" \
-d '{
  "database": "mydb",
  "collection": "users",
  "filter": { "_id": "123" }
}'
```

### Specific Cluster

Specify the cluster name:

```bash
curl -X POST http://localhost:7438/api/findOne \
-H "Content-Type: application/json" \
-H "x-api-key: your_key" \
-H "x-api-secret: your_secret" \
-d '{
  "cluster": "production",
  "database": "mydb",
  "collection": "users",
  "filter": { "_id": "123" }
}'
```

## All Operations Support Clusters

Every operation now accepts the optional `cluster` parameter:

- `insertOne` - Insert to specific cluster
- `insertMany` - Bulk insert to specific cluster
- `findOne` - Query specific cluster
- `find` - Query specific cluster
- `updateOne` - Update in specific cluster
- `updateMany` - Bulk update in specific cluster
- `deleteOne` - Delete from specific cluster
- `deleteMany` - Bulk delete from specific cluster
- `aggregate` - Run aggregation on specific cluster

## Connection Pooling

The service automatically manages connections:

- Connections are cached per cluster+database combination
- Reuses existing connections for efficiency
- Automatically reconnects on connection loss
- Each cluster maintains its own connection pool

## Error Handling

### Missing Cluster Configuration

If you specify a cluster that doesn't exist in `.env`:

```json
{
  "success": false,
  "error": "MONGO_URI_PRODUCTION is not defined in .env file!"
}
```

### Invalid Cluster Name

The service will return an error if the cluster configuration is missing.

## Testing

Use the provided test script:

```bash
# Update credentials in test file
node tests/test-multi-cluster.js
```

## Migration from Single Cluster

Your existing code continues to work without changes:

**Before (still works):**
```json
{
  "database": "mydb",
  "collection": "users",
  "filter": {}
}
```

**After (optional enhancement):**
```json
{
  "cluster": "production",
  "database": "mydb",
  "collection": "users",
  "filter": {}
}
```

## Best Practices

1. **Use descriptive cluster names**: `production`, `staging`, `analytics`, etc.
2. **Keep default cluster for backward compatibility**: Don't remove `MONGO_URI`
3. **Document your clusters**: Add comments in `.env` explaining each cluster's purpose
4. **Test cluster connectivity**: Use the test script before deploying
5. **Monitor connections**: Check logs for connection status per cluster

## Troubleshooting

### Connection Issues

Check the logs for cluster-specific connection messages:

```
Connected to MongoDB database: mydb (cluster: production)
MongoDB connection error for mydb (cluster: staging): ...
```

### Environment Variable Issues

Ensure:
- Variable names are uppercase: `MONGO_URI_PRODUCTION` not `MONGO_URI_production`
- No spaces in variable names
- Proper URI format with credentials

### Testing Connectivity

```bash
# Test default cluster
curl http://localhost:7438/health

# Test specific cluster with a simple query
curl -X POST http://localhost:7438/api/findOne \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_key" \
  -H "x-api-secret: your_secret" \
  -d '{"cluster":"production","database":"test","collection":"test","filter":{}}'
```
