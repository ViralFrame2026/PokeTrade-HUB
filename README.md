# POKETRADE HUB

Marketplace profesional para comunidad Pokemon TCG de habla hispana.

## Incluido

- Next.js 15, React, TypeScript y TailwindCSS.
- UI dark mode con estilo marketplace, sorteos, usuarios destacados y panel admin.
- Rutas API para Pokemon TCG:
  - `GET /api/cards/search?q=charizard`
  - `GET /api/cards/[id]`
  - `GET /api/sets`
- Servicio `lib/pokemon-tcg-api.ts` con cache local, API key opcional y errores amigables.
- Supabase SSR client, middleware de proteccion de rutas y base para Auth.
- Migracion PostgreSQL con tablas, relaciones, triggers y RLS.
- SEO basico: metadata, Open Graph, Twitter Cards, sitemap y robots.

## Arbol principal

```text
app/
  admin/page.tsx
  api/cards/[id]/route.ts
  api/cards/search/route.ts
  api/sets/route.ts
  login/page.tsx
  publish/page.tsx
  raffles/new/page.tsx
components/
  card-spotlight.tsx
  listing-card.tsx
  stat-card.tsx
  ui/button-link.tsx
lib/
  pokemon-tcg-api.ts
  supabase/client.ts
  supabase/server.ts
supabase/
  migrations/0001_initial_schema.sql
```

## Desarrollo

```bash
npm install
npm run dev
```

## Variables

Copia `.env.local.example` a `.env.local` y completa los valores marcados con:

```text
===== CONFIGURAR AQUI =====
```

`POKEMON_TCG_API_KEY` es opcional. Si queda vacia, la app usa consultas publicas.
