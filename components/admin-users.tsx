"use client";

import { Loader2, Search, Shield, ShieldOff, Star, UserCheck, X } from "lucide-react";
import { useState } from "react";

export type AdminUser = {
  displayName: string;
  id: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  joinedAt: string;
};

export function AdminUsers({
  currentUserId,
  users: initialUsers
}: {
  currentUserId: string;
  users: AdminUser[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admins" | "users">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredUsers = users.filter((user) => {
    const matchesQuery =
      !normalizedQuery ||
      user.displayName.toLowerCase().includes(normalizedQuery) ||
      user.id.toLowerCase().includes(normalizedQuery);
    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admins" && user.isAdmin) ||
      (roleFilter === "users" && !user.isAdmin);

    return matchesQuery && matchesRole;
  });
  const adminCount = users.filter((user) => user.isAdmin).length;

  async function setAdmin(user: AdminUser, enabled: boolean) {
    const action = enabled ? "dar permisos de administrador" : "retirar los permisos";
    if (!window.confirm(`¿Confirmas ${action} a ${user.displayName}?`)) return;

    setBusyId(user.id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        body: JSON.stringify({ enabled }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      });
      const payload = (await response.json()) as { error: string | null };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos actualizar los permisos.");
      }

      setUsers((current) =>
        current.map((item) => (item.id === user.id ? { ...item, isAdmin: enabled } : item))
      );
    } catch (permissionError) {
      setError(
        permissionError instanceof Error
          ? permissionError.message
          : "No pudimos actualizar los permisos."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {error ? (
        <div className="m-5 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-100">
          {error}
        </div>
      ) : null}
      <div className="grid gap-4 border-b border-white/10 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-500" />
          <input
            className="w-full rounded-lg border border-white/10 bg-slate-950/70 py-3 pl-10 pr-10 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-pokemonYellow/70"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre o ID de usuario"
            type="search"
            value={query}
          />
          {query ? (
            <button
              aria-label="Limpiar busqueda"
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-md text-slate-400 transition hover:bg-white/10 hover:text-white"
              onClick={() => setQuery("")}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: `Todos (${users.length})`, value: "all" },
            { label: `Admins (${adminCount})`, value: "admins" },
            { label: `Usuarios (${users.length - adminCount})`, value: "users" }
          ].map((filter) => (
            <button
              className={`rounded-full px-4 py-2 text-xs font-black transition ${
                roleFilter === filter.value
                  ? "bg-pokemonYellow text-slate-950"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:border-pokemonYellow/60 hover:text-white"
              }`}
              key={filter.value}
              onClick={() => setRoleFilter(filter.value as "all" | "admins" | "users")}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/[0.04] text-slate-400">
            <tr>
              <th className="px-5 py-4">Usuario</th>
              <th className="px-5 py-4">Registro</th>
              <th className="px-5 py-4">Rol</th>
              <th className="px-5 py-4 text-right">Permisos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-5 py-4">
                  <p className="font-bold text-white">{user.displayName}</p>
                  <p className="mt-1 font-mono text-xs text-slate-500">{user.id}</p>
                </td>
                <td className="px-5 py-4 text-slate-400">
                  {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(
                    new Date(user.joinedAt)
                  )}
                </td>
                <td className="px-5 py-4">
                  {user.isSuperAdmin ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-slate-950">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      Administrador principal
                    </span>
                  ) : user.isAdmin ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-black text-blue-200">
                      <Shield className="h-3.5 w-3.5" />
                      Administrador
                    </span>
                  ) : (
                    <span className="text-slate-400">Usuario</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  {user.isSuperAdmin || user.id === currentUserId ? (
                    <span className="text-xs font-semibold text-slate-500">Protegido</span>
                  ) : (
                    <button
                      className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black disabled:opacity-60 ${
                        user.isAdmin
                          ? "border border-red-300/30 bg-red-500/10 text-red-100"
                          : "bg-emerald-400 text-emerald-950"
                      }`}
                      disabled={busyId === user.id}
                      onClick={() => setAdmin(user, !user.isAdmin)}
                      type="button"
                    >
                      {busyId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : user.isAdmin ? (
                        <ShieldOff className="h-4 w-4" />
                      ) : (
                        <Shield className="h-4 w-4" />
                      )}
                      {user.isAdmin ? "Retirar permiso" : "Hacer administrador"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 ? (
          <div className="grid place-items-center px-5 py-12 text-center">
            <UserCheck className="h-10 w-10 text-slate-500" />
            <p className="mt-3 font-black text-white">No encontramos usuarios</p>
            <p className="mt-1 max-w-md text-sm text-slate-400">
              Cambia el texto de busqueda o limpia el filtro de rol para volver a ver la lista.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
