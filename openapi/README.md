This directory holds a synced copy of the API OpenAPI artifact.

Do not edit `openapi.yaml` by hand. Sync from the API repo:

```bash
scripts/sync-openapi.sh /path/to/api/openapi.yaml
npm run generate:api-types
```
