import { ArrowLeft, Inbox, MessageCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type MessageRow = {
  body: string;
  created_at: string;
  listing_id: string | null;
  read_at: string | null;
  recipient_id: string;
  sender_id: string;
};

export default async function MessagesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account/messages");

  const { data } = await supabase
    .from("messages")
    .select("sender_id, recipient_id, listing_id, body, read_at, created_at")
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const messages = (data ?? []) as MessageRow[];
  const conversationMap = new Map<string, MessageRow>();

  for (const message of messages) {
    if (!message.listing_id) continue;
    const otherId =
      message.sender_id === user.id ? message.recipient_id : message.sender_id;
    const key = `${message.listing_id}:${otherId}`;
    if (!conversationMap.has(key)) conversationMap.set(key, message);
  }

  const conversations = [...conversationMap.entries()];
  const otherIds = [...new Set(conversations.map(([key]) => key.split(":")[1]))];
  const listingIds = [
    ...new Set(conversations.map(([, message]) => message.listing_id).filter(Boolean))
  ] as string[];
  const [{ data: profiles }, { data: listings }] = await Promise.all([
    otherIds.length
      ? supabase.from("profiles").select("id, display_name").in("id", otherIds)
      : Promise.resolve({ data: [] }),
    listingIds.length
      ? supabase.from("listings").select("id, title").in("id", listingIds)
      : Promise.resolve({ data: [] })
  ]);
  const profileNames = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile.display_name])
  );
  const listingTitles = new Map(
    (listings ?? []).map((listing) => [listing.id, listing.title])
  );

  return (
    <main className="min-h-screen bg-[#eaf2ff] text-slate-900">
      <header className="border-b-4 border-yellow-400 bg-blue-800 text-white">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link className="flex items-center gap-3" href="/">
            <span className="pokeball h-10 w-10 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-black tracking-[0.2em] text-yellow-300">POKETRADE</p>
              <p className="text-xs font-bold text-blue-100">MENSAJES</p>
            </div>
          </Link>
          <MessageCircle className="h-6 w-6 text-yellow-300" />
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900"
          href="/"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
        <h1 className="mt-5 text-4xl font-black text-blue-950">Mensajes</h1>
        <p className="mt-2 text-slate-600">
          Conversaciones vinculadas a publicaciones de la comunidad.
        </p>

        {conversations.length ? (
          <div className="mt-8 overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
            {conversations.map(([key, message]) => {
              const [listingId, otherId] = key.split(":");
              const isUnread =
                message.recipient_id === user.id && message.read_at === null;

              return (
                <Link
                  className="flex items-center gap-4 border-b border-blue-100 p-4 transition last:border-b-0 hover:bg-blue-50 sm:p-5"
                  href={`/account/messages/${listingId}/${otherId}`}
                  key={key}
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-800 font-black text-yellow-300">
                    {(profileNames.get(otherId) ?? "TC").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="truncate font-black text-blue-950">
                        {profileNames.get(otherId) ?? "Entrenador TCG"}
                      </h2>
                      {isUnread ? (
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                      ) : null}
                    </div>
                    <p className="truncate text-xs font-bold text-blue-600">
                      {listingTitles.get(listingId) ?? "Publicacion"}
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-500">{message.body}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 grid min-h-72 place-items-center rounded-lg border-2 border-dashed border-blue-200 bg-white px-6 text-center">
            <div>
              <Inbox className="mx-auto h-10 w-10 text-blue-400" />
              <h2 className="mt-4 text-xl font-black text-blue-950">
                Todavia no tienes conversaciones
              </h2>
              <p className="mt-2 text-slate-600">
                Abre una publicacion y envia un mensaje al vendedor.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
