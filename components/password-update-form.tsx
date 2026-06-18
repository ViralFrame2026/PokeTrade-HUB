"use client";

import { Eye, EyeOff, Loader2, LockKeyhole, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function PasswordUpdateForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) throw updateError;

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "No pudimos actualizar la contraseña."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm sm:p-7"
      onSubmit={updatePassword}
    >
      <div className="grid gap-4">
        <PasswordField
          label="Nueva contraseña"
          onChange={setPassword}
          showPassword={showPassword}
          value={password}
        />
        <PasswordField
          label="Confirmar contraseña"
          onChange={setConfirmPassword}
          showPassword={showPassword}
          value={confirmPassword}
        />
      </div>

      <button
        className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900"
        onClick={() => setShowPassword((current) => !current)}
        type="button"
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      </button>

      {error ? (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          Contraseña actualizada correctamente.
        </div>
      ) : null}

      <button
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 py-3 font-black text-blue-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        Guardar contraseña
      </button>
    </form>
  );
}

function PasswordField({
  label,
  onChange,
  showPassword,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  value: string;
}) {
  return (
    <label className="text-sm font-bold text-blue-950">
      {label}
      <div className="relative mt-2">
        <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
        <input
          autoComplete="new-password"
          className="w-full rounded-lg border border-blue-200 bg-white px-10 py-3 text-blue-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          minLength={6}
          onChange={(event) => onChange(event.target.value)}
          required
          type={showPassword ? "text" : "password"}
          value={value}
        />
      </div>
    </label>
  );
}
