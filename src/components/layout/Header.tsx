import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  RotateCcw,
  UserCheck,
  Search,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { repo } from '../../services/storageRepository';
import { User, UserRole } from '../../types';

interface HeaderProps {
  activeModule: string;
  setActiveModule: (mod: string) => void;
  onSearchClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeModule, setActiveModule }) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateInput, setDateInput] = useState(repo.getAssessmentDate());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentUser = repo.getActiveUser();
  const state = repo.getState();
  const findings = repo.getFindings();
  const criticalFindingsCount = findings.filter((f) => f.priority === 'Critical' && f.status !== 'Dismissed').length;

  const handleRoleChange = (userId: string) => {
    repo.setActiveUser(userId);
    setShowRoleMenu(false);
    showToast(`Switched active role persona to ${repo.getActiveUser().name} (${repo.getActiveUser().role})`);
  };

  const handleDateChange = (e: React.FormEvent) => {
    e.preventDefault();
    repo.setAssessmentDate(dateInput);
    setShowDatePicker(false);
    showToast(`Assessment benchmark date updated to ${dateInput}`);
  };

  const handleReset = () => {
    if (confirm('Reset entire system back to original synthetic benchmark data? This will restore initial calibration dates, products, and tests.')) {
      repo.resetToSeedData();
      setDateInput(repo.getAssessmentDate());
      showToast('System data reset to initial benchmark state.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <header className="bg-gradient-to-r from-[#0b2545] via-[#133b5c] to-[#0f2e4e] text-white border-b border-sky-950 shadow-md sticky top-0 z-40">
      {toastMessage && (
        <div className="bg-amber-500 text-slate-950 font-semibold px-4 py-1.5 text-xs text-center flex items-center justify-center gap-2 shadow-sm animate-pulse">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand and Title */}
          <div className="flex items-center gap-3.5">
            <div
              onClick={() => setActiveModule('architecture')}
              className="w-12 h-12 rounded bg-white text-[#0b2545] flex items-center justify-center font-black text-2xl tracking-tighter shadow-inner ring-2 ring-amber-400/80 cursor-pointer hover:scale-105 transition-transform"
              title="Click to view Architecture Blueprint"
            >
              FCIS
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Factory Compliance Intelligence System
                </h1>
                <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-950/80 text-sky-200 border border-sky-600/40">
                  Industrial Edition v2.4
                </span>
              </div>
              <p className="text-xs sm:text-sm text-sky-200/90 font-medium">
                Industrial Evidence, Standards Readiness & Quality Traceability
              </p>
            </div>
          </div>

          {/* Controls: Date Picker, Role Selector, Architecture Button */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Assessment Date Controller */}
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 px-3 py-1.5 rounded bg-sky-950/70 border border-sky-600/50 hover:bg-sky-900/80 text-xs text-sky-100 transition-colors shadow-sm"
                title="Evaluation Benchmark Date"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300">Assessment:</span>
                <span className="font-mono font-bold text-amber-300">{state.assessmentDate}</span>
                <ChevronDown className="w-3 h-3 text-sky-300" />
              </button>

              {showDatePicker && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-md shadow-xl border border-slate-200 p-4 z-50">
                  <p className="text-xs font-semibold text-slate-900 mb-1">Assessment Evaluation Date</p>
                  <p className="text-[11px] text-slate-500 mb-3 leading-tight">
                    Deterministic compliance rules evaluate validity against this date. (Default test date: 2026-10-09).
                  </p>
                  <form onSubmit={handleDateChange} className="space-y-3">
                    <input
                      type="date"
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 border rounded border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-[#0b2545] hover:bg-sky-900 text-white text-xs font-medium py-1.5 px-3 rounded"
                      >
                        Set Date
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDateInput('2026-10-09');
                          repo.setAssessmentDate('2026-10-09');
                          setShowDatePicker(false);
                        }}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-3 rounded"
                      >
                        Reset (Oct 9)
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded bg-sky-950/70 border border-sky-600/50 hover:bg-sky-900/80 text-xs text-sky-100 transition-colors shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-white max-w-[120px] truncate">{currentUser.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-900 text-sky-200 font-mono capitalize">
                  {currentUser.role.replace('_', ' ')}
                </span>
                <ChevronDown className="w-3 h-3 text-sky-300" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-md shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Switch Test Persona & Permissions
                  </div>
                  {state.users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleRoleChange(u.id)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-sky-50 transition-colors ${
                        u.id === currentUser.id ? 'bg-sky-50 font-semibold text-[#0b2545]' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-500 capitalize">{u.role.replace('_', ' ')}</div>
                      </div>
                      {u.id === currentUser.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Architecture Diagram Shortcut */}
            <button
              onClick={() => setActiveModule('architecture')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors shadow-sm ${
                activeModule === 'architecture'
                  ? 'bg-amber-500 text-slate-950 ring-2 ring-white/50'
                  : 'bg-sky-900/60 hover:bg-sky-800/80 text-sky-100 border border-sky-600/40'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Architecture Blueprint</span>
            </button>

            {/* Findings Notification Indicator */}
            <button
              onClick={() => setActiveModule('findings')}
              className="relative p-2 rounded bg-sky-950/70 border border-sky-600/50 hover:bg-sky-900 text-sky-200"
              title="Open Compliance Findings"
            >
              <Bell className="w-4 h-4" />
              {criticalFindingsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {criticalFindingsCount}
                </span>
              )}
            </button>

            {/* Reset to benchmark data */}
            <button
              onClick={handleReset}
              className="p-2 rounded bg-sky-950/70 border border-sky-600/50 hover:bg-rose-950/80 hover:border-rose-500 text-slate-300 hover:text-rose-200"
              title="Reset synthetic dataset back to original benchmark state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
