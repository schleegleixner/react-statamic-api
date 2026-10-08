# @schleegleixner/react-statamic-api

Bibliothek für **Smart-Data-Dashboard**-Projekte auf Next.js (App Router). Sie holt Seiten, Kacheln, Datenquellen, Bilder, Taxonomien und Globals aus Statamic, legt sie als Datei-Cache ab und stellt Route-Handler, Hooks und Hilfsfunktionen bereit, mit denen das Dashboard diese Inhalte ausliefert.

Das Paket ist kein allgemeiner Statamic-Client. Collections, Taxonomien und der Datenfluss folgen dem Dashboard-Modell (`pages`, `tiles`, `sources`, `images`, SDG-Targets, Icons).

## Installation

Das Paket wird nur auf GitHub Packages veröffentlicht (`publishConfig.registry`), nicht auf npmjs.org. Ohne `.npmrc` sucht npm `@schleegleixner/*` auf der öffentlichen Registry und findet nichts. GitHub verlangt außerdem ein Token, sonst bleibt der Download bei 401 hängen. Die Datei gehört ins Dashboard-Projekt, nicht in dieses Repo. Hier ist `.npmrc` in der `.gitignore`, damit kein Token im Git landet. Eine `.npmrc.example` gibt es nicht mehr.

```
@schleegleixner:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

Die erste Zeile lenkt nur diesen Scope auf GitHub Packages, alles andere bleibt auf npmjs.org. `${NPM_TOKEN}` liest npm aus der Umgebung. Der Token ist ein GitHub-PAT (classic) mit `read:packages` auf die Organisation `schleegleixner`. Zum Veröffentlichen dieses Pakets braucht derselbe Token zusätzlich `write:packages`. Die `.npmrc` dafür liegt lokal im Paket-Repo und wird nicht eingecheckt.

```bash
npm install @schleegleixner/react-statamic-api
```

Peer-Dependencies im Dashboard-Projekt:

| Paket                                 | Pflicht                      |
| ------------------------------------- | ---------------------------- |
| `next` ^16, `react` / `react-dom` ^19 | ja                           |
| `echarts` ^6                          | ja, für die Chart-Helfer     |
| `sharp` ^0.35                         | ja, für die Bildverarbeitung |
| `@serwist/next`, `serwist` ^9.5       | nur für die PWA-Subpaths     |

## Umgebungsvariablen

| Variable                          | Rolle                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------ |
| `SSD_API`                         | Basis-URL der Statamic-API                                                     |
| `API_SECRET`                      | Secret für API-Aufrufe und den Flush-Endpunkt                                  |
| `SITE_IDS`                        | Kommagetrennte Site-IDs                                                        |
| `DEFAULT_SITE_ID`                 | Site ohne Präfix in der URL                                                    |
| `NEXT_PUBLIC_URL`                 | Öffentliche Basis-URL des Dashboards (Cache-Endpunkt)                          |
| `SET_COLLECTIONS`                 | Collections beim Rebuild. Default: `pages,sources,images,tiles`                |
| `SET_TAXONOMIES`                  | Taxonomien beim Rebuild. Default: `icons,action_fields,sdg_targets`            |
| `SET_GLOBAL`                      | Global-Handles. Fehlt die Variable, werden die Handles über `/globals` geladen |
| `PASSWORD` / `PASSWORD_PROTECTED` | Passwortschutz (`preview` ist immer geschützt)                                 |
| `NEXT_PUBLIC_API_TIMEOUT`         | Timeout für CMS-Requests in ms (Default 5000)                                  |
| `NEXT_PUBLIC_FATHOM_ID`           | Fathom-Site-ID, falls `FathomAnalytics` genutzt wird                           |

## Einbindung

### Proxy

`createProxy` schreibt Site-ID, Auth-Status und die volle URL in Request-Header und hängt die Default-Site an Pfade ohne Site-Präfix.

```ts
// proxy.ts
import { createProxy } from '@schleegleixner/react-statamic-api'

export const proxy = createProxy()

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### Route-Handler

Die `response*`-Funktionen gehören in App-Router-Routen des Dashboards. Sie lesen den Datei-Cache bzw. sprechen die Statamic-API an.

| Export             | Typische Route | Liefert                             |
| ------------------ | -------------- | ----------------------------------- |
| `responseContent`  | `/api/cache`   | Gecachte CMS-Inhalte                |
| `responseLiveData` | `/api/data`    | Live-Daten (`route`, `lifetime`)    |
| `responseFlush`    | `/api/flush`   | Cache-Rebuild, nur mit `API_SECRET` |
| `responseAuth`     | `/api/auth`    | Passwort-Cookie                     |
| `responseDownload` | Download-Route | Gecachte Quelldatei                 |
| `responseImage`    | Bild-Route     | Mit `sharp` skalierte Bilder        |
| `responseIcon`     | Icon-Route     | SVG-Icon als PNG                    |

```ts
// app/api/cache/route.ts
import { responseContent } from '@schleegleixner/react-statamic-api'

export const GET = (req: Request) => responseContent(req)
```

### Inhalte lesen

`getContent`, `getCollection`, `getTileset`, `getGlobal`, `getTaxonomy`, `getNavigation`, `getImageMeta` und `getPageData` lesen aus dem Cache (mit kurzem `localStorage`-Fallback im Browser).

```ts
import { getPageData, getTileset } from '@schleegleixner/react-statamic-api'

const page = await getPageData('start', 'default')
const tileset = await getTileset('default')
```

### Live-Daten

`getLiveData` / `useApi` cachen API-Antworten in `localStorage`. `getLiveDataWithMeta` / `useLiveData` liefern zusätzlich Ablaufzeit und einen Stale-Fallback, wenn das Netz weg ist. `useOnlineStatus` und `useIsPwa` hängen daran.

### UI

- `TranslationContext` setzt Site-ID und UI-Strings (`getGlobalString`)
- `PasswordForm` postet an `/api/auth`
- `ContentImage` baut `srcset` aus den Bild-Metadaten
- `EyeAble` und `FathomAnalytics` binden die jeweiligen Skripte ein

Navigation, Breadcrumbs, Suche (`?suche=`) und Content-Breite liegen in `useNavigation`, `useBreadcrumbs`, `useSearch` und `useContentWidth`.

Chart- und Payload-Helfer (`getRows`, `getDataPoint`, `axisFormatter`, `calculateTrendline`, …) sind für die Kachel-Diagramme da. Typen für Tiles, Seiten, Navigation und Tooltips kommen aus dem Haupt-Export.

## PWA

Optional, über Subpath-Exports, damit Projekte ohne Service Worker Serwist nicht laden.

```ts
// next.config.ts
import withPWA from '@schleegleixner/react-statamic-api/pwa/next'

export default withPWA({
  // bestehende Next-Config
})
```

```ts
// app/manifest.ts
import { createManifest } from '@schleegleixner/react-statamic-api'

export default function manifest() {
  return createManifest({ name: 'Smart Data Dashboard' })
}
```

```ts
// app/sw.ts
import { setupServiceWorker } from '@schleegleixner/react-statamic-api/pwa/sw'

setupServiceWorker()
```

`setupServiceWorker` cached Live-Daten (`/api/data`, `/api/cache`) und Wetter per Network-First, Bilder per Cache-First, und fällt bei Navigationen ohne Netz auf `/offline.html` zurück.

## Cache neu aufbauen

Der Rebuild läuft über `fetchFromStatamic`, den Flush-Endpunkt oder die CLI. Die CLI liest `.env` im Arbeitsverzeichnis und nimmt Site-IDs als Argumente, sonst `SITE_IDS`.

```bash
npx react-statamic-flush
npx react-statamic-flush default en
```

## Entwicklung

Lokal im Dashboard verdrahten:

```json
"dependencies": {
  "@schleegleixner/react-statamic-api": "file:../react-statamic-api"
}
```

```bash
npm run build   # tsc + CLI-Bundle
npm run dev     # tsc im Watch-Modus
npm run lint
```

Veröffentlichen: Version in `package.json` anheben, `npm run build`, dann `npm publish`.
