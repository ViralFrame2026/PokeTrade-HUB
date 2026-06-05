"use client";

import { useState } from "react";
import { Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthFormProps = {
  nextPath: string;
};

export function AuthForm({ nextPath }: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const supabase = createSupabaseBrowserClient();

    try {
      if (mode === "register") {
        const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          nextPath
        )}`;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName.trim()
            },
            emailRedirectTo
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.session) {
          window.location.assign(nextPath);
          return;
        }

        setMessage("Revisa tu email y confirma la cuenta para continuar.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        throw signInError;
      }

      window.location.assign(nextPath);
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "No pudimos completar la autenticacion."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-2 rounded-lg border border-white/10 bg-slate-950/70 p-1">
        <button
          className={`rounded-md px-3 py-2 text-sm font-bold transition ${
            mode === "login" ? "bg-pokemonYellow text-slate-950" : "text-slate-300"
          }`}
          onClick={() => {
            setMode("login");
            setError(null);
            setMessage(null);
          }}
          type="button"
        >
          Ingresar
        </button>
        <button
          className={`rounded-md px-3 py-2 text-sm font-bold transition ${
            mode === "register" ? "bg-pokemonYellow text-slate-950" : "text-slate-300"
          }`}
          onClick={() => {
            setMode("register");
            setError(null);
            setMessage(null);
          }}
          type="button"
        >
          Crear cuenta
        </button>
      </div>

      <form className="mt-5" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <label className="block text-sm font-bold text-slate-200">
            Nombre publico
            <div className="relative mt-2">
              <UserRound className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                autoComplete="name"
                className="w-full rounded-lg border border-white/10 bg-slate-950/70 py-3 pl-10 pr-3 text-white outline-none focus:border-pokemonYellow/60"
                minLength={2}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Entrenador TCG"
                required
                type="text"
                value={displayName}
              />
            </div>
          </label>
        ) : null}

        <label className={`${mode === "register" ? "mt-4" : ""} block text-sm font-bold text-slate-200`}>
          Email
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input
              autoComplete="email"
              className="w-full rounded-lg border border-white/10 bg-slate-950/70 py-3 pl-10 pr-3 text-white outline-none focus:border-pokemonYellow/60"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              required
              type="email"
              value={email}
            />
          </div>
        </label>

        <label className="mt-4 block text-sm font-bold text-slate-200">
          Contrasena
          <div className="relative mt-2">
            <LockKeyhole className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full rounded-lg border border-white/10 bg-slate-950/70 py-3 pl-10 pr-3 text-white outline-none focus:border-pokemonYellow/60"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimo 6 caracteres"
              required
              type="password"
              value={password}
            />
          </div>
        </label>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm font-semibold text-red-100">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-100">
            {message}
          </p>
        ) : null}

        <button
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-pokemonYellow px-5 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "login" ? "Ingresar" : "Crear cuenta"}
        </button>
      </form>
    </>
  );
}
