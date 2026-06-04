# Supabase

Aplicar la migracion inicial:

```bash
supabase migration up
```

La base incluye:

- Perfiles vinculados a `auth.users`.
- Catalogo local de cartas oficiales cacheadas desde Pokemon TCG API.
- Productos, publicaciones, imagenes, favoritos, comentarios, valoraciones y sorteos.
- Reportes antiestafa, notificaciones, mensajes y auditoria.
- RLS activado en todas las tablas publicas.

Los productos de tipo `card` requieren `card_id`. Ese `card_id` debe venir de una carta oficial guardada en `cards` con `pokemon_tcg_id`, nunca de entrada libre del usuario.
