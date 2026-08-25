"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import type { ApiSupportConversation } from "@/lib/api-types";

const TABS = ["OPEN", "ASSIGNED", "RESOLVED", "CLOSED"] as const;

export default function AdminSupportPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("OPEN");
  const [conversations, setConversations] = useState<ApiSupportConversation[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  async function load(status: (typeof TABS)[number]) {
    setConversations(null);
    const { conversations } = await api.get<{ conversations: ApiSupportConversation[] }>(
      `/api/support/admin/conversations?status=${status}`
    );
    setConversations(conversations);
  }

  useEffect(() => {
    void load(tab);
  }, [tab]);

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">Support inbox</h1>

      <div className="mt-4 flex gap-1 border-b border-graphite-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t ? "border-ember-600 text-ember-600" : "border-transparent text-graphite-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-2">
          {conversations === null ? (
            <p className="text-sm text-graphite-600">Loading…</p>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-graphite-600">Nothing here.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`rounded-card border px-3 py-2 text-left text-sm ${
                  activeId === c.id ? "border-ember-600 bg-ember-100" : "border-graphite-200"
                }`}
              >
                <p className="font-medium text-graphite-900">
                  {c.customer?.firstName} {c.customer?.lastName}
                </p>
                <p className="truncate text-xs text-graphite-500">{c.messages[0]?.body}</p>
              </button>
            ))
          )}
        </aside>

        <div>
          {activeId ? (
            <AdminConversationThread conversationId={activeId} onStatusChanged={() => load(tab)} />
          ) : (
            <p className="text-sm text-graphite-600">Select a conversation.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminConversationThread({
  conversationId,
  onStatusChanged,
}: {
  conversationId: string;
  onStatusChanged: () => void;
}) {
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
    pollRef.current = setInterval(() => void load(), 4000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  async function sendReply() {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/api/support/conversations/${conversationId}/messages`, { body: reply });
      await api.post(`/api/support/admin/conversations/${conversationId}/assign`);
      setReply("");
      await load();
    } finally {
      setSending(false);
    }
  }

  async function resolve() {
    await api.patch(`/api/support/admin/conversations/${conversationId}/status`, { status: "RESOLVED" });
    onStatusChanged();
  }

  if (!conversation) return <p className="text-sm text-graphite-600">Loading…</p>;

  return (
    <div className="flex flex-col gap-3 rounded-card border border-graphite-200 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-graphite-900">
          {conversation.customer?.firstName} {conversation.customer?.lastName} · {conversation.customer?.email}
        </p>
        <button onClick={resolve} className="text-xs font-medium text-verified-600 hover:text-verified-700">
          Mark resolved
        </button>
      </div>

      <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
        {conversation.messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-card px-3 py-2 text-sm ${
              m.senderType === "AGENT" ? "self-end bg-graphite-900 text-white" : "self-start bg-cloud-100 text-graphite-900"
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
          placeholder="Reply…"
          className="w-full rounded-[7px] border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-ember-600"
        />
        <button
          onClick={sendReply}
          disabled={sending}
          className="shrink-0 rounded-card bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </div>
  );
}
