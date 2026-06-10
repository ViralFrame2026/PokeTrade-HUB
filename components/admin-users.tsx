"use client";

import { Loader2, Shield, ShieldOff, Star } from "lucide-react";
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
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
            {users.map((user) => (
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
      </div>
    </div>
  );
}
