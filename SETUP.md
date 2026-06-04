# SETUP

## 1. Instalacion

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:3000`.

## 2. Configuracion Supabase

1. Crea un proyecto en Supabase.
2. Copia la URL del proyecto y la anon key.
3. Ejecuta la migracion:

```bash
supabase migration up
```

Si usas el SQL editor, pega el contenido de:

```text
supabase/migrations/0001_initial_schema.sql
```

## 3. Configuracion Pokemon TCG API

La API base usada es:

```text
https://api.pokemontcg.io/v2
```

Variable opcional:

```text
POKEMON_TCG_API_KEY=
```

Si existe, el servicio la envia como `X-Api-Key`. Si no existe, usa consultas publicas.

## 4. Configuracion Vercel

1. Importa el repositorio en Vercel.
2. Agrega las variables de entorno.
3. Selecciona framework `Next.js`.
4. Deploy.

## 5. Variables de entorno

Crear `.env.local` desde `.env.local.example`.

```env
# ===== CONFIGURAR AQUI =====
NEXT_PUBLIC_SUPABASE_URL=

# ===== CONFIGURAR AQUI =====
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# ===== CONFIGURAR AQUI =====
SUPABASE_SERVICE_ROLE_KEY=

# ===== OPCIONAL =====
POKEMON_TCG_API_KEY=
```

## 6. Deploy

```bash
npm run build
```

Luego desplegar en Vercel. Las migraciones de Supabase deben aplicarse antes de abrir la app a usuarios reales.

## 7. Dominio personalizado

1. En Vercel, abre `Settings > Domains`.
2. Agrega el dominio.
3. Configura DNS segun las instrucciones de Vercel.
4. Actualiza `metadataBase`, `robots.ts` y `sitemap.ts` con el dominio final.

## Notas de produccion

- No permitir cartas manuales: todo producto `category = card` requiere un registro en `cards`.
- Moderar toda publicacion antes de exponerla.
- Usar Supabase Storage para fotos reales y reglas de bucket privadas/publicas segun el flujo.
- Activar rate limiting externo en Vercel, middleware o un proveedor dedicado antes de escalar.
- Completar flujos de formularios conectando Server Actions o Route Handlers a Supabase.
