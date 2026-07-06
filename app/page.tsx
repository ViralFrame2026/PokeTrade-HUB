import {
  BadgeCheck,
  Bell,
  Droplets,
  Flame,
  Gift,
  Leaf,
  LogIn,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Trophy,
  UserRound,
  Users,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CardSpotlight } from "@/components/card-spotlight";
import { ListingCard } from "@/components/listing-card";
import { StatCard } from "@/components/stat-card";
import { SiteMenu } from "@/components/site-menu";
import { ButtonLink } from "@/components/ui/button-link";
import {
  firstListingPhotoPath,
  firstRelated,
  productImage,
  productMeta,
  productTitle
} from "@/lib/product-display";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { latestListings as demoListings, topUsers as demoTopUsers } from "@/lib/demo-data";
import type { Listing } from "@/lib/types";

export const metadata = {
  alternates: {
    canonical: "/"
  },
  description:
    "Marketplace argentino para comprar, vender, intercambiar y sortear productos Pokemon TCG con moderación, reputación y catálogo oficial.",
  title: "NexoTCG - Marketplace Pokemon TCG Argentina"
};

export const dynamic = "force-dynamic";

type Related<T> = T | T[] | null;

type ListingRow = {
  description: string | null;
  id: string;
  listing_images: Array<{
    sort_order: number;
    storage_path: string;
  }>;
  location_city: string | null;
  location_country: string | null;
  price: number | null;
  profiles: Related<{
    display_name: string;
    id: string;
    is_verified: boolean;
    reputation_average: number;
  }>;
  products: Related<{
    accessory_type: string | null;
    category: string | null;
    condition: string | null;
    language: string | null;
    sealed_type: string | null;
    title: string | null;
    cards: Related<{
      image_large: string;
      number: string | null;
      official_name: string;
      pokemon_tcg_id: string;
      rarity: string | null;
      set_name: string;
    }>;
  }>;
  status: string;
  title: string;
  trade_wants: string | null;
  type: string;
};

type ProfileRow = {
  city: string | null;
  country: string | null;
  display_name: string;
  id: string;
  is_verified: boolean;
  reputation_average: number;
  reputation_count: number;
};

function typeLabel(type: string) {
  return {
    free: "Gratis",
    raffle: "Sorteo",
    sale: "Venta",
    trade: "Intercambio"
  }[type] ?? type;
}
function listingPrice(listing: ListingRow) {
  if (listing.type === "trade") {
    return "Intercambio";
  }

  if (listing.type === "free") {
    return "Gratis";
  }

  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(listing.price ?? 0);
}

export default async function HomePage() {
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  let listingsData: ListingRow[] = [];
  let profilesData: ProfileRow[] = [];
  let usersTotal = 0;
  let listingsTotal = 0;
  let rafflesTotal = 0;
  let isAdmin = false;
  let isAuthenticated = false;
  let pendingListingsCount = 0;
  let unreadMessagesCount = 0;
  let unreadNotificationsCount = 0;

  if (hasSupabaseConfig) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    isAuthenticated = Boolean(user);

    const [listingsResult, usersCount, listingsCount, rafflesCount, profilesResult] =
      await Promise.all([
        supabase
          .from("listings")
          .select(
            "id, title, description, type, status, price, trade_wants, location_city, location_country, listing_images(storage_path, sort_order), profiles!listings_seller_id_fkey(id, display_name, is_verified, reputation_average), products!listings_product_id_fkey(category, title, condition, language, sealed_type, accessory_type, cards!products_card_id_fkey(pokemon_tcg_id, official_name, image_large, set_name, rarity, number))"
          )
          .eq("moderation_status", "approved")
          .eq("status", "active")
          .order("approved_at", { ascending: false })
          .limit(12),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("moderation_status", "approved"),
        supabase
          .from("raffles")
          .select("id", { count: "exact", head: true })
          .eq("moderation_status", "approved"),
        supabase
          .from("profiles")
          .select(
            "id, display_name, city, country, is_verified, reputation_average, reputation_count"
          )
          .gt("reputation_count", 0)
          .order("reputation_average", { ascending: false })
          .limit(4)
      ]);

    if (user) {
      const [
        profileResult,
        pendingListingsResult,
        unreadMessagesResult,
        unreadNotificationsResult
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("seller_id", user.id)
          .in("moderation_status", ["pending", "changes_requested", "rejected"]),
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("recipient_id", user.id)
          .is("read_at", null),
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .is("read_at", null)
      ]);

      isAdmin = profileResult.data?.is_admin ?? false;
      pendingListingsCount = pendingListingsResult.count ?? 0;
      unreadMessagesCount = unreadMessagesResult.count ?? 0;
      unreadNotificationsCount = unreadNotificationsResult.count ?? 0;
    }

    listingsData = (listingsResult.data ?? []) as ListingRow[];
    profilesData = (profilesResult.data ?? []) as ProfileRow[];
    usersTotal = usersCount.count ?? 0;
    listingsTotal = listingsCount.count ?? 0;
    rafflesTotal = rafflesCount.count ?? 0;
  }

  const listings: Listing[] = listingsData.flatMap((row) => {
      const profile = firstRelated(row.profiles);
      const product = firstRelated(row.products);
      const photoPath = firstListingPhotoPath(row.listing_images);
      const photoUrl = photoPath
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${photoPath}`
        : null;

      if (!product) {
        return [];
      }

      return [{
        cardMeta: productMeta(product),
        description:
          row.description ??
          (row.type === "trade" ? `Busca: ${row.trade_wants ?? "propuestas"}` : ""),
        id: row.id,
        image: photoUrl ?? productImage(product),
        location: [row.location_city, row.location_country].filter(Boolean).join(", "),
        price: listingPrice(row),
        seller: profile?.display_name ?? "Entrenador TCG",
        sellerId: profile?.id,
        sellerRating: Number(profile?.reputation_average ?? 0).toFixed(1),
        status: "Activa",
        title: productTitle(product, row.title),
        type: typeLabel(row.type),
        verified: profile?.is_verified ?? false
      }];
    }
  );

  const topUsers = profilesData.map((profile) => ({
    badge: profile.is_verified ? "Vendedor verificado" : "Coleccionista destacado",
    city: [profile.city, profile.country].filter(Boolean).join(", ") || "Comunidad global",
    initials: profile.display_name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase(),
    id: profile.id,
    name: profile.display_name,
    rating: Number(profile.reputation_average).toFixed(2)
  }));
  const displayListings = listings.length > 0 ? listings : hasSupabaseConfig ? [] : demoListings;
  const displayUsers = topUsers.length > 0 ? topUsers : demoTopUsers;
  const saleHighlights = displayListings.filter((listing) => listing.type === "Venta").slice(0, 3);
  const tradeHighlights = displayListings
    .filter((listing) => listing.type === "Intercambio")
    .slice(0, 3);
  const trustHighlights = [
    {
      icon: ShieldCheck,
      label: "Productos revisados",
      text: "Cada publicación aprobada se revisa con datos oficiales o fotos reales del producto."
    },
    {
      icon: Star,
      label: "Vendedores visibles",
      text: "Perfil, reputación y operaciones ayudan a elegir mejor antes de escribir."
    },
    {
      icon: MessageCircle,
      label: "Acuerdos trazables",
      text: "Mensajes internos y valoraciones sostienen la confianza de la comunidad."
    }
  ];

  return (
    <main className="home-page min-h-screen bg-[#070a12] text-white">
      <header className="sticky top-0 z-20 border-b-4 border-yellow-400 bg-blue-800/95 text-white backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <SiteMenu
              badges={{
                listings: pendingListingsCount,
                messages: unreadMessagesCount,
                notifications: unreadNotificationsCount
              }}
              showAdmin={isAdmin}
            />
            <Link className="flex items-center gap-3.5" href="/">
              <span className="pokeball h-12 w-12 shrink-0 sm:h-14 sm:w-14" aria-hidden="true" />
              <div>
                <p className="text-lg font-black leading-none tracking-[0.16em] text-yellow-300 sm:text-xl">
                  NexoTCG
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-blue-100">
                  Marketplace TCG
                </p>
              </div>
            </Link>
          </div>
          <ButtonLink
            href={isAuthenticated ? "/account" : "/login"}
            icon={isAuthenticated ? UserRound : LogIn}
            size="sm"
            variant="light"
          >
            {isAuthenticated ? "Mi cuenta" : "Ingresar"}
          </ButtonLink>
        </nav>
      </header>

      <section className="pokemon-hero-surface relative overflow-hidden border-b-8 border-yellow-400">
        <div className="pokemon-hero-overlay absolute inset-0" aria-hidden="true" />
        <div className="absolute left-0 top-0 h-3 w-full bg-[linear-gradient(90deg,#ef4444_0_33%,#facc15_33%_66%,#60a5fa_66%)]" />
        <div className="relative z-10 mx-auto grid w-full min-w-0 max-w-7xl grid-cols-1 gap-4 overflow-hidden px-4 pb-12 pt-12 sm:px-6 lg:min-h-[610px] lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8 lg:pb-14 lg:pt-14">
          <div className="flex w-[calc(100vw-2rem)] min-w-0 max-w-full flex-col justify-center lg:w-auto">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border-2 border-yellow-300 bg-blue-950/45 px-4 py-2 text-sm font-bold text-yellow-200 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              Productos oficiales, comunidad real
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.96] tracking-normal text-white sm:text-6xl lg:text-[76px]">
              NexoTCG
              <span className="mt-2 block text-yellow-300">conecta tu colección</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100">
              Comprá, vendé, intercambiá y sorteá productos Pokémon TCG con publicaciones
              moderadas, reputación visible y perfiles reales.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/marketplace" icon={Search}>
                Explorar marketplace
              </ButtonLink>
              <ButtonLink href="/publish" icon={Store} variant="light">
                Publicar producto
              </ButtonLink>
              <ButtonLink href="/raffles/new" icon={Gift} variant="blue">
                Crear sorteo
              </ButtonLink>
            </div>
          </div>
          <div className="relative w-[calc(100vw-2rem)] min-w-0 max-w-full lg:w-auto">
            <CardSpotlight />
          </div>
        </div>
      </section>

      <section className="bg-red-500 py-8 text-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <StatCard icon={Users} label="Usuarios registrados" value={String(usersTotal)} />
          <StatCard
            icon={Store}
            label="Publicaciones aprobadas"
            value={String(listingsTotal)}
          />
          <StatCard icon={ShieldCheck} label="Moderacion" value="100%" />
          <StatCard icon={Trophy} label="Sorteos activos" value={String(rafflesTotal)} />
        </div>
      </section>

      <section className="relative bg-slate-950 py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-yellow-300">
              Cómo funciona
            </p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              Publicá, validá y conectá con coleccionistas reales
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-300">
              NexoTCG ordena la experiencia para que cada producto tenga validación,
              revisión previa y un vendedor con perfil visible.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["1", "Publicás tu producto", "Elegís carta oficial, sellado o accesorio, y cargás precio, idioma, estado y condiciones."],
              ["2", "El equipo revisa", "La publicación pasa por moderación antes de aparecer."],
              ["3", "Conectás seguro", "Usás mensajes, favoritos y reputación para operar con más confianza."]
            ].map(([step, title, copy]) => (
              <article className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-foil" key={step}>
                <div className="grid h-10 w-10 place-items-center rounded-full bg-yellow-400 font-black text-blue-950">
                  {step}
                </div>
                <h3 className="mt-5 text-lg font-black text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="marketplace" className="relative overflow-hidden bg-[linear-gradient(180deg,#111827,#0f172a)]">
        <div className="absolute right-0 top-0 h-2 w-1/3 bg-red-500" aria-hidden="true" />
        <div className="absolute left-0 top-0 h-2 w-2/3 bg-blue-600" aria-hidden="true" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-red-500">
              Publicaciones reales
            </p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              Recién aprobadas
            </h2>
          </div>
          <ButtonLink href="/publish" icon={Store} variant="blue">
            Publicar producto
          </ButtonLink>
        </div>
        {displayListings.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {displayListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-blue-200 bg-white px-6 py-14 text-center">
            <Store className="mx-auto h-10 w-10 text-blue-500" />
            <h3 className="mt-4 text-xl font-black text-blue-950">
              El marketplace está listo
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-slate-600">
              Las publicaciones aprobadas aparecerán aquí. Sé el primero en sumar un producto.
            </p>
          </div>
        )}
        </div>
      </section>

      <section className="bg-[#071535] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-yellow-300">
                Atajos del marketplace
              </p>
              <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                Encontrá más rápido lo que querés hacer
              </h2>
            </div>
            <ButtonLink href="/marketplace" icon={Search} variant="light">
              Ver todo
            </ButtonLink>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <MarketLane
              emptyText="Cuando haya productos en venta aprobados, aparecerán acá."
              href="/marketplace?type=sale"
              listings={saleHighlights}
              title="Comprar productos"
            />
            <MarketLane
              emptyText="Cuando haya intercambios aprobados, aparecerán acá."
              href="/marketplace?type=trade"
              listings={tradeHighlights}
              title="Intercambios activos"
            />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {trustHighlights.map((item) => (
              <article
                className="rounded-lg border border-white/10 bg-white/[0.06] p-5"
                key={item.label}
              >
                <item.icon className="h-5 w-5 text-yellow-300" />
                <h3 className="mt-4 font-black text-white">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-blue-100">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="comunidad" className="relative overflow-hidden border-y-8 border-yellow-400 bg-blue-800 py-16 text-white">
        <div className="pokemon-speed-lines absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="relative z-10">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-yellow-300">
              Comunidad
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              La confianza también se colecciona
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-blue-100">
              Cada operación ayuda a construir reputación. Los perfiles muestran
              valoraciones, actividad y verificación.
            </p>
            <div className="mt-8 flex gap-3" aria-hidden="true">
              <span className="energy-dot bg-yellow-400 text-blue-950">
                <Zap className="h-5 w-5 fill-current" />
              </span>
              <span className="energy-dot bg-red-500 text-white">
                <Flame className="h-5 w-5 fill-current" />
              </span>
              <span className="energy-dot bg-sky-400 text-white">
                <Droplets className="h-5 w-5" />
              </span>
              <span className="energy-dot bg-emerald-500 text-white">
                <Leaf className="h-5 w-5 fill-current" />
              </span>
            </div>
          </div>
          {displayUsers.length > 0 ? (
            <div className="relative z-10 grid gap-4 sm:grid-cols-2">
              {displayUsers.map((user) => (
                <Link
                  className="rounded-lg border border-yellow-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  href={"id" in user ? `/users/${user.id}` : "/marketplace"}
                  key={user.name}
                >
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-600 font-black text-white">
                      {user.initials}
                    </div>
                    <div>
                      <h3 className="font-black text-blue-950">{user.name}</h3>
                      <p className="text-sm text-slate-500">{user.city}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm font-bold text-amber-600">
                    <Star className="h-4 w-4 fill-current" />
                    {user.rating} | {user.badge}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="relative z-10 rounded-lg border border-yellow-300 bg-white p-8 text-slate-600 shadow-sm">
              Los coleccionistas destacados aparecerán cuando reciban sus primeras valoraciones.
            </div>
          )}
        </div>
      </section>

      <section id="seguridad" className="bg-[#fff8cf]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-red-500">Seguridad</p>
          <h2 className="mt-2 text-3xl font-black text-blue-950">Un intercambio más tranquilo</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              color: "bg-blue-600",
              copy: "Toda publicación se revisa antes de aparecer en el marketplace.",
              icon: ShieldCheck,
              title: "Moderación obligatoria"
            },
            {
              color: "bg-red-500",
              copy: "Los vendedores confiables pueden mostrar una insignia visible.",
              icon: BadgeCheck,
              title: "Perfiles verificados"
            },
            {
              color: "bg-yellow-400",
              copy: "Avisos de aprobacion, rechazo, ventas, reservas y comentarios.",
              icon: Bell,
              title: "Notificaciones claras"
            }
          ].map((item) => (
            <article className="rounded-lg border border-blue-100 bg-white p-6 shadow-sm" key={item.title}>
              <div className={`grid h-11 w-11 place-items-center rounded-full ${item.color}`}>
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-5 text-xl font-black text-blue-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.copy}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-blue-700 p-6 text-white">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-yellow-300" />
            Contacto directo hoy, chat interno preparado para la siguiente etapa.
          </div>
          {isAdmin ? (
            <ButtonLink href="/admin" icon={ShieldCheck} variant="light">
              Panel administrador
            </ButtonLink>
          ) : null}
        </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#071535]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 text-sm text-blue-100 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <span className="pokeball h-9 w-9 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-black tracking-[0.18em] text-yellow-300">NexoTCG</p>
              <p className="text-xs text-blue-200">Marketplace de comunidad Pokemon TCG</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 font-bold" aria-label="Enlaces legales">
            <Link className="hover:text-yellow-300" href="/safety">
              Seguridad
            </Link>
            <Link className="hover:text-yellow-300" href="/rules">
              Reglas
            </Link>
            <Link className="hover:text-yellow-300" href="/privacy">
              Privacidad
            </Link>
            <Link className="hover:text-yellow-300" href="/terms">
              Terminos
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

function MarketLane({
  emptyText,
  href,
  listings,
  title
}: {
  emptyText: string;
  href: string;
  listings: Listing[];
  title: string;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xl font-black text-white">{title}</h3>
        <Link
          className="rounded-full border border-yellow-300/40 px-3 py-1 text-xs font-black text-yellow-200 transition hover:bg-yellow-300 hover:text-blue-950"
          href={href}
        >
          Ver mas
        </Link>
      </div>
      {listings.length > 0 ? (
        <div className="grid gap-3">
          {listings.map((listing) => (
            <Link
              className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-lg border border-white/10 bg-slate-950/45 p-3 transition hover:border-yellow-300/60"
              href={`/listings/${listing.id}`}
              key={listing.id}
            >
              <div className="relative h-20 w-16 overflow-hidden rounded-md bg-blue-950">
                <Image
                  alt={listing.title}
                  className="object-contain"
                  fill
                  sizes="64px"
                  src={listing.image}
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <p className="truncate font-black text-white">{listing.title}</p>
                <p className="mt-1 truncate text-xs font-semibold text-blue-100">
                  {listing.cardMeta}
                </p>
                <p className="mt-2 text-sm font-black text-yellow-300">{listing.price}</p>
                <p className="mt-1 truncate text-xs text-slate-400">{listing.seller}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-white/15 bg-slate-950/35 p-5 text-sm font-semibold leading-6 text-blue-100">
          {emptyText}
        </div>
      )}
    </section>
  );
}
