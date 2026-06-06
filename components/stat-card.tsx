import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <article className="rounded-lg border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
      <Icon className="h-6 w-6 text-yellow-300" />
      <p className="mt-4 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm font-semibold text-blue-100">{label}</p>
    </article>
  );
}
