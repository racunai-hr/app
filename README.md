# racunai.hr app

Next.js app surface (`app.racunai.hr`).

Feature work lands on `develop` (WSL). Production is `main` on dedicated-hel1.

## API types

`openapi/openapi.yaml` is a synced copy of the API contract artifact. `src/lib/openapi/generated.ts` is generated — never edit either by hand.

```bash
scripts/sync-openapi.sh /path/to/api/openapi.yaml
npm run generate:api-types
```

