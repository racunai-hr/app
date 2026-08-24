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

## User-facing amount display

Svi iznosi prikazani korisniku u App UI-u koriste centralne HR formatere iz
`src/lib/formatHr.ts`. Nema lokalnih `formatMoney` helpera niti feature-specific
aliasa za prikaz decimalnih iznosa.

| Vrijednost | Helper | Prikaz |
|---|---|---|
| Iznos bez valute | `formatHrAmount` | `32.144,76` |
| Iznos s valutom | `formatHrMoney` | `32.144,76 EUR` |

Invalid / null / empty → `—` (ili `— EUR` kod `formatHrMoney`).

Decimalni string s API-ja (`32144.76`) ostaje za API, bazu, input `value`,
računanje, sortiranje i ostale machine-readable vrijednosti.
Lokalizacija je presentation concern.

## Pagination

Sve paginirane liste u App UI-u koriste dijeljenu `Pagination` komponentu
(`src/components/ui/Pagination.tsx`) i helperi iz `src/lib/pagination.ts`.
Nema lokalnih pagera niti ručnog zapisa `page` / `page_size` u URL.

| Concern | Gdje |
|---|---|
| Čitanje URL-a | `parsePage` / `parsePageSize` |
| Zapis URL-a | `writePageParams` — `page=1` i `page_size=20` se ne zapisuju |
| Broj stranica | `pageCountOf` (nevaljan `pageSize` pada na 20) |
| Overflow nakon filtera | `usePageBounds` na call-siteu, samo kad je `ready` |

Promjena `page_size` uvijek resetira na stranicu 1 (kanonski URL bez `page`).
Nove liste ne smiju kopirati Prethodna/Sljedeća markup.
