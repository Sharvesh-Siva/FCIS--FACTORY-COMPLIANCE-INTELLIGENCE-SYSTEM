import React, { useState } from 'react';
import { History, Search, Filter, ShieldCheck, Clock, User, Download } from 'lucide-react';
import { repo } from '../../services/storageRepository';
import { AuditEvent } from '../../types';

export const AuditTrailModule: React.FC = () => {
  const state = repo.getState();
  const auditEvents = state.auditEvents;
  const [search, setSearch] = useState('');
  const [operationFilter, setOperationFilter] = useState('all');

  const filtered = auditEvents.filter((e) => {
    const matchesSearch =
      e.summary.toLowerCase().includes(search.toLowerCase()) ||
      e.actorName.toLowerCase().includes(search.toLowerCase()) ||
      e.entityLabel.toLowerCase().includes(search.toLowerCase());

    const matchesOp = operationFilter === 'all' || e.operation === operationFilter;
    return matchesSearch && matchesOp;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-sky-700" />
            <h2 className="text-xl font-bold text-slate-900">Immutable Audit Trail & Event History</h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Chronological, append-only ledger of master record creations, updates, rule evaluations, and reviewer actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-300">
            {auditEvents.length} Total Logged Events
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by actor, entity ID, or change description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-600"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Operation:</span>
          <select
            value={operationFilter}
            onChange={(e) => setOperationFilter(e.target.value)}
            className="border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 text-slate-800"
          >
            <option value="all">All Operations</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="EVALUATE">EVALUATE</option>
            <option value="VERIFY">VERIFY</option>
            <option value="DISMISS">DISMISS</option>
            <option value="APPROVE">APPROVE</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Event Timestamp</th>
                <th className="p-3">Actor & Role</th>
                <th className="p-3">Operation</th>
                <th className="p-3">Target Entity</th>
                <th className="p-3">Event Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {new Date(evt.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{evt.actorName}</div>
                    <div className="text-[10px] text-slate-500 capitalize">{evt.actorRole.replace('_', ' ')}</div>
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                      {evt.operation}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-mono font-bold text-slate-800">{evt.entityLabel}</div>
                    <div className="text-[10px] text-slate-500">{evt.entityType}</div>
                  </td>
                  <td className="p-3 text-slate-700 leading-relaxed max-w-md">
                    {evt.summary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
