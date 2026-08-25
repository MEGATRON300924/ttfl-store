"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";

type EmailLogRow = {
  id: string;
  to: string;
  subject: string;
  event: string;
  status: "PENDING" | "SENT" | "FAILED" | "RETRYING";
  attempts: number;
  lastError: string | null;
  sentAt: string | null;
  createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
  SENT: "bg-verified-100 text-verified-700",
  PENDING: "bg-cloud-100 text-graphite-700",
  RETRYING: "bg-gold-100 text-gold-600",
  FAILED: "bg-ember-100 text-ember-700",
};

export default function AdminEmailLogsPage() {
  const [logs, setLogs] = useState<EmailLogRow[] | null>(null);

  useEffect(() => {
    api.get<{ items: EmailLogRow[] }>("/api/analytics/admin/email-logs?limit=100").then((r) => setLogs(r.items));
  }, []);

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">Email logs</h1>
      <p className="mt-1 text-sm text-graphite-600">Delivery status for every email the platform has queued.</p>

      {logs === null ? (
        <p className="mt-6 text-sm text-graphite-600">Loading…</p>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between gap-3 rounded-card border border-graphite-200 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-graphite-900">{log.subject}</p>
                <p className="text-xs text-graphite-500">
                  {log.to} · {log.event} · {log.attempts} attempt{log.attempts === 1 ? "" : "s"}
                </p>
                {log.lastError && <p className="text-xs text-ember-600">{log.lastError}</p>}
              </div>
              <span className={`shrink-0 rounded-tag px-2 py-1 text-xs font-medium ${STATUS_STYLES[log.status]}`}>
                {log.status.toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
