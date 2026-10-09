import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  Shield,
  Clock,
  X,
  FileText,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import { repo } from '../../services/storageRepository';
import { Finding, FindingPriority, FindingStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface FindingsModuleProps {
  onNavigateToRecord?: (type: string, id: string) => void;
  onNavigateToCapa?: (findingId: string) => void;
}

export const FindingsModule: React.FC<FindingsModuleProps> = ({ onNavigateToCapa }) => {
  const findings = repo.getFindings();
  const state = repo.getState();
  const activeUser = repo.getActiveUser();

  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(findings[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dismissModalOpen, setDismissModalOpen] = useState(false);
  const [dismissReason, setDismissReason] = useState('');

  // Filtering
  const filteredFindings = findings.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.ruleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.triggeringRecordLabel.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === 'all' || f.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleDismiss = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFinding && dismissReason.trim()) {
      repo.dismissFinding(selectedFinding.id, dismissReason);
      setDismissModalOpen(false);
      setDismissReason('');
      // refresh selection
      const updated = repo.getFindings().find((f) => f.id === selectedFinding.id);
      if (updated) setSelectedFinding(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h2 className="text-xl font-bold text-slate-900">Compliance & Review Findings</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300">
              {findings.filter((f) => f.status !== 'Dismissed').length} Active Issues
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Deterministic rule engine outputs. Each finding requires an authorized human engineering review.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-mono">Evaluation Date:</span>
          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
            {state.assessmentDate}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search findings by rule ID, title, instrument, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 text-slate-800"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="Action Required">Action Required</option>
              <option value="Open">Open</option>
              <option value="Under Review">Under Review</option>
              <option value="Dismissed">Dismissed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Findings Master & Detail split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Findings List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Evaluated Rule Records ({filteredFindings.length})
            </span>
            <span className="text-[11px] text-slate-500">
              Deterministic rule matching v2.1
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[680px] overflow-y-auto">
            {filteredFindings.map((f) => {
              const isSelected = selectedFinding?.id === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFinding(f)}
                  className={`p-4 transition-colors cursor-pointer border-l-4 ${
                    isSelected
                      ? 'bg-sky-50/80 border-l-[#0b2545]'
                      : f.priority === 'Critical'
                      ? 'border-l-rose-500 hover:bg-slate-50/80'
                      : f.priority === 'High'
                      ? 'border-l-amber-500 hover:bg-slate-50/80'
                      : 'border-l-slate-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-200/80 px-2 py-0.5 rounded">
                          {f.ruleId}
                        </span>
                        <StatusBadge status={f.priority} size="sm" />
                        <StatusBadge status={f.status} size="sm" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{f.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{f.explanation}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 font-mono">
                        <span>Trigger: <strong>{f.triggeringRecordLabel}</strong></span>
                        {f.relevantDates.eventDate && <span>Date: {f.relevantDates.eventDate}</span>}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-[#0b2545] translate-x-1' : 'text-slate-400'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Finding Detail & Action Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          {selectedFinding ? (
            <div className="space-y-5 text-xs">
              <div className="pb-3 border-b border-slate-200 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-white">
                      {selectedFinding.ruleId}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">v{selectedFinding.ruleVersion}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedFinding.title}</h3>
                </div>
                <StatusBadge status={selectedFinding.priority} />
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Plain-Language Impact Explanation:</span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                  {selectedFinding.explanation}
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Triggering Record:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedFinding.triggeringRecordLabel}</span>
                </div>

                {selectedFinding.relatedRecordLabel && (
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="text-slate-500">Related Impact Record:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedFinding.relatedRecordLabel}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Current Status:</span>
                  <StatusBadge status={selectedFinding.status} size="sm" />
                </div>

                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Assigned Review Role:</span>
                  <span className="capitalize font-semibold text-slate-800">
                    {selectedFinding.assignedRole?.replace('_', ' ') || 'Quality Engineer'}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Assessment Timestamp:</span>
                  <span className="font-mono text-slate-600">{state.assessmentDate} 00:00 UTC</span>
                </div>
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded p-3">
                <span className="font-bold text-sky-950 block mb-1">Recommended Next Engineering Step:</span>
                <p className="text-sky-900 leading-relaxed">{selectedFinding.recommendedAction}</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
                {selectedFinding.status !== 'Dismissed' && (
                  <button
                    onClick={() => setDismissModalOpen(true)}
                    className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
                  >
                    Dismiss with Justification
                  </button>
                )}
                {onNavigateToCapa && (
                  <button
                    onClick={() => onNavigateToCapa(selectedFinding.id)}
                    className="px-3.5 py-1.5 rounded bg-[#0b2545] hover:bg-sky-900 text-white font-medium shadow-xs"
                  >
                    Initiate Corrective Action (CAPA)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-12">
              Select a finding from the list to inspect rule details and evidence.
            </div>
          )}
        </div>
      </div>

      {/* Dismiss with justification dialog */}
      {dismissModalOpen && selectedFinding && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="font-bold text-sm text-slate-900">
                Dismiss Finding: {selectedFinding.ruleId}
              </h4>
              <button onClick={() => setDismissModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Institutional safeguards require recording an engineering justification in the audit trail.
              Dismissed findings will be retained in history for reviewer accountability.
            </p>

            <form onSubmit={handleDismiss} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Justification / Authorised Engineering Explanation *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Non-critical indicator verified by second reference meter; instrument quarantined and duplicate measurement performed..."
                  value={dismissReason}
                  onChange={(e) => setDismissReason(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDismissModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded shadow-xs"
                >
                  Record Dismissal in Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
