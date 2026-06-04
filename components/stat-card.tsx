import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <article className="glass rounded-lg p-5">
      <Icon className="h-6 w-6 text-pokemonYellow" />
      <p className="mt-4 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-400">{label}</p>
    </article>
  );
}
