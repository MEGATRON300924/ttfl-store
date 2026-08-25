"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";

type AuditLogRow = {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  createdAt: string;
  actor: { firstName: string; lastName: string; email: string } | null;
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRow[] | null>(null);

  useEffect(() => {
    api.get<{ items: AuditLogRow[] }>("/api/analytics/admin/audit-logs?limit=100").then((r) => setLogs(r.items));
  }, []);

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">Audit logs</h1>
      <p className="mt-1 text-sm text-graphite-600">Sensitive admin actions — approvals, suspensions, changes.</p>

      {logs === null ? (
        <p className="mt-6 text-sm text-graphite-600">Loading…</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-card border border-graphite-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-cloud-100 text-xs uppercase text-graphite-600">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-3 py-2 text-xs text-graphite-500">
                    {new Date(log.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="px-3 py-2 text-graphite-900">
                    {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : "System"}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-graphite-700">{log.action}</td>
                  <td className="px-3 py-2 text-xs text-graphite-500">
                    {log.targetType ? `${log.targetType} (${log.targetId?.slice(0, 8)}…)` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
