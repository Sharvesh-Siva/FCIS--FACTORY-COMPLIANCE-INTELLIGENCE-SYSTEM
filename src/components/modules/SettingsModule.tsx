import React, { useState } from 'react';
import {
  Sliders,
  Calendar,
  ShieldAlert,
  Database,
  RotateCcw,
  CheckCircle2,
  Lock,
  Server,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { repo } from '../../services/storageRepository';
import { COMPLIANCE_RULES } from '../../services/ruleEngine';

export const SettingsModule: React.FC = () => {
  const state = repo.getState();
  const [dateInput, setDateInput] = useState(state.assessmentDate);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleUpdateDate = (e: React.FormEvent) => {
    e.preventDefault();
    repo.setAssessmentDate(dateInput);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Restore initial synthetic benchmark dataset? This will reset all records and findings back to the default state.')) {
      repo.resetToSeedData();
      setDateInput(repo.getAssessmentDate());
      alert('Data reset successfully.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-700" />
            <h2 className="text-xl font-bold text-slate-900">Rule Configurations & System Settings</h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Global evaluation benchmark dates, deterministic rule definitions, and Firebase architecture roadmap.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Date-Boundary Simulation Controller */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Calendar className="w-4 h-4 text-sky-700" />
          <h3 className="text-sm font-bold text-slate-900">
            Global Assessment Evaluation Date (Date-Boundary Simulator)
          </h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The deterministic rule engine evaluates instrument calibration expiry, quality test validity intervals, and CAPA due dates against this benchmark date.
          Changing this date demonstrates how findings are dynamically re-evaluated across time horizons.
        </p>

        <form onSubmit={handleUpdateDate} className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-700">Benchmark Date:</label>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="p-2 border rounded border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-[#0b2545] hover:bg-sky-900 text-white font-semibold rounded shadow-xs cursor-pointer"
          >
            Apply & Re-evaluate Rules
          </button>

          <button
            type="button"
            onClick={() => {
              setDateInput('2026-10-09');
              repo.setAssessmentDate('2026-10-09');
            }}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
          >
            Reset to Oct 9, 2026
          </button>

          {savedMsg && (
            <span className="text-emerald-700 font-medium flex items-center gap-1 text-xs animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>Assessment date updated and rules re-evaluated!</span>
            </span>
          )}
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 text-[11px] text-slate-600">
          <div className="p-2 bg-slate-50 rounded border border-slate-200">
            <strong>Past Date (&lt; 2026-10-01):</strong> Instrument DMM-104 is still valid; CAL-002 & CAL-003 will not trigger.
          </div>
          <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-900">
            <strong>Benchmark (2026-10-09):</strong> DMM-104 is expired; T-002 triggers CAL-003; T-001 remains valid.
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-200">
            <strong>Future Date (&gt; 2026-10-31):</strong> BIS Certification CERT-01 also elapses, triggering CERT-001.
          </div>
        </div>
      </div>

      {/* Deterministic Rule Engine Catalog */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="font-bold text-xs text-slate-700 uppercase tracking-wider">
            Deterministic Compliance Rule Catalog (Versioned Engine)
          </div>
          <span className="text-xs font-mono text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
            10 Active Rules
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {COMPLIANCE_RULES.map((r) => (
            <div key={r.ruleId} className="p-4 hover:bg-slate-50 text-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded">
                      {r.ruleId}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{r.title}</span>
                    <span className="text-[10px] font-mono text-slate-500">v{r.version}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                      {r.category}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{r.description}</p>
                </div>
                <span className="font-mono text-[11px] text-slate-500 shrink-0">
                  Priority: <strong>{r.defaultPriority}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phased Firebase Architecture Integration Guide */}
      <div className="bg-gradient-to-r from-sky-50 to-slate-50 border border-sky-300 rounded-lg p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-sky-950 font-bold text-sm">
          <Database className="w-4 h-4 text-sky-700" />
          <span>Firebase & Cloud Storage Architecture Boundary (Phase 4 Ready)</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The application uses a decoupled repository layer (`FCISRepository`) that cleanly isolates domain models and rule logic
          from persistence. In Phase 4, the repository can seamlessly plug into live Cloud Firestore and Firebase Storage
          without rewriting application components.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="bg-white p-3 rounded border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">1. Firestore Collections</span>
            <p className="text-slate-600 text-[11px]">
              Schema maps directly to <code>organisations</code>, <code>products</code>, <code>instruments</code>, <code>calibrations</code>, <code>tests</code>, and <code>findings</code> with organization isolation.
            </p>
          </div>
          <div className="bg-white p-3 rounded border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">2. Cloud Storage Rules</span>
            <p className="text-slate-600 text-[11px]">
              Private storage buckets for calibration certificates and raw lab data. Read/write restricted to authenticated organization users.
            </p>
          </div>
          <div className="bg-white p-3 rounded border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">3. Immutable Audit Log</span>
            <p className="text-slate-600 text-[11px]">
              Append-only <code>audit_events</code> collection with write-only client rules and server-side timestamp validation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
