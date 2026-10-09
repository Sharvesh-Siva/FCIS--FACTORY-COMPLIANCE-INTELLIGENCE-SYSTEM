import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  FileCheck2,
  FileText,
  FlaskConical,
  Wrench,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { repo } from '../../services/storageRepository';
import { StatusBadge } from '../common/StatusBadge';

interface DashboardViewProps {
  onNavigate: (module: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const state = repo.getState();
  const findings = repo.getFindings();
  const assessmentDate = state.assessmentDate;

  // Analytics derived from active dataset
  const activeProducts = state.products.length;
  const activeInstruments = state.instruments.length;
  const expiredCalibrations = state.calibrations.filter((c) => c.validityEndDate < assessmentDate);
  const openFindings = findings.filter((f) => f.status !== 'Dismissed');
  const criticalFindings = openFindings.filter((f) => f.priority === 'Critical');
  const highFindings = openFindings.filter((f) => f.priority === 'High');
  const overdueActions = state.actions.filter(
    (a) => a.dueDate < assessmentDate && a.status !== 'Approved & Closed'
  );
  const unverifiedDocs = state.documents.filter((d) => d.verificationState !== 'Verified');

  // Specific check for the T-002 demo condition
  const test002Finding = findings.find((f) => f.ruleId === 'CAL-003' && f.triggeringRecordId.includes('T-002'));

  return (
    <div className="space-y-6">
      {/* Top Welcome & Context Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#0b2545] text-white">
              FACTORY UNIT 1
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {state.organisation.name}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Factory Compliance & Readiness Overview
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Deterministic rule assessment evaluated against benchmark date{' '}
            <strong className="font-mono text-slate-900">{assessmentDate}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('reports')}
            className="px-3.5 py-2 rounded text-xs font-semibold bg-[#0b2545] hover:bg-sky-900 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Readiness Dossier</span>
          </button>
          <button
            onClick={() => onNavigate('dependencies')}
            className="px-3.5 py-2 rounded text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Explore Dependency Graph</span>
          </button>
        </div>
      </div>

      {/* Flagship Demonstration Banner: Explainable Date-Aware Traceability */}
      {test002Finding && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-lg p-5 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-200/80 px-2 py-0.5 rounded">
                    Rule CAL-003 Triggered
                  </span>
                  <span className="text-xs font-semibold text-rose-900">
                    Quality Test Executed After Calibration Validity Concluded
                  </span>
                </div>
                <StatusBadge status="Critical Review Required" />
              </div>

              <p className="text-xs text-rose-950 mt-2 leading-relaxed">
                <strong>Explanation:</strong> Instrument <strong>DMM-104</strong> (Fluke 87V, SN-104A) recorded validity ended on <strong>2026-10-01</strong>.
                Quality Test <strong>T-002</strong> (Batch B-025, 12V Power Adapter) was recorded on <strong>2026-10-05</strong> (4 days after validity elapsed).
              </p>

              <div className="mt-2.5 p-3 rounded bg-white/80 border border-rose-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Contrast with Test T-001:</strong> Test T-001 (Batch B-024) occurred on <strong>2026-09-20</strong>.
                    Because T-001 fell within the recorded validity interval, it is <em>not</em> flagged solely by instrument expiry today.
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('dependencies')}
                  className="text-xs font-bold text-rose-700 hover:text-rose-900 underline whitespace-nowrap flex items-center gap-1 cursor-pointer"
                >
                  <span>Trace in Graph</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('findings')}
                  className="px-3 py-1.5 rounded bg-rose-700 hover:bg-rose-800 text-white text-xs font-medium shadow-xs"
                >
                  Review Finding FND-CAL-003
                </button>
                <button
                  onClick={() => onNavigate('actions')}
                  className="px-3 py-1.5 rounded bg-white border border-rose-300 text-rose-800 hover:bg-rose-100/60 text-xs font-medium"
                >
                  View Linked CAPA-2026-001
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Products */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs hover:border-sky-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Registered Products</span>
            <Cpu className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{activeProducts}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">100% scoped</span>
            <span>under IS 13252</span>
          </div>
        </div>

        {/* Instruments & Calibration */}
        <div
          onClick={() => onNavigate('calibrations')}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs hover:border-sky-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Calibration Validity</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 flex items-baseline gap-2">
            <span>{expiredCalibrations.length}</span>
            <span className="text-xs text-rose-600 font-medium">Expired Instrument</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {activeInstruments - expiredCalibrations.length} of {activeInstruments} instruments valid
          </div>
        </div>

        {/* Open Findings */}
        <div
          onClick={() => onNavigate('findings')}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs hover:border-sky-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Open Review Findings</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2 flex items-baseline gap-2">
            <span>{openFindings.length}</span>
            <span className="text-xs text-slate-500 font-normal">
              ({criticalFindings.length} critical, {highFindings.length} high)
            </span>
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">
            Requires human engineering sign-off
          </div>
        </div>

        {/* Overdue CAPAs */}
        <div
          onClick={() => onNavigate('actions')}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs hover:border-sky-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Corrective Actions</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 flex items-baseline gap-2">
            <span className={overdueActions.length > 0 ? 'text-amber-700' : 'text-slate-900'}>
              {state.actions.length}
            </span>
            {overdueActions.length > 0 && (
              <span className="text-xs text-rose-600 font-bold">
                ({overdueActions.length} Overdue)
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {state.actions.filter((a) => a.status === 'Approved & Closed').length} closed, {overdueActions.length} past due date
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Review Queue & Equipment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Priority Review Queue */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Priority Action & Review Queue</h3>
              <p className="text-xs text-slate-500">
                Sorted by deterministic severity requiring authorized reviewer determination
              </p>
            </div>
            <button
              onClick={() => onNavigate('findings')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({findings.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {openFindings.slice(0, 5).map((f) => (
              <div key={f.id} className="py-3.5 hover:bg-slate-50/80 px-2 rounded transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                        {f.ruleId}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{f.title}</span>
                      <StatusBadge status={f.priority} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{f.explanation}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>Trigger: <strong>{f.triggeringRecordLabel}</strong></span>
                      {f.assignedRole && (
                        <span>Assigned Role: <strong className="capitalize">{f.assignedRole.replace('_', ' ')}</strong></span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('findings')}
                    className="shrink-0 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Instrument Calibration & Expiry Timeline */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Equipment Calibration Register</h3>
              <button
                onClick={() => onNavigate('calibrations')}
                className="text-xs font-semibold text-sky-700 hover:text-sky-900"
              >
                View
              </button>
            </div>

            <div className="space-y-3 mt-3">
              {state.instruments.map((inst) => {
                const cal = state.calibrations.find(
                  (c) => c.instrumentId === inst.id || c.instrumentId === inst.instrumentId
                );
                const isExpired = cal && cal.validityEndDate < assessmentDate;
                return (
                  <div
                    key={inst.id}
                    className={`p-3 rounded border text-xs transition-colors ${
                      isExpired
                        ? 'bg-rose-50/70 border-rose-200'
                        : !cal
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{inst.instrumentId}</span>
                      <StatusBadge status={inst.currentStatus} size="sm" />
                    </div>
                    <div className="text-slate-600 mt-1 truncate">{inst.name}</div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Cal End: {cal?.validityEndDate || 'NO CERTIFICATE'}</span>
                      {isExpired ? (
                        <span className="text-rose-700 font-bold">EXPIRED</span>
                      ) : cal ? (
                        <span className="text-emerald-700 font-bold">VALID</span>
                      ) : (
                        <span className="text-amber-700 font-bold">MISSING</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigate('instruments')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded text-center transition-colors"
            >
              Manage Instrument Master Register
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity & Event Audit Log */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Immutable Audit Events</h3>
            <p className="text-xs text-slate-500">
              Chronological log of record state changes, evaluations, and reviewer actions
            </p>
          </div>
          <button
            onClick={() => onNavigate('audit')}
            className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
          >
            <span>Full Audit Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          {state.auditEvents.slice(0, 5).map((evt) => (
            <div key={evt.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                  {evt.operation}
                </span>
                <span className="text-slate-800 font-medium">{evt.summary}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono shrink-0">
                <span>{evt.actorName}</span>
                <span>{new Date(evt.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
