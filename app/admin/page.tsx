import { AlertTriangle, CheckCircle2, FileWarning, Gift, ShieldCheck, Users } from "lucide-react";
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

type ListingRow = {
  created_at: string;
  id: string;
  moderation_status: string;
  profiles: { display_name: string } | { display_name: string }[] | null;
  title: string;
  type: string;
};

type ReportRow = {
  created_at: string;
  details: string | null;
  id: string;
  listing_id: string | null;
  listings: { title: string } | { title: string }[] | null;
  reason: string;
};

function listingTitle(listing: ReportRow["listings"]) {
  if (Array.isArray(listing)) {
    return listing[0]?.title ?? "Publicacion no disponible";
  }

  return listing?.title ?? "Publicacion no disponible";
}

function sellerName(profile: ListingRow["profiles"]) {
  if (Array.isArray(profile)) {
    return profile[0]?.display_name ?? "Usuario";
  }

  return profile?.display_name ?? "Usuario";
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

  const [pendingResult, rafflesResult, reportsResult, usersResult, approvedResult, userRolesResult] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, type, moderation_status, created_at, profiles!listings_seller_id_fkey(display_name)")
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
    currentProfile?.is_super_admin
      ? supabase
          .from("profiles")
          .select("id, display_name, is_admin, is_super_admin, joined_at")
          .order("is_super_admin", { ascending: false })
          .order("is_admin", { ascending: false })
          .order("joined_at", { ascending: true })
      : Promise.resolve({ data: [] })
  ]);

  const listings: AdminListing[] = ((pendingResult.data ?? []) as ListingRow[]).map(
    (listing) => ({
      created_at: listing.created_at,
      id: listing.id,
      moderation_status: listing.moderation_status,
      seller: sellerName(listing.profiles),
      title: listing.title,
      type: listing.type
    })
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
          <h1 className="mt-2 text-4xl font-black text-white">Centro de moderacion</h1>
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
              Concede acceso al centro de moderacion únicamente a personas de confianza.
            </p>
          </div>
          <AdminUsers currentUserId={user.id} users={adminUsers} />
        </section>
      ) : null}
    </main>
  );
}
