import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Building,
  Cpu,
  Wrench,
  FileCheck2,
  FileText,
  FlaskConical,
  Award,
  AlertTriangle,
  Network,
  ListTodo,
  FileSpreadsheet,
  History,
  Users,
  Sliders,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { repo } from '../../services/storageRepository';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (mod: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  desktopVisible?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: string;
  count?: number;
  alertCount?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  mobileOpen,
  setMobileOpen,
  desktopVisible = true,
}) => {
  const state = repo.getState();
  const findings = repo.getFindings();
  const openFindingsCount = findings.filter((f) => f.status !== 'Dismissed').length;
  const overdueActionsCount = state.actions.filter((a) => a.dueDate < state.assessmentDate && a.status !== 'Approved & Closed').length;
  const expiredCalibrationsCount = state.calibrations.filter((c) => c.validityEndDate < state.assessmentDate).length;

  const navGroups: NavGroup[] = [
    {
      title: 'SYSTEM OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
        { id: 'architecture', label: 'Architecture & Blueprint', icon: Layers, highlight: true },
        { id: 'dependencies', label: 'Evidence Dependency Graph', icon: Network, badge: 'Key Trace' },
      ],
    },
    {
      title: 'MASTER REGISTERS',
      items: [
        { id: 'organisations', label: 'Organisations & Factories', icon: Building, count: state.organisation.factories.length },
        { id: 'products', label: 'Products & Product Models', icon: Cpu, count: state.products.length },
        { id: 'instruments', label: 'Equipment & Instruments', icon: Wrench, count: state.instruments.length },
        { id: 'calibrations', label: 'Calibration Records', icon: FileCheck2, count: state.calibrations.length, alertCount: expiredCalibrationsCount },
        { id: 'tests', label: 'Quality Tests & Batches', icon: FlaskConical, count: state.tests.length },
        { id: 'certifications', label: 'Certifications & Standards', icon: Award, count: state.certifications.length },
      ],
    },
    {
      title: 'EVIDENCE & INTELLIGENCE',
      items: [
        { id: 'documents', label: 'Documents & Evidence', icon: FileText, count: state.documents.length },
        { id: 'findings', label: 'Compliance Findings', icon: AlertTriangle, alertCount: openFindingsCount },
        { id: 'actions', label: 'Corrective Actions (CAPA)', icon: ListTodo, alertCount: overdueActionsCount },
        { id: 'reports', label: 'Readiness Reports', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'GOVERNANCE & AUDIT',
      items: [
        { id: 'audit', label: 'Audit Trail & Event Log', icon: History, count: state.auditEvents.length },
        { id: 'roles', label: 'User & Role Management', icon: Users, count: state.users.length },
        { id: 'settings', label: 'Rule Settings & Roadmap', icon: Sliders },
      ],
    },
  ];

  const handleSelect = (id: string) => {
    setActiveModule(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-30 w-72 bg-[#0b2038] text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ${
          desktopVisible ? 'lg:translate-x-0 lg:static' : 'lg:hidden'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand header on mobile / small screen */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-white text-[#0b2545] font-black text-lg flex items-center justify-center">
              FCIS
            </span>
            <span className="font-bold text-white text-sm">Industrial Compliance</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-slate-400 hover:text-white p-1 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Current Active Factory Scope Indicator */}
        <div className="px-4 py-3 bg-[#08182b] border-b border-slate-800/80">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Active Factory Scope
          </div>
          <div className="text-xs font-semibold text-white truncate mt-0.5">
            {state.organisation.factories[0]?.name || 'Bengaluru Plant (Unit 1)'}
          </div>
          <div className="text-[11px] text-amber-400/90 font-mono flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Org: {state.organisation.code}</span>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.title}>
              <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {group.title}
              </div>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeModule === item.id;
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleSelect(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-colors group cursor-pointer ${
                          isActive
                            ? 'bg-sky-600 text-white font-semibold shadow-xs'
                            : item.highlight
                            ? 'text-amber-300 hover:bg-slate-800/80 hover:text-white'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive
                                ? 'text-white'
                                : item.highlight
                                ? 'text-amber-400'
                                : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-1">
                          {item.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                              {item.badge}
                            </span>
                          )}
                          {item.alertCount !== undefined && item.alertCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white ring-1 ring-rose-300/30">
                              {item.alertCount}
                            </span>
                          )}
                          {item.count !== undefined && !item.alertCount && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                              {item.count}
                            </span>
                          )}
                          {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="p-3 border-t border-slate-800/80 bg-[#08182b] text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">Deterministic Engine v2.1</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
            ONLINE
          </span>
        </div>
      </aside>
    </>
  );
};
