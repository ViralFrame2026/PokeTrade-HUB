import { AlertTriangle, CheckCircle2, FileWarning, ShieldCheck, Users } from "lucide-react";
import { AdminListings, type AdminListing } from "@/components/admin-listings";
import { AdminReports, type AdminReport } from "@/components/admin-reports";
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
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [pendingResult, reportsResult, usersResult, approvedResult] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, type, moderation_status, created_at, profiles!listings_seller_id_fkey(display_name)")
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
      .gte("approved_at", startOfToday.toISOString())
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

  const queues = [
    {
      icon: FileWarning,
      label: "Publicaciones pendientes",
      value: String(listings.length)
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
      <section className="mt-8 grid gap-4 md:grid-cols-4">
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
    </main>
  );
}
