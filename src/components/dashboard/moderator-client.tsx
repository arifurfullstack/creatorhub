"use client";

import { useState } from "react";
import { moderateReport } from "@/app/actions/moderation";
import { Shield, EyeOff, UserMinus, AlertTriangle, CheckCircle, RefreshCcw } from "lucide-react";

interface Report {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  actionTaken: string | null;
  createdAt: Date;
  reporter: {
    name: string;
    email: string;
  };
}

export default function ModeratorClient({ initialReports }: { initialReports: any[] }) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (reportId: string, actionName: string) => {
    setLoadingId(reportId);
    try {
      const response = await moderateReport(reportId, actionName);
      if (response.success) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId ? { ...r, status: "resolved", actionTaken: actionName } : r
          )
        );
        alert(`Moderation action completed: ${actionName.replace("_", " ")}`);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to resolve report");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Background glowing orb */}
      <div className="gradient-orb w-[250px] h-[250px] bg-yellow-500/10 top-10 right-10" />

      <div className="flex justify-between items-center border-b border-white/5 pb-5 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-yellow-500" />
            Moderation Queue
          </h1>
          <p className="text-xs text-text-muted mt-1">Review reported content, suspend items, or ban users</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.length === 0 ? (
          <div className="col-span-full text-center py-16 glassmorphism rounded-2xl border border-white/5">
            <CheckCircle className="w-12 h-12 text-green-500/40 mx-auto mb-4" />
            <h3 className="font-bold text-white text-base mb-1">Queue is Clear!</h3>
            <p className="text-xs text-text-muted">No pending user reports require verification.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className={`bg-card border rounded-2xl p-6 relative overflow-hidden transition-all ${
                report.status === "resolved" ? "border-green-500/30 opacity-75" : "border-white/5"
              }`}
            >
              {report.status === "resolved" && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-extrabold uppercase px-3 py-1 rounded-bl-xl">
                  Resolved
                </div>
              )}

              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-4">
                <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                  {report.targetType}
                </span>
                <span className="text-text-muted">Reported</span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-[10px] text-text-muted font-bold uppercase">Reporter</p>
                  <p className="text-xs text-white mt-0.5">{report.reporter.name} ({report.reporter.email})</p>
                </div>

                <div>
                  <p className="text-[10px] text-text-muted font-bold uppercase">Reason</p>
                  <p className="text-xs text-white/90 mt-0.5 italic leading-relaxed">
                    &ldquo;{report.reason}&rdquo;
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-text-muted font-bold uppercase">Target ID</p>
                  <p className="text-[10px] text-text-muted font-mono truncate mt-0.5">
                    {report.targetId}
                  </p>
                </div>

                {report.actionTaken && (
                  <div className="p-2.5 rounded-xl bg-green-500/5 border border-green-500/10 text-xs text-green-400">
                    <span className="font-bold uppercase text-[9px]">Action taken:</span>
                    <p className="mt-0.5 font-semibold capitalize">{report.actionTaken.replace("_", " ")}</p>
                  </div>
                )}
              </div>

              {report.status !== "resolved" && (
                <div className="flex gap-2.5 border-t border-white/5 pt-4">
                  <button
                    disabled={loadingId === report.id}
                    onClick={() => handleAction(report.id, "dismiss_report")}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors border border-white/5"
                  >
                    Dismiss
                  </button>

                  <button
                    disabled={loadingId === report.id}
                    onClick={() => handleAction(report.id, "hide_post")}
                    className="p-2 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-black rounded-lg transition-colors"
                    title="Hide Content"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>

                  <button
                    disabled={loadingId === report.id}
                    onClick={() => handleAction(report.id, "warn_user")}
                    className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-black rounded-lg transition-colors"
                    title="Warn User"
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </button>

                  <button
                    disabled={loadingId === report.id}
                    onClick={() => handleAction(report.id, "ban_user")}
                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors"
                    title="Ban User"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
