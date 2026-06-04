import { AlertTriangle, CheckCircle2, FileWarning, ShieldCheck, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
  title: "Panel Administrador"
};

const queues = [
  { icon: FileWarning, label: "Publicaciones pendientes", value: "42" },
  { icon: AlertTriangle, label: "Reportes abiertos", value: "13" },
  { icon: Users, label: "Solicitudes de verificacion", value: "8" },
  { icon: CheckCircle2, label: "Aprobadas hoy", value: "27" }
];

export default function AdminPage() {
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-white/[0.04] text-slate-400">
              <tr>
                <th className="px-5 py-4">Titulo</th>
                <th className="px-5 py-4">Tipo</th>
                <th className="px-5 py-4">Usuario</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {[
                ["Charizard holo", "Intercambio", "Jota Rarezas", "Pendiente"],
                ["ETB sellada", "Venta", "Andes TCG", "Pendiente"],
                ["Sorteo pack 151", "Sorteo", "Mica Poke", "Cambios solicitados"]
              ].map(([title, type, user, status]) => (
                <tr key={title}>
                  <td className="px-5 py-4 font-bold text-white">{title}</td>
                  <td className="px-5 py-4 text-slate-300">{type}</td>
                  <td className="px-5 py-4 text-slate-300">{user}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-pokemonYellow/10 px-3 py-1 font-bold text-pokemonYellow">
                      {status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="rounded-lg border border-white/10 px-3 py-2 font-bold text-white">
                      Revisar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
