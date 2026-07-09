import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileWarning,
  Gift,
  Globe,
  Heart,
  MailCheck,
  MessageCircle,
  Percent,
  Rocket,
  ShieldCheck,
  Sparkles,
  Store,
  Users
} from "lucide-react";
import Link from "next/link";
import { AdminCommissions, type AdminCommission } from "@/components/admin-commissions";
import { AdminListings, type AdminListing } from "@/components/admin-listings";
import { AdminPayments, type AdminPayment } from "@/components/admin-payments";
import { AdminRaffles, type AdminRaffle } from "@/components/admin-raffles";
import { AdminReports, type AdminReport } from "@/components/admin-reports";
import { AdminUsers, type AdminUser } from "@/components/admin-users";
import { SiteMenu } from "@/components/site-menu";
import { ButtonLink } from "@/components/ui/button-link";
import {
  firstListingPhotoPath,
  firstRelated,
  productCategoryLabel,
  productImage,
  productMeta,
  productTitle,
  productTypeDetail
} from "@/lib/product-display";
import { siteUrl } from "@/lib/site-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  robots: {
    follow: false,
    index: false
  },
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
  listing_images: Array<{ sort_order: number | null; storage_path: string | null }> | null;
  moderation_status: string;
  price: number | null;
  profiles:
    | {
        display_name: string;
        is_verified: boolean;
        joined_at: string | null;
        reputation_average: number | string | null;
        reputation_count: number | null;
      }
    | {
        display_name: string;
        is_verified: boolean;
        joined_at: string | null;
        reputation_average: number | string | null;
        reputation_count: number | null;
      }[]
    | null;
  title: string;
  trade_wants: string | null;
  type: string;
  products:
    | {
        accessory_type: string | null;
        category: string | null;
        condition: string;
        language: string | null;
        sealed_type: string | null;
        title: string | null;
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
        accessory_type: string | null;
        category: string | null;
        condition: string;
        language: string | null;
        sealed_type: string | null;
        title: string | null;
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

type AuditLogRow = {
  action: string;
  created_at: string;
  entity_id: string | null;
  entity_type: string;
  id: string;
  metadata: {
    note?: string | null;
    outcome?: string | null;
    reason?: string | null;
  } | null;
  profiles: { display_name: string } | { display_name: string }[] | null;
};

type SaleCommissionRow = {
  commission_amount: number | null;
  created_at: string;
  gross_amount: number | null;
  id: string;
  listing_id: string;
  seller_net_amount: number | null;
  status: string;
  listings:
    | {
        title: string;
        profiles: { display_name: string } | { display_name: string }[] | null;
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
      }
    | {
        title: string;
        profiles: { display_name: string } | { display_name: string }[] | null;
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
      }[]
    | null;
};

type PaymentOrderRow = {
  amount: number;
  created_at: string;
  id: string;
  listing_id: string;
  payment_id: string | null;
  provider_status: string | null;
  status: string;
  buyer: { display_name: string } | { display_name: string }[] | null;
  seller: { display_name: string } | { display_name: string }[] | null;
  listings: { title: string } | { title: string }[] | null;
};

function listingTitle(listing: ReportRow["listings"]) {
  if (Array.isArray(listing)) {
    return listing[0]?.title ?? "Publicación no disponible";
  }

  return listing?.title ?? "Publicación no disponible";
}

function sellerName(profile: { display_name: string } | { display_name: string }[] | null) {
  if (Array.isArray(profile)) {
    return profile[0]?.display_name ?? "Usuario";
  }

  return profile?.display_name ?? "Usuario";
}

function moneyLabel(value: number) {
  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value);
}

function auditActionLabel(action: string) {
  return {
    "listing.approved": "Publicacion aprobada",
    "listing.deleted": "Publicacion eliminada",
    "listing.rejected": "Publicacion rechazada",
    "report.resolved": "Reporte resuelto",
    "raffle.approved": "Sorteo aprobado",
    "raffle.deleted": "Sorteo eliminado",
    "raffle.rejected": "Sorteo rechazado"
  }[action] ?? action;
}

function auditTone(action: string) {
  if (action.endsWith(".approved")) return "border-emerald-300/30 bg-emerald-400/10 text-emerald-100";
  if (action.endsWith(".rejected")) return "border-red-300/30 bg-red-400/10 text-red-100";

  return "border-white/10 bg-white/[0.04] text-slate-300";
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
    userRolesResult,
    saleCommissionsResult,
    paymentOrdersResult,
    auditLogsResult
  ] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, description, type, moderation_status, price, trade_wants, location_city, location_country, created_at, listing_images(storage_path, sort_order), profiles!listings_seller_id_fkey(display_name, is_verified, reputation_average, reputation_count, joined_at), products!listings_product_id_fkey(category, title, condition, language, sealed_type, accessory_type, cards!products_card_id_fkey(official_name, image_large, set_name, rarity))")
      .eq("moderation_status", "pending")
      .order("created_at", { ascending: true }),
    supabase
      .from("raffles")
      .select("id, title, prize, image_path, closes_at, profiles!raffles_creator_id_fkey(display_name)")
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
      : Promise.resolve({ data: [] }),
    currentProfile?.is_super_admin
      ? supabase
          .from("sale_commissions")
          .select("id, listing_id, gross_amount, commission_amount, seller_net_amount, status, created_at, listings!sale_commissions_listing_id_fkey(title, profiles!listings_seller_id_fkey(display_name), products!listings_product_id_fkey(cards!products_card_id_fkey(official_name, set_name)))")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    currentProfile?.is_super_admin
      ? supabase
          .from("payment_orders")
          .select("id, listing_id, amount, status, provider_status, payment_id, created_at, buyer:profiles!payment_orders_buyer_id_fkey(display_name), seller:profiles!payment_orders_seller_id_fkey(display_name), listings!payment_orders_listing_id_fkey(title)")
          .order("created_at", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("audit_logs")
      .select("id, action, entity_type, entity_id, metadata, created_at, profiles!audit_logs_actor_id_fkey(display_name)")
      .order("created_at", { ascending: false })
      .limit(8)
  ]);
  const closedSales = (closedSalesResult.data ?? []) as ClosedSaleRow[];
  const paymentOrders =
    !paymentOrdersResult.error && paymentOrdersResult.data
      ? ((paymentOrdersResult.data ?? []) as PaymentOrderRow[])
      : [];
  const recentClosedSales = (recentClosedSalesResult.data ?? []) as RecentClosedSaleRow[];
  const saleCommissions =
    !saleCommissionsResult.error && saleCommissionsResult.data
      ? ((saleCommissionsResult.data ?? []) as SaleCommissionRow[])
      : [];
  const hasCommissionLedger = !saleCommissionsResult.error;
  const grossSales = hasCommissionLedger
    ? saleCommissions.reduce((total, sale) => total + Number(sale.gross_amount ?? 0), 0)
    : closedSales.reduce((total, sale) => total + Number(sale.price ?? 0), 0);
  const estimatedCommission = hasCommissionLedger
    ? saleCommissions.reduce((total, sale) => total + Number(sale.commission_amount ?? 0), 0)
    : grossSales * PLATFORM_COMMISSION_RATE;
  const pendingCommissionTotal = saleCommissions
    .filter((sale) => sale.status === "pending" || sale.status === "invoiced")
    .reduce((total, sale) => total + Number(sale.commission_amount ?? 0), 0);
  const paidCommissionTotal = saleCommissions
    .filter((sale) => sale.status === "paid")
    .reduce((total, sale) => total + Number(sale.commission_amount ?? 0), 0);
  const waivedCommissionTotal = saleCommissions
    .filter((sale) => sale.status === "waived")
    .reduce((total, sale) => total + Number(sale.commission_amount ?? 0), 0);
  const auditLogs = ((auditLogsResult.data ?? []) as AuditLogRow[]).map((log) => ({
    action: log.action,
    actor: sellerName(log.profiles),
    createdAt: log.created_at,
    entityType: log.entity_type,
    id: log.id,
    reason: log.metadata?.note ?? log.metadata?.reason ?? null
  }));
  const closedSaleRows: AdminCommission[] = hasCommissionLedger ? saleCommissions.map((sale) => {
    const listing = firstRelated(sale.listings);
    const product = firstRelated(listing?.products ?? null);
    const card = firstRelated(product?.cards ?? null);

    return {
      productName: card?.official_name ?? listing?.title ?? "Venta registrada",
      commission: Number(sale.commission_amount ?? 0),
      createdAt: sale.created_at,
      id: sale.id,
      price: Number(sale.gross_amount ?? 0),
      seller: sellerName(listing?.profiles ?? null),
      sellerNet: Number(sale.seller_net_amount ?? 0),
      productMeta: card?.set_name ?? "Producto TCG",
      status: sale.status
    };
  }) : recentClosedSales.map((sale) => {
    const product = firstRelated(sale.products);
    const card = firstRelated(product?.cards ?? null);
    const price = Number(sale.price ?? 0);
    const commission = price * PLATFORM_COMMISSION_RATE;

    return {
      productName: card?.official_name ?? sale.title,
      commission,
      createdAt: sale.created_at,
      id: sale.id,
      price,
      seller: sellerName(sale.profiles),
      sellerNet: price - commission,
      productMeta: card?.set_name ?? "Producto TCG",
      status: "estimada"
    };
  });
  const paymentRows: AdminPayment[] = paymentOrders.map((payment) => ({
    amount: Number(payment.amount ?? 0),
    buyer: sellerName(payment.buyer),
    createdAt: payment.created_at,
    id: payment.id,
    listingId: payment.listing_id,
    paymentId: payment.payment_id,
    providerStatus: payment.provider_status,
    seller: sellerName(payment.seller),
    status: payment.status,
    title: listingTitle(payment.listings)
  }));

  const listings: AdminListing[] = ((pendingResult.data ?? []) as ListingRow[]).map(
    (listing) => {
      const product = firstRelated(listing.products);
      const card = firstRelated(product?.cards ?? null);
      const sellerProfile = firstRelated(listing.profiles);
      const photoCount = listing.listing_images?.length ?? 0;
      const photoPath = firstListingPhotoPath(listing.listing_images);
      const photoUrl = photoPath
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${photoPath}`
        : null;

      return {
        cardImage: photoUrl ?? productImage(product),
        cardName: productTitle(product, listing.title),
        condition: product?.condition ?? "Sin condición",
        created_at: listing.created_at,
        description: listing.description,
        hasRealPhotos: photoCount > 0,
        photoCount,
        id: listing.id,
        location: [listing.location_city, listing.location_country].filter(Boolean).join(", "),
        moderation_status: listing.moderation_status,
        price: listing.price,
        rarity: card?.rarity ?? null,
        productCategory: productCategoryLabel(product?.category),
        productCategoryRaw: product?.category ?? null,
        productType: productTypeDetail(product),
        seller: sellerProfile?.display_name ?? "Usuario",
        sellerJoinedAt: sellerProfile?.joined_at ?? null,
        sellerRating: Number(sellerProfile?.reputation_average ?? 0),
        sellerReviews: Number(sellerProfile?.reputation_count ?? 0),
        sellerVerified: Boolean(sellerProfile?.is_verified),
        setName: productMeta(product),
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
    imageUrl: raffle.image_path,
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
  const registeredUsersCount = usersResult.count ?? 0;
  const activeListingsCount = activeListingsResult.count ?? 0;
  const activeRafflesCount = activeRafflesResult.count ?? 0;
  const messagesCount = messagesResult.count ?? 0;
  const favoritesCount = favoritesResult.count ?? 0;
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const hasInitialContent = activeListingsCount >= 5;
  const hasLaunchRaffle = activeRafflesCount >= 1;
  const hasCommunitySignals = messagesCount > 0 || favoritesCount > 0;
  const publicSiteUrl = siteUrl();
  const hasExplicitSiteUrl = Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim());

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
      value: String(registeredUsersCount)
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
      value: String(registeredUsersCount)
    },
    {
      icon: Store,
      label: "Publicaciones activas",
      value: String(activeListingsCount)
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
      label: "Comisión estimada 5%",
      value: moneyLabel(estimatedCommission)
    }
  ];
  const commissionMetrics = [
    {
      icon: Clock3,
      label: "Pendiente / facturada",
      value: moneyLabel(pendingCommissionTotal)
    },
    {
      icon: CheckCircle2,
      label: "Pagada",
      value: moneyLabel(paidCommissionTotal)
    },
    {
      icon: AlertTriangle,
      label: "Perdonada",
      value: moneyLabel(waivedCommissionTotal)
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
      value: String(messagesCount)
    },
    {
      icon: Heart,
      label: "Favoritos guardados",
      value: String(favoritesCount)
    },
    {
      icon: Gift,
      label: "Sorteos activos",
      value: String(activeRafflesCount)
    }
  ];

  const totalPending = listings.length + raffles.length + reports.length;
  const launchChecks = [
    {
      detail: "Variables públicas de Supabase disponibles para que la app conecte con datos reales.",
      icon: ShieldCheck,
      label: "Base conectada",
      ready: hasSupabaseConfig
    },
    {
      detail: "Tu cuenta conserva permisos de administrador principal para gestionar el sitio.",
      icon: Users,
      label: "Admin principal",
      ready: Boolean(currentProfile?.is_super_admin)
    },
    {
      detail: "Publicaciones, sorteos y reportes sin trabajo pendiente antes de abrir tráfico.",
      icon: CheckCircle2,
      label: "Moderación al día",
      ready: totalPending === 0
    },
    {
      detail: "Recomendado: al menos 5 publicaciones activas para que el marketplace no se vea vacío.",
      icon: Store,
      label: "Contenido inicial",
      ready: hasInitialContent
    },
    {
      detail: "Recomendado: un sorteo activo para mostrar movimiento y atraer usuarios nuevos.",
      icon: Gift,
      label: "Sorteo de bienvenida",
      ready: hasLaunchRaffle
    },
    {
      detail: "Mensajes o favoritos indican que usuarios reales ya empezaron a interactuar.",
      icon: MessageCircle,
      label: "Señales de comunidad",
      ready: hasCommunitySignals
    },
    {
      detail: hasExplicitSiteUrl
        ? `SEO, sitemap y enlaces públicos usan ${publicSiteUrl}.`
        : `Usando URL default ${publicSiteUrl}. Configura NEXT_PUBLIC_SITE_URL si conectas dominio propio.`,
      icon: Globe,
      label: "URL pública",
      ready: hasExplicitSiteUrl
    }
  ];
  const externalLaunchItems = [
    {
      detail: "Configurar SMTP/dominio de envío en Supabase para que los emails salgan con marca propia.",
      icon: MailCheck,
      label: "Email propio"
    },
    {
      detail: "Conectar dominio final en Vercel cuando tengas el dominio comprado. La app ya centraliza la URL publica.",
      icon: Globe,
      label: "Dominio final"
    }
  ];
  const launchReadyCount = launchChecks.filter((check) => check.ready).length;
  const launchProgress = Math.round((launchReadyCount / launchChecks.length) * 100);

  return (
    <main className="min-h-screen bg-[#071535] text-white">
      <header className="sticky top-0 z-30 border-b-4 border-yellow-400 bg-blue-800/95 text-white backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <SiteMenu
              badges={{
                listings: listings.length,
                notifications: reports.length
              }}
              showAdmin
            />
            <Link className="flex min-w-0 items-center gap-3" href="/">
              <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-black tracking-[0.2em] text-yellow-300">
                  NexoTCG
                </p>
                <p className="truncate text-xs font-bold text-blue-100">ADMIN</p>
              </div>
            </Link>
          </div>
          <ButtonLink href="/account" icon={ArrowLeft} size="sm" variant="secondary">
            Mi cuenta
          </ButtonLink>
        </nav>
      </header>
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(250,204,21,0.18),transparent_32%),linear-gradient(135deg,#123cba_0%,#071535_72%)]">
        <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(120deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ButtonLink href="/account" icon={ArrowLeft} variant="secondary">
            Volver a mi cuenta
          </ButtonLink>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-yellow-300/70 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
                <Sparkles className="h-4 w-4" />
                Administración
              </p>
              <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
                Centro de moderación
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-blue-100">
                Revisa publicaciones, sorteos, reportes, permisos y métricas internas
                para mantener el marketplace confiable.
              </p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-[0_20px_60px_rgba(0,0,0,.25)] backdrop-blur">
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-yellow-300">
                <ShieldCheck className="h-4 w-4" />
                Acción pendiente
              </p>
              <p className="mt-3 text-5xl font-black">{totalPending}</p>
              <p className="mt-1 text-sm font-bold text-blue-100">
                Elementos esperando revisión
              </p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-black">
                <span className="rounded-md bg-white/10 px-2 py-2">{listings.length} productos</span>
                <span className="rounded-md bg-white/10 px-2 py-2">{raffles.length} sorteos</span>
                <span className="rounded-md bg-white/10 px-2 py-2">{reports.length} reportes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {queues.map((item) => (
          <article
            className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_45px_rgba(0,0,0,.18)]"
            key={item.label}
          >
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-yellow-400 text-blue-950">
              <item.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-3xl font-black text-white">{item.value}</p>
            <p className="mt-1 text-sm font-semibold text-blue-100">{item.label}</p>
          </article>
        ))}
      </section>
      <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.05] p-3">
        <nav
          aria-label="Accesos rapidos del panel administrador"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {[
            ["#reportes", "Reportes"],
            ["#sorteos", "Sorteos"],
            ["#publicaciones", "Publicaciones"],
            ["#lanzamiento", "Lanzamiento"],
            ["#actividad", "Actividad"],
            currentProfile?.is_super_admin ? ["#permisos", "Permisos"] : null
          ]
            .filter(Boolean)
            .map((item) => {
              const [href, label] = item as [string, string];

              return (
                <Link
                  className="shrink-0 rounded-md border border-white/10 bg-slate-950/35 px-4 py-2 text-sm font-black text-blue-100 transition hover:border-yellow-300 hover:text-yellow-300"
                  href={href}
                  key={href}
                >
                  {label}
                </Link>
              );
          })}
        </nav>
      </section>
      <section className="glass mt-8 scroll-mt-24 rounded-lg p-5" id="lanzamiento">
        <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-5 lg:flex-row lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-yellow-300/40 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-yellow-300">
              <Rocket className="h-4 w-4" />
              Preparación de lanzamiento
            </p>
            <h2 className="mt-3 text-2xl font-black text-white">Checklist para abrir la página</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Este bloque resume lo que todavía conviene revisar antes de invitar usuarios reales.
              Los puntos externos requieren entrar a Vercel, Supabase o al proveedor del dominio.
            </p>
          </div>
          <div className="min-w-[180px] rounded-lg border border-white/10 bg-white/[0.05] p-4 text-center">
            <p className="text-4xl font-black text-white">{launchProgress}%</p>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-blue-100">
              listo en app
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {launchChecks.map((check) => (
            <article
              className={[
                "rounded-lg border p-4",
                check.ready
                  ? "border-emerald-300/30 bg-emerald-500/10"
                  : "border-yellow-300/30 bg-yellow-400/10"
              ].join(" ")}
              key={check.label}
            >
              <div className="flex items-start gap-3">
                <span
                  className={[
                    "grid h-10 w-10 shrink-0 place-items-center rounded-lg",
                    check.ready ? "bg-emerald-400 text-emerald-950" : "bg-yellow-400 text-slate-950"
                  ].join(" ")}
                >
                  <check.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-black text-white">{check.label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{check.detail}</p>
                  <p
                    className={[
                      "mt-3 text-xs font-black uppercase tracking-[0.14em]",
                      check.ready ? "text-emerald-200" : "text-yellow-200"
                    ].join(" ")}
                  >
                    {check.ready ? "Listo" : "Pendiente"}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-5 rounded-lg border border-blue-300/20 bg-blue-500/10 p-4">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-100">
            Pendientes externos
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {externalLaunchItems.map((item) => (
              <article className="flex items-start gap-3 rounded-lg border border-white/10 bg-slate-950/30 p-4" key={item.label}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-400 text-blue-950">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-black text-white">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{item.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      {totalPending > 0 ? (
        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <article className="rounded-lg border border-red-300/30 bg-red-500/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-200">
              Prioridad alta
            </p>
            <h2 className="mt-2 text-xl font-black text-white">Reportes abiertos</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Revisalos primero si hay sospecha de estafa, producto falso o comportamiento riesgoso.
            </p>
          </article>
          <article className="rounded-lg border border-yellow-300/30 bg-yellow-400/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-yellow-200">
              Prioridad media
            </p>
            <h2 className="mt-2 text-xl font-black text-white">Publicaciones pendientes</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Validá carta oficial o fotos reales, estado, precio, descripción y que no haya señales engañosas.
            </p>
          </article>
          <article className="rounded-lg border border-blue-300/30 bg-blue-500/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-200">
              Prioridad normal
            </p>
            <h2 className="mt-2 text-xl font-black text-white">Sorteos pendientes</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Confirmá premio, fecha de cierre y condiciones claras antes de aprobar.
            </p>
          </article>
        </section>
      ) : (
        <section className="mt-8 rounded-lg border border-emerald-300/30 bg-emerald-500/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-200">
            Todo al día
          </p>
          <h2 className="mt-2 text-xl font-black text-white">No hay acciones pendientes</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Las nuevas publicaciones, sorteos o reportes aparecerán en estas colas.
          </p>
        </section>
      )}
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
              {hasCommissionLedger ? "Registro interno activo" : "Sin pagos reales conectados"}
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
          {hasCommissionLedger ? (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {commissionMetrics.map((metric) => (
                <article className="rounded-lg border border-white/10 bg-slate-950/30 p-4" key={metric.label}>
                  <metric.icon className="h-5 w-5 text-pokemonYellow" />
                  <p className="mt-3 break-words text-2xl font-black text-white">{metric.value}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">{metric.label}</p>
                </article>
              ))}
            </div>
          ) : null}
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
                  Referencia interna para controlar comisiones y ventas confirmadas.
                </p>
              </div>
              <span className="rounded-full border border-yellow-300/30 px-3 py-1 text-xs font-black text-yellow-200">
                5% por venta
              </span>
            </div>
            {hasCommissionLedger ? (
              <AdminCommissions
                commissions={closedSaleRows}
                ledgerEnabled={hasCommissionLedger}
              />
            ) : closedSaleRows.length > 0 ? (
              <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-white/[0.04] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Producto</th>
                      <th className="px-4 py-3">Vendedor</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3 text-right">Venta</th>
                      <th className="px-4 py-3 text-right">Comisión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {closedSaleRows.map((sale) => (
                      <tr key={sale.id}>
                        <td className="px-4 py-3">
                          <p className="font-black text-white">{sale.productName}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">{sale.productMeta}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-300">{sale.seller}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-black uppercase text-slate-300">
                            {sale.status}
                          </span>
                        </td>
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
          <div className="mt-5 border-t border-white/10 pt-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-300">
                  Órdenes de pago Mercado Pago
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Control de pagos iniciados, aprobados, pendientes o rechazados.
                </p>
              </div>
              <span className="rounded-full border border-blue-300/30 px-3 py-1 text-xs font-black text-blue-100">
                {paymentRows.length} órdenes
              </span>
            </div>
            <AdminPayments payments={paymentRows} />
          </div>
        </section>
      ) : null}
      <section className="glass mt-8 scroll-mt-24 overflow-hidden rounded-lg" id="sorteos">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-xl font-black text-white">Cola de sorteos</h2>
        </div>
        <AdminRaffles raffles={raffles} />
      </section>
      <section className="glass mt-8 scroll-mt-24 overflow-hidden rounded-lg" id="publicaciones">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-xl font-black text-white">Cola de publicaciones</h2>
        </div>
        <AdminListings listings={listings} />
      </section>
      <section className="glass mt-8 scroll-mt-24 overflow-hidden rounded-lg" id="actividad">
        <div className="flex flex-col justify-between gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
              Auditoria interna
            </p>
            <h2 className="mt-2 text-xl font-black text-white">Actividad reciente</h2>
            <p className="mt-2 text-sm text-slate-400">
              Ultimas aprobaciones y rechazos registrados por administradores.
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-slate-300">
            {auditLogs.length} movimientos
          </span>
        </div>
        {auditLogs.length > 0 ? (
          <div className="divide-y divide-white/10">
            {auditLogs.map((log) => (
              <article className="grid gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center" key={log.id}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={[
                        "rounded-full border px-3 py-1 text-xs font-black",
                        auditTone(log.action)
                      ].join(" ")}
                    >
                      {auditActionLabel(log.action)}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {log.entityType}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-300">
                    Moderado por <span className="text-white">{log.actor}</span>
                  </p>
                  {log.reason ? (
                    <p className="mt-2 rounded-md border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm font-semibold text-red-100">
                      {log.reason}
                    </p>
                  ) : null}
                </div>
                <time className="text-sm font-semibold text-slate-400">
                  {new Intl.DateTimeFormat("es-AR", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  }).format(new Date(log.createdAt))}
                </time>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-5 text-sm font-semibold text-slate-400">
            Todavia no hay movimientos de moderacion registrados.
          </div>
        )}
      </section>
      <section className="glass mt-8 scroll-mt-24 overflow-hidden rounded-lg" id="reportes">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-xl font-black text-white">Reportes abiertos</h2>
        </div>
        <AdminReports reports={reports} />
      </section>
      {currentProfile?.is_super_admin && user ? (
        <section className="glass mt-8 scroll-mt-24 overflow-hidden rounded-lg" id="permisos">
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
      </div>
    </main>
  );
}
