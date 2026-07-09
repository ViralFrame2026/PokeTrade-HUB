import Link from "next/link";

export type AdminPayment = {
  amount: number;
  buyer: string;
  createdAt: string;
  id: string;
  listingId: string;
  paymentId: string | null;
  providerStatus: string | null;
  seller: string;
  status: string;
  title: string;
};

const statusLabels: Record<string, string> = {
  approved: "Aprobado",
  cancelled: "Cancelado",
  expired: "Vencido",
  pending: "Pendiente",
  refunded: "Devuelto",
  rejected: "Rechazado"
};

function moneyLabel(value: number) {
  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value);
}

function statusClassName(status: string) {
  return {
    approved: "border-emerald-300/30 bg-emerald-500/10 text-emerald-100",
    cancelled: "border-red-300/30 bg-red-500/10 text-red-100",
    expired: "border-slate-400/30 bg-slate-400/10 text-slate-300",
    pending: "border-yellow-300/30 bg-yellow-400/10 text-yellow-100",
    refunded: "border-blue-300/30 bg-blue-500/10 text-blue-100",
    rejected: "border-red-300/30 bg-red-500/10 text-red-100"
  }[status] ?? "border-white/10 bg-white/[0.06] text-slate-300";
}

export function AdminPayments({ payments }: { payments: AdminPayment[] }) {
  if (payments.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-slate-400">
        Todavía no hay órdenes de pago.
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="bg-white/[0.04] text-slate-400">
          <tr>
            <th className="px-4 py-3">Orden</th>
            <th className="px-4 py-3">Publicación</th>
            <th className="px-4 py-3">Comprador</th>
            <th className="px-4 py-3">Vendedor</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Mercado Pago</th>
            <th className="px-4 py-3 text-right">Monto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="px-4 py-3">
                <p className="font-mono text-xs font-bold text-slate-300">
                  {payment.id.slice(0, 8)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Intl.DateTimeFormat("es-AR", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  }).format(new Date(payment.createdAt))}
                </p>
              </td>
              <td className="px-4 py-3">
                <Link
                  className="font-black text-white transition hover:text-yellow-300"
                  href={`/listings/${payment.listingId}`}
                >
                  {payment.title}
                </Link>
              </td>
              <td className="px-4 py-3 font-semibold text-slate-300">{payment.buyer}</td>
              <td className="px-4 py-3 font-semibold text-slate-300">{payment.seller}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${statusClassName(
                    payment.status
                  )}`}
                >
                  {statusLabels[payment.status] ?? payment.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-300">
                  {payment.providerStatus ?? "Sin confirmar"}
                </p>
                {payment.paymentId ? (
                  <p className="mt-1 font-mono text-xs text-slate-500">ID {payment.paymentId}</p>
                ) : null}
              </td>
              <td className="px-4 py-3 text-right font-black text-yellow-300">
                {moneyLabel(payment.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

