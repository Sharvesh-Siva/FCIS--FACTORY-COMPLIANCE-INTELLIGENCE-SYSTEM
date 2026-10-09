import React, { useState } from 'react';
import {
  ListTodo,
  Plus,
  Search,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  User,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { repo } from '../../services/storageRepository';
import { CorrectiveAction, ActionStatus, ActionPriority } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const CorrectiveActionsModule: React.FC = () => {
  const state = repo.getState();
  const actions = state.actions;
  const assessmentDate = state.assessmentDate;
  const activeUser = repo.getActiveUser();

  const [selectedAction, setSelectedAction] = useState<CorrectiveAction | null>(actions[0] || null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New action form
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [assignee, setAssignee] = useState('Amit Patel');
  const [dueDate, setDueDate] = useState('2026-10-18');
  const [priority, setPriority] = useState<ActionPriority>('High');

  // Investigation edit state
  const [rootCause, setRootCause] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.actionCode.toLowerCase().includes(search.toLowerCase()) ||
      a.assignedTo.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (title) {
      const created = repo.addAction({
        actionCode: `CAPA-${Date.now().toString().slice(-4)}`,
        findingId: 'FND-2026-001',
        title,
        description: desc,
        assignedTo: assignee,
        assignedRole: 'quality_engineer',
        dueDate,
        status: 'Open',
        priority,
      });
      setSelectedAction(created);
      setModalOpen(false);
      setTitle('');
      setDesc('');
    }
  };

  const handleUpdateStatus = (newStatus: ActionStatus) => {
    if (!selectedAction) return;
    repo.updateAction(selectedAction.id, {
      status: newStatus,
      rootCauseAnalysis: rootCause || selectedAction.rootCauseAnalysis,
      resolutionNotes: resolutionNotes || selectedAction.resolutionNotes,
      reviewedBy: activeUser.name,
      reviewedAt: new Date().toISOString(),
    });
    // refresh
    const updated = repo.getActions().find((a) => a.id === selectedAction.id);
    if (updated) setSelectedAction(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-sky-700" />
            <h2 className="text-xl font-bold text-slate-900">Corrective & Preventive Actions (CAPA)</h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Root cause investigation, due-date tracking, resolution evidence, and authorized engineering sign-off.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-2 rounded text-xs font-semibold bg-[#0b2545] hover:bg-sky-900 text-white flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Initiate New CAPA</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search actions by code (e.g. CAPA-2026-001), owner, or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-600"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Action List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>CAPA Records ({filtered.length})</span>
            <span className="text-[11px] font-mono text-slate-500">Benchmark: {assessmentDate}</span>
          </div>

          {filtered.map((act) => {
            const isSelected = selectedAction?.id === act.id;
            const isOverdue = act.dueDate < assessmentDate && act.status !== 'Approved & Closed';
            return (
              <div
                key={act.id}
                onClick={() => setSelectedAction(act)}
                className={`p-4 transition-colors cursor-pointer ${
                  isSelected ? 'bg-sky-50 border-l-4 border-l-[#0b2545]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-200/80 px-1.5 py-0.5 rounded">
                        {act.actionCode}
                      </span>
                      <StatusBadge status={act.priority} size="sm" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{act.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Assigned: {act.assignedTo}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={act.status} size="sm" />
                    {isOverdue && <StatusBadge status="Overdue" size="sm" />}
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Target Date: {act.dueDate}</span>
                  {isOverdue && <span className="text-rose-700 font-bold">ACT-001 Alert</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Action Detail (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-5">
          {selectedAction ? (
            <>
              {(() => {
                const isOverdue = selectedAction.dueDate < assessmentDate && selectedAction.status !== 'Approved & Closed';
                const daysPast = Math.floor(
                  (new Date(assessmentDate).getTime() - new Date(selectedAction.dueDate).getTime()) /
                    (1000 * 3600 * 24)
                );

                return (
                  <>
                    <div className="pb-3 border-b border-slate-200 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#0b2545] text-white">
                            {selectedAction.actionCode}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">Finding: {selectedAction.findingId}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{selectedAction.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Assigned to: {selectedAction.assignedTo}</p>
                      </div>
                      <StatusBadge status={selectedAction.status} />
                    </div>

                    {/* Overdue Warning Alert */}
                    {isOverdue && (
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-950 flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Overdue Corrective Action (Rule ACT-001): </span>
                          <span>
                            Target resolution date was <strong>{selectedAction.dueDate}</strong> ({daysPast} days overdue as of benchmark date {assessmentDate}).
                            Immediate management escalation required.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Problem Description */}
                    <div>
                      <span className="font-bold text-xs text-slate-900 block mb-1">CAPA Scope & Description:</span>
                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed">
                        {selectedAction.description}
                      </p>
                    </div>

                    {/* Root Cause Analysis */}
                    <div>
                      <span className="font-bold text-xs text-slate-900 block mb-1">Root Cause Investigation:</span>
                      {selectedAction.rootCauseAnalysis ? (
                        <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed">
                          {selectedAction.rootCauseAnalysis}
                        </p>
                      ) : (
                        <textarea
                          rows={2}
                          value={rootCause}
                          onChange={(e) => setRootCause(e.target.value)}
                          placeholder="Document 5-Why or Ishikawa root cause analysis findings here..."
                          className="w-full text-xs p-2.5 border rounded border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-600"
                        />
                      )}
                    </div>

                    {/* Proposed Action */}
                    {selectedAction.proposedAction && (
                      <div>
                        <span className="font-bold text-xs text-slate-900 block mb-1">Proposed Corrective Action:</span>
                        <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed">
                          {selectedAction.proposedAction}
                        </p>
                      </div>
                    )}

                    {/* Lifecycle Status Management */}
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                          Advance Workflow State
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">Active Persona: {activeUser.name}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {selectedAction.status !== 'Under Investigation' && (
                          <button
                            onClick={() => handleUpdateStatus('Under Investigation')}
                            className="px-3 py-1.5 rounded bg-sky-100 hover:bg-sky-200 text-sky-900 font-medium border border-sky-300"
                          >
                            Mark Under Investigation
                          </button>
                        )}
                        {selectedAction.status !== 'Evidence Attached' && (
                          <button
                            onClick={() => handleUpdateStatus('Evidence Attached')}
                            className="px-3 py-1.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium border border-amber-300"
                          >
                            Attach Evidence & Submit
                          </button>
                        )}
                        {selectedAction.status !== 'Approved & Closed' && (
                          <button
                            onClick={() => handleUpdateStatus('Approved & Closed')}
                            className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve & Close CAPA</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </>
          ) : (
            <div className="text-center text-slate-500 py-12 text-xs">
              Select a corrective action record to review investigation notes.
            </div>
          )}
        </div>
      </div>

      {/* New CAPA Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">Initiate Corrective Action (CAPA)</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Action Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quarantining Batch B-025 and Emergency Cal for DMM-104"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Problem Description</label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Detail the non-conformance and affected records..."
                  className="w-full p-2 border rounded border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Person</label>
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0b2545] hover:bg-sky-900 text-white font-semibold rounded shadow-xs"
                >
                  Create Action Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
