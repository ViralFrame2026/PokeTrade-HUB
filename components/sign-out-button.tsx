"use client";

import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-300 px-4 py-2 text-sm font-black text-blue-100 transition hover:border-red-300 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isSigningOut}
      onClick={signOut}
      type="button"
    >
      {isSigningOut ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">Cerrar sesion</span>
    </button>
  );
}
