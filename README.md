# racunai.hr app

Next.js app surface (`app.racunai.hr`).

Feature work lands on `develop` (WSL). Production is `main` on dedicated-hel1.

## API types

`openapi/openapi.yaml` is a synced copy of the API contract artifact. `src/lib/openapi/generated.ts` is generated — never edit either by hand.

```bash
scripts/sync-openapi.sh /path/to/api/openapi.yaml
npm run generate:api-types
```

## User-facing date display

Svi datumi prikazani korisniku u App UI-u koriste centralne HR formatere iz
`src/lib/formatHr.ts`. Nema lokalnih `formatDate` / `formatDateTime` helpera
niti feature-specific aliasa.

| Vrijednost | Helper | Prikaz |
|---|---|---|
| Poslovni datum `YYYY-MM-DD` | `formatHrInputDate` | `dd.mm.yyyy.` (bez timezone konverzije; ne `new Date('YYYY-MM-DD')`) |
| Timestamp (ISO / `Date`) — samo datum | `formatHrDate` | `dd.mm.yyyy.` u `Europe/Zagreb` |
| Timestamp (ISO / `Date`) — datum+vrijeme | `formatHrDateTime` | `dd.mm.yyyy. HH:mm` u `Europe/Zagreb` |

Invalid / null / empty → `—`.

ISO `yyyy-mm-dd` (i puni ISO datetime) ostaje za API, bazu, URL/query,
`type=date` value, sortiranje i ostale machine-readable vrijednosti.
Ne oslanjati se na browser/system timezone za ERP prikaz.

Poslovna semantika `DateField` / `DateTimeField` ostaje u
`docs/architecture/DATA_ARCHITECTURE.md`; ovo je samo presentation-layer pravilo.
Novi ADR nije potreban.
