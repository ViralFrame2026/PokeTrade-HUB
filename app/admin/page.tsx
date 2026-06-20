import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  FileWarning,
  Gift,
  Heart,
  MessageCircle,
  Percent,
  ShieldCheck,
  Store,
  Users
} from "lucide-react";
import { AdminListings, type AdminListing } from "@/components/admin-listings";
import { AdminRaffles, type AdminRaffle } from "@/components/admin-raffles";
import { AdminReports, type AdminReport } from "@/components/admin-reports";
import { AdminUsers, type AdminUser } from "@/components/admin-users";
import { ButtonLink } from "@/components/ui/button-link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Panel Administrador"
};

export const dynamic = "force-dynamic";

const PLATFORM_COMMISSION_RATE = 0.05;

type ListingRow = {
  created_at: string;
  description: string;
  id: string;
  location_city: string | null;
  location_country: string | null;
  moderation_status: string;
  price: number | null;
  profiles: { display_name: string } | { display_name: string }[] | null;
  title: string;
  trade_wants: string | null;
  type: string;
  products:
    | {
        condition: string;
        cards:
          | {
              image_large: string;
              official_name: string;
              rarity: string | null;
              set_name: string;
            }
          | {
              image_large: string;
              official_name: string;
              rarity: string | null;
              set_name: string;
            }[]
          | null;
      }
    | {
        condition: string;
        cards:
          | {
              image_large: string;
              official_name: string;
              rarity: string | null;
              set_name: string;
            }
          | {
              image_large: string;
              official_name: string;
              rarity: string | null;
              set_name: string;
            }[]
          | null;
      }[]
    | null;
};

type ReportRow = {
  created_at: string;
  details: string | null;
  id: string;
  listing_id: string | null;
  listings: { title: string } | { title: string }[] | null;
  reason: string;
};

type ClosedSaleRow = {
  price: number | null;
};

type RecentClosedSaleRow = {
  created_at: string;
  id: string;
  price: number | null;
  profiles: { display_name: string } | { display_name: string }[] | null;
  title: string;
  products:
    | {
        cards:
          | {
              official_name: string;
              set_name: string;
            }
          | {
              official_name: string;
              set_name: string;
            }[]
          | null;
      }
    | {
        cards:
          | {
              official_name: string;
              set_name: string;
            }
          | {
              official_name: string;
              set_name: string;
            }[]
          | null;
      }[]
    | null;
};

function listingTitle(listing: ReportRow["listings"]) {
  if (Array.isArray(listing)) {
    return listing[0]?.title ?? "Publicación no disponible";
  }

  return listing?.title ?? "Publicación no disponible";
}

function sellerName(profile: ListingRow["profiles"]) {
  if (Array.isArray(profile)) {
    return profile[0]?.display_name ?? "Usuario";
  }

  return profile?.display_name ?? "Usuario";
}

function firstRelated<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function moneyLabel(value: number) {
  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value);
}

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: currentProfile } = user
    ? await supabase
        .from("profiles")
        .select("is_super_admin")
        .eq("id", user.id)
        .single()
    : { data: null };
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    pendingResult,
    rafflesResult,
    reportsResult,
    usersResult,
    approvedResult,
    activeListingsResult,
    closedSalesResult,
    recentClosedSalesResult,
    monthlyUsersResult,
    messagesResult,
    favoritesResult,
    activeRafflesResult,
    userRolesResult
  ] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, description, type, moderation_status, price, trade_wants, location_city, location_country, created_at, profiles!listings_seller_id_fkey(display_name), products!listings_product_id_fkey(condition, cards!products_card_id_fkey(official_name, image_large, set_name, rarity))")
      .eq("moderation_status", "pending")
      .order("created_at", { ascending: true }),
    supabase
      .from("raffles")
      .select("id, title, prize, closes_at, profiles!raffles_creator_id_fkey(display_name)")
      .eq("moderation_status", "pending")
      .order("created_at", { ascending: true }),
    supabase
      .from("reports")
      .select("id, listing_id, reason, details, created_at, listings!reports_listing_id_fkey(title)")
      .is("resolved_at", null)
      .order("created_at", { ascending: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("moderation_status", "approved")
      .gte("approved_at", startOfToday.toISOString()),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("moderation_status", "approved")
      .eq("status", "active"),
    supabase
      .from("listings")
      .select("price")
      .eq("moderation_status", "approved")
      .eq("type", "sale")
      .eq("status", "sold"),
    supabase
      .from("listings")
      .select("id, title, price, created_at, profiles!listings_seller_id_fkey(display_name), products!listings_product_id_fkey(cards!products_card_id_fkey(official_name, set_name))")
      .eq("moderation_status", "approved")
      .eq("type", "sale")
      .eq("status", "sold")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("joined_at", startOfMonth.toISOString()),
    supabase.from("messages").select("id", { count: "exact", head: true }),
    supabase.from("favorites").select("id", { count: "exact", head: true }),
    supabase
      .from("raffles")
      .select("id", { count: "exact", head: true })
      .eq("moderation_status", "approved")
      .gt("closes_at", new Date().toISOString()),
    currentProfile?.is_super_admin
      ? supabase
          .from("profiles")
          .select("id, display_name, is_admin, is_super_admin, joined_at")
          .order("is_super_admin", { ascending: false })
          .order("is_admin", { ascending: false })
          .order("joined_at", { ascending: true })
      : Promise.resolve({ data: [] })
  ]);
  const closedSales = (closedSalesResult.data ?? []) as ClosedSaleRow[];
  const recentClosedSales = (recentClosedSalesResult.data ?? []) as RecentClosedSaleRow[];
  const grossSales = closedSales.reduce((total, sale) => total + Number(sale.price ?? 0), 0);
  const estimatedCommission = grossSales * PLATFORM_COMMISSION_RATE;
  const closedSaleRows = recentClosedSales.map((sale) => {
    const product = firstRelated(sale.products);
    const card = firstRelated(product?.cards ?? null);
    const price = Number(sale.price ?? 0);
    const commission = price * PLATFORM_COMMISSION_RATE;

    return {
      cardName: card?.official_name ?? sale.title,
      commission,
      createdAt: sale.created_at,
      id: sale.id,
      price,
      seller: sellerName(sale.profiles),
      setName: card?.set_name ?? "Set no disponible"
    };
  });

  const listings: AdminListing[] = ((pendingResult.data ?? []) as ListingRow[]).map(
    (listing) => {
      const product = firstRelated(listing.products);
      const card = firstRelated(product?.cards ?? null);

      return {
        cardImage: card?.image_large ?? null,
        cardName: card?.official_name ?? listing.title,
        condition: product?.condition ?? "Sin condicion",
        created_at: listing.created_at,
        description: listing.description,
        id: listing.id,
        location: [listing.location_city, listing.location_country].filter(Boolean).join(", "),
        moderation_status: listing.moderation_status,
        price: listing.price,
        rarity: card?.rarity ?? null,
        seller: sellerName(listing.profiles),
        setName: card?.set_name ?? "Set no disponible",
        title: listing.title,
        tradeWants: listing.trade_wants,
        type: listing.type
      };
    }
  );
  const reports: AdminReport[] = ((reportsResult.data ?? []) as ReportRow[]).flatMap(
    (report) => report.listing_id ? [{
      createdAt: report.created_at,
      details: report.details ?? "Sin detalles adicionales.",
      id: report.id,
      listingId: report.listing_id,
      listingTitle: listingTitle(report.listings),
      reason: report.reason
    }] : []
  );
  const raffles: AdminRaffle[] = (rafflesResult.data ?? []).map((raffle) => ({
    closesAt: raffle.closes_at,
    creator: sellerName(raffle.profiles),
    id: raffle.id,
    prize: raffle.prize,
    title: raffle.title
  }));
  const adminUsers: AdminUser[] = (userRolesResult.data ?? []).map((profile) => ({
    displayName: profile.display_name,
    id: profile.id,
    isAdmin: profile.is_admin,
    isSuperAdmin: profile.is_super_admin,
    joinedAt: profile.joined_at
  }));

  const queues = [
    {
      icon: FileWarning,
      label: "Publicaciones pendientes",
      value: String(listings.length)
    },
    {
      icon: Gift,
      label: "Sorteos pendientes",
      value: String(raffles.length)
    },
    {
      icon: AlertTriangle,
      label: "Reportes abiertos",
      value: String(reports.length)
    },
    {
      icon: Users,
      label: "Usuarios registrados",
      value: String(usersResult.count ?? 0)
    },
    {
      icon: CheckCircle2,
      label: "Aprobadas hoy",
      value: String(approvedResult.count ?? 0)
    }
  ];
  const revenueMetrics = [
    {
      icon: Users,
      label: "Usuarios registrados",
      value: String(usersResult.count ?? 0)
    },
    {
      icon: Store,
      label: "Publicaciones activas",
      value: String(activeListingsResult.count ?? 0)
    },
    {
      icon: CheckCircle2,
      label: "Ventas cerradas",
      value: String(closedSales.length)
    },
    {
      icon: DollarSign,
      label: "Volumen vendido",
      value: moneyLabel(grossSales)
    },
    {
      icon: Percent,
      label: "Comision estimada 5%",
      value: moneyLabel(estimatedCommission)
    }
  ];
  const sponsorMetrics = [
    {
      icon: Users,
      label: "Usuarios nuevos del mes",
      value: String(monthlyUsersResult.count ?? 0)
    },
    {
      icon: MessageCircle,
      label: "Mensajes enviados",
      value: String(messagesResult.count ?? 0)
    },
    {
      icon: Heart,
      label: "Favoritos guardados",
      value: String(favoritesResult.count ?? 0)
    },
    {
      icon: Gift,
      label: "Sorteos activos",
      value: String(activeRafflesResult.count ?? 0)
    }
  ];

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <ButtonLink href="/" variant="ghost">
        Volver
      </ButtonLink>
      <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-pokemonYellow">
            Administracion
          </p>
          <h1 className="mt-2 text-4xl font-black text-white">Centro de moderación</h1>
        </div>
        <ShieldCheck className="h-12 w-12 text-pokemonYellow" />
      </div>
      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {queues.map((item) => (
          <article className="glass rounded-lg p-5" key={item.label}>
            <item.icon className="h-6 w-6 text-pokemonYellow" />
            <p className="mt-4 text-3xl font-black text-white">{item.value}</p>
            <p className="mt-1 text-sm font-semibold text-slate-400">{item.label}</p>
          </article>
        ))}
      </section>
      {currentProfile?.is_super_admin ? (
        <section className="glass mt-8 rounded-lg p-5">
          <div className="flex flex-col justify-between gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
                Solo dueño de la página
              </p>
              <h2 className="mt-2 text-xl font-black text-white">Ingresos estimados</h2>
              <p className="mt-2 text-sm text-slate-400">
                Métricas internas para sponsors, publicidad y comisión por ventas cerradas.
              </p>
            </div>
            <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-slate-950">
              Sin pagos reales conectados
            </span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {revenueMetrics.map((metric) => (
              <article className="rounded-lg border border-white/10 bg-white/[0.04] p-4" key={metric.label}>
                <metric.icon className="h-5 w-5 text-pokemonYellow" />
                <p className="mt-3 break-words text-2xl font-black text-white">{metric.value}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">{metric.label}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 border-t border-white/10 pt-5">
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-300">
              Valor para sponsors
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {sponsorMetrics.map((metric) => (
                <article className="rounded-lg border border-white/10 bg-blue-500/10 p-4" key={metric.label}>
                  <metric.icon className="h-5 w-5 text-pokemonYellow" />
                  <p className="mt-3 text-2xl font-black text-white">{metric.value}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">{metric.label}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="mt-5 border-t border-white/10 pt-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-300">
                  Ventas cerradas recientes
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Referencia interna para controlar comisiones manuales antes de conectar pagos.
                </p>
              </div>
              <span className="rounded-full border border-yellow-300/30 px-3 py-1 text-xs font-black text-yellow-200">
                5% por venta
              </span>
            </div>
            {closedSaleRows.length > 0 ? (
              <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-white/[0.04] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Carta</th>
                      <th className="px-4 py-3">Vendedor</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3 text-right">Venta</th>
                      <th className="px-4 py-3 text-right">Comision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {closedSaleRows.map((sale) => (
                      <tr key={sale.id}>
                        <td className="px-4 py-3">
                          <p className="font-black text-white">{sale.cardName}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">{sale.setName}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-300">{sale.seller}</td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(
                            new Date(sale.createdAt)
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-white">
                          {moneyLabel(sale.price)}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-yellow-300">
                          {moneyLabel(sale.commission)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-slate-400">
                Todavía no hay ventas cerradas para calcular comisiones.
              </div>
            )}
          </div>
        </section>
      ) : null}
      <section className="glass mt-8 overflow-hidden rounded-lg">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-xl font-black text-white">Cola de sorteos</h2>
        </div>
        <AdminRaffles raffles={raffles} />
      </section>
      <section className="glass mt-8 overflow-hidden rounded-lg">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-xl font-black text-white">Cola de publicaciones</h2>
        </div>
        <AdminListings listings={listings} />
      </section>
      <section className="glass mt-8 overflow-hidden rounded-lg">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-xl font-black text-white">Reportes abiertos</h2>
        </div>
        <AdminReports reports={reports} />
      </section>
      {currentProfile?.is_super_admin && user ? (
        <section className="glass mt-8 overflow-hidden rounded-lg">
          <div className="border-b border-white/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
              Solo administrador principal
            </p>
            <h2 className="mt-2 text-xl font-black text-white">Permisos de administradores</h2>
            <p className="mt-2 text-sm text-slate-400">
              Concede acceso al centro de moderación únicamente a personas de confianza.
            </p>
          </div>
          <AdminUsers currentUserId={user.id} users={adminUsers} />
        </section>
      ) : null}
    </main>
  );
}
