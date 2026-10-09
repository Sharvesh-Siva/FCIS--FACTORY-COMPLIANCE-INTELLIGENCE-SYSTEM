import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Network,
  Building,
  Cpu,
  Wrench,
  FileCheck2,
  FlaskConical,
  Award,
  FileText,
  AlertTriangle,
  ListTodo,
  FileSpreadsheet,
  History,
  Users,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { repo } from '../../services/storageRepository';

interface TopModuleNavigationProps {
  activeModule: string;
  setActiveModule: (mod: string) => void;
}

export const TopModuleNavigation: React.FC<TopModuleNavigationProps> = ({
  activeModule,
  setActiveModule,
}) => {
  const state = repo.getState();
  const findings = repo.getFindings();
  const openFindingsCount = findings.filter((f) => f.status !== 'Dismissed').length;
  const overdueActionsCount = state.actions.filter(
    (a) => a.dueDate < state.assessmentDate && a.status !== 'Approved & Closed'
  ).length;
  const expiredCalibrationsCount = state.calibrations.filter(
    (c) => c.validityEndDate < state.assessmentDate
  ).length;

  const systemOverviewItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'architecture', label: 'Architecture Blueprint', icon: Layers, highlight: true },
    { id: 'dependencies', label: 'Evidence Dependency Graph', icon: Network, badge: 'Key Trace' },
  ];

  const masterRegisterItems = [
    { id: 'organisations', label: 'Organisations & Units', icon: Building, count: state.organisation.factories.length },
    { id: 'products', label: 'Products & Models', icon: Cpu, count: state.products.length },
    { id: 'instruments', label: 'Equipment & Instruments', icon: Wrench, count: state.instruments.length },
    {
      id: 'calibrations',
      label: 'Calibration Records',
      icon: FileCheck2,
      count: state.calibrations.length,
      alertCount: expiredCalibrationsCount,
    },
    { id: 'tests', label: 'Quality Tests & Batches', icon: FlaskConical, count: state.tests.length },
    { id: 'certifications', label: 'Certifications & Mandates', icon: Award, count: state.certifications.length },
  ];

  const workflowItems = [
    { id: 'documents', label: 'Documents & Evidence', icon: FileText, count: state.documents.length },
    { id: 'findings', label: 'Compliance Findings', icon: AlertTriangle, alertCount: openFindingsCount },
    { id: 'actions', label: 'Corrective Actions (CAPA)', icon: ListTodo, alertCount: overdueActionsCount },
    { id: 'reports', label: 'Readiness Dossier & PDF', icon: FileSpreadsheet, badge: 'PDF Export' },
    { id: 'audit', label: 'Audit Trail', icon: History, count: state.auditEvents.length },
    { id: 'roles', label: 'Users & Roles', icon: Users, count: state.users.length },
    { id: 'settings', label: 'Rule Settings', icon: Sliders },
  ];

  return (
    <nav className="bg-[#0e2a47] text-white border-b-2 border-amber-500 shadow-md sticky top-[72px] sm:top-[74px] z-30 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tier 1: SYSTEM OVERVIEW & MASTER REGISTERS (The primary requested top navigation) */}
        <div className="py-2.5 flex items-center justify-between border-b border-sky-950/80 gap-3 overflow-x-auto scrollbar-none">
          {/* System Overview Group */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/60 hidden sm:inline">
              OVERVIEW
            </span>
            {systemOverviewItems.map((item) => {
              const isActive = activeModule === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm ring-1 ring-amber-300 font-bold'
                      : item.highlight
                      ? 'bg-sky-950/70 text-amber-300 hover:bg-sky-900 border border-amber-400/30'
                      : 'text-sky-100 hover:bg-sky-900/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="h-5 w-px bg-sky-800/60 shrink-0 hidden md:block" />

          {/* Master Registers Group */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 hidden sm:inline">
              REGISTERS
            </span>
            {masterRegisterItems.map((item) => {
              const isActive = activeModule === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-sm ring-1 ring-emerald-300 font-bold'
                      : 'text-sky-100 hover:bg-sky-900/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-emerald-400'}`} />
                  <span>{item.label}</span>
                  {item.alertCount !== undefined && item.alertCount > 0 ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white ring-1 ring-rose-300">
                      {item.alertCount}
                    </span>
                  ) : item.count !== undefined ? (
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${isActive ? 'bg-emerald-600/40 text-slate-950' : 'bg-sky-950 text-slate-300'}`}>
                      {item.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier 2: EVIDENCE, FINDINGS, CAPA, REPORTS & GOVERNANCE */}
        <div className="py-1.5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none text-xs">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 mr-1 hidden lg:inline">
              EVIDENCE & AUDIT:
            </span>
            {workflowItems.map((item) => {
              const isActive = activeModule === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white font-bold shadow-xs'
                      : 'text-sky-200 hover:bg-sky-900/40 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3 h-3 ${isActive ? 'text-white' : 'text-sky-400'}`} />
                  <span>{item.label}</span>
                  {item.alertCount !== undefined && item.alertCount > 0 ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-600 text-white">
                      {item.alertCount}
                    </span>
                  ) : item.badge ? (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-200 text-sky-950">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-mono text-amber-300/90 shrink-0 hidden xl:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Scope: {state.organisation.factories[0].unitCode} (Peenya)</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
