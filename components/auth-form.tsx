"use client";

import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthFormProps = {
  initialError?: string | null;
  nextPath: string;
};

function friendlyAuthError(error: unknown) {
  if (!(error instanceof Error)) {
    return "No pudimos completar la autenticacion.";
  }

  const message = error.message.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "Email o contrasena incorrectos.";
  }

  if (message.includes("email not confirmed")) {
    return "Todavia falta confirmar tu email antes de ingresar.";
  }

  if (message.includes("user already registered") || message.includes("already registered")) {
    return "Ya existe una cuenta con ese email. Intenta ingresar.";
  }

  if (message.includes("password should be at least") || message.includes("weak password")) {
    return "La contrasena es demasiado debil. Usa al menos 6 caracteres, letras y numeros.";
  }

  if (message.includes("rate limit") || message.includes("too many")) {
    return "Hubo demasiados intentos. Espera un momento y vuelve a probar.";
  }

  if (message.includes("network") || message.includes("fetch")) {
    return "No pudimos conectar con el servidor. Revisa tu conexion e intenta de nuevo.";
  }

  return error.message || "No pudimos completar la autenticacion.";
}

export function AuthForm({ initialError = null, nextPath }: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordChecks = [
    { label: "6 caracteres minimo", valid: password.length >= 6 },
    { label: "Incluye una letra", valid: /[a-zA-Z]/.test(password) },
    { label: "Incluye un numero", valid: /\d/.test(password) }
  ];
  const passwordScore = passwordChecks.filter((check) => check.valid).length;
  const passwordStrength =
    passwordScore === 3 ? "Fuerte" : passwordScore === 2 ? "Correcta" : "Basica";

  function changeMode(nextMode: "login" | "register" | "reset") {
    setMode(nextMode);
    setError(null);
    setMessage(null);
    if (nextMode === "reset") setPassword("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const supabase = createSupabaseBrowserClient();
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (mode === "register") {
        if (displayName.trim().length < 2) {
          setError("El nombre publico debe tener al menos 2 caracteres.");
          return;
        }

        if (passwordScore < 2) {
          setError("Usa una contrasena un poco mas fuerte antes de crear la cuenta.");
          return;
        }

        const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          nextPath
        )}`;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              display_name: displayName.trim()
            },
            emailRedirectTo
          }
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          window.location.assign(nextPath);
          return;
        }

        setMessage("Revisa tu email y confirma la cuenta para continuar.");
        return;
      }

      if (mode === "reset") {
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          "/account/password"
        )}`;
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo
        });

        if (resetError) throw resetError;

        setMessage("Te enviamos un enlace para cambiar tu contrasena.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (signInError) throw signInError;

      window.location.assign(nextPath);
    } catch (authError) {
      setError(friendlyAuthError(authError));
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
          onClick={() => changeMode("login")}
          type="button"
        >
          Ingresar
        </button>
        <button
          className={`rounded-md px-3 py-2 text-sm font-bold transition ${
            mode === "register" ? "bg-pokemonYellow text-slate-950" : "text-slate-300"
          }`}
          onClick={() => changeMode("register")}
          type="button"
        >
          Crear cuenta
        </button>
      </div>

      <form className="mt-5" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <>
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
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Este nombre se vera en tus publicaciones, mensajes y sorteos.
            </p>
          </>
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

        {mode !== "reset" ? (
          <label className="mt-4 block text-sm font-bold text-slate-200">
            Contrasena
            <div className="relative mt-2">
              <LockKeyhole className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full rounded-lg border border-white/10 bg-slate-950/70 py-3 pl-10 pr-12 text-white outline-none focus:border-pokemonYellow/60"
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimo 6 caracteres"
                required
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-md text-slate-400 transition hover:bg-white/10 hover:text-pokemonYellow"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {mode === "register" ? (
              <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-300">
                    Seguridad
                  </p>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-black ${
                      passwordScore === 3
                        ? "bg-emerald-400 text-emerald-950"
                        : passwordScore === 2
                          ? "bg-yellow-400 text-slate-950"
                          : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {passwordStrength}
                  </span>
                </div>
                <div className="mt-3 grid gap-2">
                  {passwordChecks.map((check) => (
                    <p
                      className={`flex items-center gap-2 text-xs font-semibold ${
                        check.valid ? "text-emerald-200" : "text-slate-400"
                      }`}
                      key={check.label}
                    >
                      <CheckCircle2
                        className={`h-4 w-4 ${
                          check.valid ? "fill-emerald-400 text-emerald-400" : "text-slate-600"
                        }`}
                      />
                      {check.label}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
          </label>
        ) : (
          <p className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-sm leading-6 text-slate-300">
            Ingresa tu email y te enviaremos un enlace para crear una nueva contrasena.
          </p>
        )}

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

        {mode === "register" ? (
          <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs leading-5 text-slate-300">
            Al crear la cuenta vas a poder publicar cartas, guardar favoritos, enviar
            mensajes, participar en sorteos y construir reputacion.
          </div>
        ) : null}

        <button
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-pokemonYellow px-5 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "login"
            ? "Ingresar"
            : mode === "register"
              ? "Crear cuenta"
              : "Enviar enlace"}
        </button>

        <p className="mt-4 text-center text-xs leading-5 text-slate-400">
          Al usar PokeTrade aceptas operar bajo las{" "}
          <Link className="font-bold text-pokemonYellow hover:text-yellow-200" href="/rules">
            reglas de comunidad
          </Link>
          , la{" "}
          <Link className="font-bold text-pokemonYellow hover:text-yellow-200" href="/privacy">
            privacidad
          </Link>{" "}
          y los{" "}
          <Link className="font-bold text-pokemonYellow hover:text-yellow-200" href="/terms">
            terminos
          </Link>
          .
        </p>

        {mode === "login" ? (
          <button
            className="mt-4 w-full text-center text-sm font-bold text-pokemonYellow transition hover:text-yellow-200"
            onClick={() => changeMode("reset")}
            type="button"
          >
            Olvide mi contrasena
          </button>
        ) : mode === "reset" ? (
          <button
            className="mt-4 w-full text-center text-sm font-bold text-pokemonYellow transition hover:text-yellow-200"
            onClick={() => changeMode("login")}
            type="button"
          >
            Volver a ingresar
          </button>
        ) : null}
      </form>
    </>
  );
}
