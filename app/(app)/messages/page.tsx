"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { formatDistanceToNowStrict, format, isSameDay } from "date-fns";
import Person from "@/components/world/Person";
import { EmptyState, ErrorNote, Skeleton } from "@/components/app/Ui";

type Who = { id: string; name: string; profilePicture?: string | null; image?: string | null };
type Conversation = {
  id: string;
  otherUser: Who;
  lastMessage?: { content: string; createdAt: string; senderId: string } | null;
  updatedAt: string;
};
type Message = { id: string; content: string; createdAt: string; senderId: string };
// The API stores message time as `timestamp`; normalise to createdAt.
const norm = (m: Message & { timestamp?: string }): Message => ({ ...m, createdAt: m.createdAt ?? m.timestamp ?? new Date().toISOString() });

const ago = (iso: string) => (Date.now() - new Date(iso).getTime() < 60000 ? "now" : formatDistanceToNowStrict(new Date(iso)));
const pic = (u?: Who) => u?.profilePicture ?? u?.image ?? null;

export default function MessagesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[70dvh]" />}>
      <Messages />
    </Suspense>
  );
}

function Messages() {
  const { status } = useSession();
  const params = useSearchParams();
  const router = useRouter();
  const partnerId = params.get("partnerId");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [partners, setPartners] = useState<Who[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [c, p] = await Promise.all([fetch("/api/conversations/list"), fetch("/api/mentorships/available")]);
    if (!c.ok) throw new Error("Could not load your conversations.");
    const convs: Conversation[] = await c.json();
    setConversations(convs);
    setPartners(p.ok ? await p.json() : []);
    return convs;
  }, []);

  const openWith = useCallback(
    async (userId: string, convs: Conversation[]) => {
      const existing = convs.find((c) => c.otherUser.id === userId);
      if (existing) return setSelected(existing);
      const res = await fetch("/api/conversations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        setError((await res.json().catch(() => ({}))).error || "You can only message people you have a mentorship with.");
        return;
      }
      const data = await res.json();
      const conv: Conversation = { id: data.conversation.id, otherUser: data.otherUser, updatedAt: new Date().toISOString() };
      setConversations((prev) => [conv, ...prev.filter((x) => x.id !== conv.id)]);
      setSelected(conv);
    },
    []
  );

  const started = useRef(false);
  useEffect(() => {
    if (status !== "authenticated" || started.current) return;
    started.current = true;
    load()
      .then((convs) => (partnerId ? openWith(partnerId, convs) : undefined))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status, partnerId, load, openWith]);

  const unstarted = useMemo(
    () => partners.filter((p) => !conversations.some((c) => c.otherUser.id === p.id)),
    [partners, conversations]
  );

  const select = (c: Conversation) => {
    setSelected(c);
    if (partnerId) router.replace("/messages");
  };

  if (loading) return <Skeleton className="h-[70dvh]" />;

  return (
    <div className="route-card grid h-[calc(100dvh-8.5rem)] min-h-[520px] overflow-hidden p-0 md:grid-cols-[320px_1fr] lg:h-[calc(100dvh-5rem)]">
      <aside className={`min-h-0 min-w-0 flex-col overflow-hidden border-ink/8 md:border-r ${selected ? "hidden md:flex" : "flex"}`}>
        <div className="px-5 pb-3 pt-5">
          <h1 className="text-[1.9rem]">Messages</h1>
        </div>
        {error && <div className="px-4 pb-3"><ErrorNote message={error} /></div>}
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
          {conversations.length === 0 && unstarted.length === 0 ? (
            <div className="px-3 pt-4">
              <EmptyState
                title="No one to message yet."
                body="Messages open once a mentorship is accepted."
              />
            </div>
          ) : (
            <ul className="grid gap-0.5 [&>li]:min-w-0">
              {conversations.map((c) => {
                const on = selected?.id === c.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => select(c)}
                      aria-current={on ? "true" : undefined}
                      className={`flex w-full items-center gap-3 rounded-[12px] px-3 py-3 text-left transition-colors ${on ? "bg-tape-yellow/35" : "hover:bg-ink/[0.04]"}`}
                    >
                      <Person name={c.otherUser.name} src={pic(c.otherUser)} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate font-semibold">{c.otherUser.name}</span>
                          {c.lastMessage && (
                            <span className="shrink-0 text-xs text-ink-soft">
                              {ago(norm(c.lastMessage as Message).createdAt)}
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-sm text-ink-soft">
                          {c.lastMessage?.content ?? "No messages yet"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {unstarted.length > 0 && (
            <>
              <h2 className="px-3 pb-1 pt-5 text-sm font-semibold text-ink-soft">Start a conversation</h2>
              <ul className="grid gap-0.5 [&>li]:min-w-0">
                {unstarted.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => openWith(p.id, conversations)}
                      className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left hover:bg-ink/[0.04]"
                    >
                      <Person name={p.name} src={pic(p)} size="sm" />
                      <span className="truncate font-medium">{p.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </aside>

      <section className={`min-h-0 flex-col ${selected ? "flex" : "hidden md:flex"}`} aria-label="Conversation">
        {selected ? (
          <Chat
            key={selected.id}
            conversation={selected}
            onBack={() => setSelected(null)}
            onSent={(m) =>
              setConversations((prev) => {
                const hit = prev.find((c) => c.id === selected.id);
                const updated = { ...(hit ?? selected), lastMessage: m, updatedAt: m.createdAt };
                return [updated, ...prev.filter((c) => c.id !== selected.id)];
              })
            }
          />
        ) : (
          <div className="grid flex-1 place-items-center p-8 text-center">
            <div>
              <p className="text-lg font-semibold">Pick a conversation</p>
              <p className="mt-1 text-ink-soft">Your mentor and mentees are on the left.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Chat({ conversation, onBack, onSent }: { conversation: Conversation; onBack: () => void; onSent: (m: Message) => void }) {
  const { data: session } = useSession();
  const me = session?.user?.id;
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/messages/load", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: conversation.id }),
    });
    const data = res.ok ? await res.json().catch(() => null) : null;
    if (Array.isArray(data)) setMessages(data.map(norm));
    else setMessages((m) => m ?? []);
  }, [conversation.id]);

  // Poll while the conversation is open so replies arrive without a refresh.
  useEffect(() => {
    load();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 8000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages?.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setError(null);
    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: conversation.id, content }),
    });
    setSending(false);
    if (!res.ok) {
      setError("Your message didn't send. Try again.");
      return;
    }
    const m = norm(await res.json());
    setMessages((prev) => [...(prev ?? []), m]);
    onSent(m);
    setDraft("");
  };

  return (
    <>
      <header className="flex items-center gap-3 border-b border-ink/8 px-4 py-3">
        <button type="button" onClick={onBack} className="-ml-1 rounded-[8px] p-1.5 md:hidden" aria-label="Back to conversations">
          <ArrowLeft className="size-5" />
        </button>
        <Person name={conversation.otherUser.name} src={pic(conversation.otherUser)} size="sm" />
        <h2 className="font-bold">{conversation.otherUser.name}</h2>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-panel/40 px-4 py-5 sm:px-6" aria-live="polite">
        {messages === null ? (
          <div className="grid gap-3">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="ml-auto h-12 w-1/2" />
          </div>
        ) : messages.length === 0 ? (
          <div className="grid h-full place-items-center text-center">
            <p className="max-w-[36ch] text-ink-soft">
              Say hello to {conversation.otherUser.name.split(" ")[0]}. A good first message: what you&apos;re aiming for and by when.
            </p>
          </div>
        ) : (
          <ol className="grid gap-1.5">
            {messages.map((m, i) => {
              const mine = m.senderId === me;
              const d = new Date(m.createdAt);
              const newDay = i === 0 || !isSameDay(d, new Date(messages[i - 1].createdAt));
              return (
                <li key={m.id} className="grid">
                  {newDay && (
                    <p className="my-3 text-center text-xs font-semibold text-ink-soft">{format(d, "EEEE, MMM d")}</p>
                  )}
                  <div
                    className={`max-w-[75%] rounded-[16px] px-3.5 py-2.5 text-[15px] leading-relaxed ${
                      mine ? "justify-self-end rounded-br-[4px] bg-ink text-chalk" : "justify-self-start rounded-bl-[4px] bg-card text-ink shadow-[var(--shadow-card)]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    <p className={`mt-1 text-[11px] ${mine ? "text-chalk/60" : "text-ink-soft"}`}>{format(d, "h:mm a")}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="border-t border-ink/8 p-3">
        {error && <p role="alert" className="mb-2 text-sm text-red-700">{error}</p>}
        <div className="flex items-end gap-2">
          <label htmlFor="draft" className="sr-only">Message</label>
          <textarea
            id="draft"
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) send(e);
            }}
            placeholder="Write a message"
            className="max-h-40 min-h-11 flex-1 resize-none rounded-[10px] border border-input bg-card px-3.5 py-2.5 text-[15px] outline-none focus-visible:border-tape-blue focus-visible:ring-[3px] focus-visible:ring-tape-blue/25"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-tape-yellow text-ink transition-opacity disabled:opacity-40"
            aria-label="Send message"
          >
            {sending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
          </button>
        </div>
      </form>
    </>
  );
}
