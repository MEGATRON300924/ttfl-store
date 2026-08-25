"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import type { ApiSupportConversation } from "@/lib/api-types";

export default function SupportPage() {
  const { user, loading } = useAuth();
  const [conversations, setConversations] = useState<ApiSupportConversation[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      api.get<{ conversations: ApiSupportConversation[] }>("/api/support/conversations/me").then((r) => {
        setConversations(r.conversations);
        if (r.conversations.length > 0) setActiveId(r.conversations[0].id);
      });
    }
  }, [user]);

  if (!loading && !user) {
    return (
      <div className="shell py-16 text-center">
        <h1 className="text-lg font-bold text-graphite-900">Log in to chat with support</h1>
        <Link
          href="/login?next=/support"
          className="mt-6 inline-block rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">Support</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="flex flex-col gap-2">
          <NewConversationButton
            onCreated={(conv) => {
              setConversations((prev) => [conv, ...(prev ?? [])]);
              setActiveId(conv.id);
            }}
          />
          {conversations?.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`rounded-card border px-3 py-2 text-left text-sm ${
                activeId === c.id ? "border-ember-600 bg-ember-100 text-ember-700" : "border-graphite-200 text-graphite-700"
              }`}
            >
              <p className="truncate">{c.messages[0]?.body ?? "Conversation"}</p>
              <p className="text-xs text-graphite-400">{c.status.toLowerCase()}</p>
            </button>
          ))}
        </aside>

        <div>{activeId ? <ConversationThread conversationId={activeId} /> : <p className="text-sm text-graphite-600">Start a conversation to get help.</p>}</div>
      </div>
    </div>
  );
}

function NewConversationButton({ onCreated }: { onCreated: (c: ApiSupportConversation) => void }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      const { conversation } = await api.post<{ conversation: ApiSupportConversation }>("/api/support/conversations", { message });
      onCreated(conversation);
      setMessage("");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-card bg-ember-600 px-3 py-2 text-sm font-semibold text-white hover:bg-ember-700"
      >
        New conversation
      </button>
    );
  }

  return (
    <div className="rounded-card border border-graphite-200 p-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="What do you need help with?"
        className="w-full rounded-[7px] border border-graphite-200 px-2 py-1.5 text-sm outline-none focus:border-ember-600"
      />
      <button
        onClick={submit}
        disabled={submitting}
        className="mt-2 w-full rounded-card bg-ember-600 py-2 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send"}
      </button>
    </div>
  );
}

function ConversationThread({ conversationId }: { conversationId: string }) {
  const [conversation, setConversation] = useState<ApiSupportConversation | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  async function load() {
    const { conversation } = await api.get<{ conversation: ApiSupportConversation }>(`/api/support/conversations/${conversationId}`);
    setConversation(conversation);
  }

  useEffect(() => {
    void load();
    // REST-polled, not WebSocket — simple and reliable for a support
    // inbox's message volume; see backend README for the tradeoff.
    pollRef.current = setInterval(() => void load(), 4000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  async function sendReply() {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/api/support/conversations/${conversationId}/messages`, { body: reply });
      setReply("");
      await load();
    } finally {
      setSending(false);
    }
  }

  if (!conversation) return <p className="text-sm text-graphite-600">Loading…</p>;

  return (
    <div className="flex flex-col gap-3 rounded-card border border-graphite-200 p-4">
      <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
        {conversation.messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-card px-3 py-2 text-sm ${
              m.senderType === "CUSTOMER" ? "self-end bg-ember-600 text-white" : "self-start bg-cloud-100 text-graphite-900"
            }`}
          >
            {m.body}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendReply()}
          placeholder="Type a message…"
          className="w-full rounded-[7px] border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-ember-600"
        />
        <button
          onClick={sendReply}
          disabled={sending}
          className="shrink-0 rounded-card bg-ember-600 px-4 py-2 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </div>
  );
}
