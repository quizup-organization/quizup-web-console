# AGENTS.md — quizup-web-console

> **UI d'exploitation Axon** (admin) : applications/réplicas, event processors + segments
> (pause/start/reset/split/merge), dead-letter queues (retry/suppression/purge) et journal
> d'audit. Consomme l'API admin de `quizup-console` (`/api/console/**`, `ROLE_ADMIN`).
> Équivalent fonctionnel open source de la Axoniq Platform — référence :
> [`../../product/axon-platform-parity.md`](../../product/axon-platform-parity.md).

**Stack** : Vite 8 / React 19 / TS 6 strict / Tailwind v4 (CSS-first) + Base UI (preset shadcn
`base-luma`) / TanStack Query / Zustand / `oidc-client-ts` (PKCE). Socle d'infrastructure repris
de `quizup-web` (client API, primitives UI, tooling) — conventions
[`../../best-practices/.frontend/`](../../best-practices/.frontend/) : chaîne
**service → hook React Query → composant**, state serveur = React Query, state UI = Zustand,
barrels `index.ts` par feature (imports internes interdits par ESLint).

---

## 1. Configuration (env)

`.env.development` :

| Variable | Défaut | Rôle |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8094` | base URL de `quizup-console` |
| `VITE_BFF_URL` | `http://localhost:8092` | base URL du BFF (surface admin média `/api/admin/media`, `ROLE_ADMIN`) |
| `VITE_OIDC_AUTHORITY` | `http://localhost:8085` | issuer `quizup-identity` |
| `VITE_OIDC_CLIENT_ID` | `console` | client public PKCE (à créer dans identity — Lot D) |
| `VITE_OIDC_REDIRECT_URI` | `http://localhost:5174/callback` | redirect dev (port Vite 5174) |

## 2. Auth & garde admin

- `features/auth` : `oidc-client-ts` (Auth Code + PKCE, renouvellement silencieux
  `/silent-callback`), store Zustand `useSessionStore` (profil décodé localement depuis le JWT),
  `SessionBootstrap` monté dans `App`.
- **`AdminGate`** : session valide **et** claim `roles` contient `ROLE_ADMIN`, sinon redirection
  `/login` ou écran « Accès refusé ». L'API `quizup-console` re-vérifie le rôle serveur (la garde
  cliente n'est qu'UX).
- `.env` prod (GitOps, Lot D) : même client `console`, redirect public
  `https://console.quizup.cnadjim.fr/callback`.

## 3. Structure

```
src/
├── features/
│   ├── auth/          # oidc, session store, AdminGate, pages login/callback
│   ├── shell/         # AppShell (sidebar + topbar + Outlet)
│   ├── dashboard/     # tableau de bord (compteurs, débits, event stores)
│   ├── applications/  # réplicas + détail application (instances, handlers, processors)
│   ├── processors/    # liste + détail (segments, actions, charts métriques)
│   ├── messages/      # Commandes / Queries (débits par message, charts)
│   ├── scheduled/     # scheduled events (deadlines db-scheduler)
│   ├── search/        # recherche événements/snapshots (payload JSON)
│   ├── dlq/           # stats par processor + séquences (retry/suppression/purge)
│   ├── media/         # console média MinIO (objets, orphelins, usage) — API admin du BFF
│   ├── users/         # admin OIDC + acteurs d'audit
│   └── audit/         # journal des actions
├── lib/               # api-client, api, config, endpoints, metrics (Prometheus), query-keys, session, format
├── routes/            # AppRoutes (lazy pages, AdminGate + AppShell)
├── shared/            # DataState, Modal, PageHeader, StatCard, TimeSeriesChart (recharts), RangeSelector, JsonViewer
└── components/ui/     # primitives shadcn (button, card, badge, input, label, separator, skeleton)
```

Routes : `/login`, `/callback`, `/silent-callback`, puis sous garde admin `/` (Dashboard),
`/applications`, `/applications/:application`, `/processors` (+ détail), `/commands`, `/queries`,
`/scheduled-events`, `/search`, `/dlq` (+ détail), `/media`, `/users`, `/audit`.

**Médias** : la page `/media` consomme la surface admin du **BFF** (`/api/admin/media/**`,
`ROLE_ADMIN`) via un **second client HTTP** (`src/lib/bff-api.ts`, base `VITE_BFF_URL`) : listing du
bucket MinIO `quizup-media` (uploads + seed), références métier, orphelins S3 ↔ `media_asset` et
usage par joueur. Une suppression référencée exige une confirmation « forcer » (`409` sinon),
la purge d'orphelins conserve les objets référencés.

## 4. Commandes

```bash
npm install
npm run dev        # http://localhost:5174
npm run typecheck
npm run lint
npm run test       # vitest (pure logic)
npm run build
```

## 5. Déploiement & TODO

- GitOps : `devops/quizup-gitops/apps/quizup-web-console/` (nginx, Ingress partagé
  `console.quizup.cnadjim.fr` : `/` → SPA, `/api/console` → `quizup-console`) ; Application ArgoCD
  + Image Updater `ghcr.io/quizup-organization/quizup-web-console`.
- Release : `frontend-release.yml` avec `service-name: quizup-web-console`, client OIDC `console`,
  `VITE_API_URL=https://console.quizup.cnadjim.fr` (même origine que l'API) et
  `VITE_BFF_URL=https://api.quizup.cnadjim.fr` (surface admin média, CORS SDK).
- Client OIDC public `console` déjà déclaré dans `quizup-identity` (dev + prod) ; client
  `server-client` M2M inchangé côté services.
- TODO : release train (SDK/console/identity/web-console) + sync ArgoCD, scellement
  `quizup-console-secret`, design maison à affiner (états vides, dense tables, filtres),
  détection transitions/alertes.
