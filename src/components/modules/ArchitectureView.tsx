import React, { useState } from 'react';
import {
  Users,
  Shield,
  Layout,
  Server,
  Database,
  FileCheck,
  Cpu,
  Wrench,
  FileText,
  FlaskConical,
  AlertTriangle,
  FileSpreadsheet,
  Network,
  Sparkles,
  GitBranch,
  CheckCircle2,
  HardDrive,
  Lock,
  ArrowRight,
  Info,
  Check,
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>('rule-engine');

  const nodeDetails: Record<string, { title: string; type: string; status: string; description: string; items: string[] }> = {
    'rule-engine': {
      title: 'Compliance Rule Engine',
      type: 'Core Business Logic Layer',
      status: 'Implemented & Verified (Phase 1/2)',
      description:
        'Deterministic rule evaluation engine executing CAL-001 through ACT-001 against fixed benchmark dates and record relationships without stochastic hallucination.',
      items: [
        'Pure deterministic validation functions (CAL-001..003, DOC-001..003, CERT-001, ACT-001)',
        'Date-interval boundary calculations (testDate vs validityEndDate)',
        'Explaining findings in human language with recommended actions',
        'Decoupled from interface for automated unit testing',
      ],
    },
    'dependency-graph': {
      title: 'Evidence Dependency Graph',
      type: 'Relational Intelligence Layer',
      status: 'Implemented & Verified (Phase 1/3)',
      description:
        'Bi-directional relationship graph traversing: Product → Batch → Quality Test → Instrument → Calibration Record → Evidence Document.',
      items: [
        'Enables impact tracing when an instrument is out of calibration',
        'Differentiates valid historical tests (T-001) from out-of-interval tests (T-002)',
        'Prevents global invalidation of unaffected records',
        'Visual interactive graph and screen-reader accessible textual tree',
      ],
    },
    'firestore': {
      title: 'Cloud Firestore Database Collections',
      type: 'Persistent Storage Tier',
      status: 'Active (Mock Repository Interface + Ready for Firebase RPC)',
      description:
        'Deliberately modeled document schemas for organisations, factories, products, instruments, calibrations, documents, tests, findings, actions, and audit events.',
      items: [
        'Repository interface isolates UI from storage mechanism',
        'Currently backed by persistent localStorage with one-click benchmark reset',
        'Structured schemas ready for direct Firestore provisioning in Phase 4',
        'Append-only immutable audit collection',
      ],
    },
    'gemini-service': {
      title: 'Gemini Document Intelligence',
      type: 'AI Supporting Integration',
      status: 'Simulated Demo Tooling (Phase 3/5)',
      description:
        'Server-side document processor for extracting certificate numbers, serial numbers, validity dates, and calibration laboratories from uploaded test documents.',
      items: [
        'Extracts candidate key-value pairs with confidence scoring',
        'Strict institutional safeguard: Extracted metadata NEVER automatically verifies a record without human sign-off',
        'Flag mismatches (e.g. DOC-MISMATCH-99 serial number discrepancy)',
      ],
    },
    'audit-service': {
      title: 'Audit Service & Event Logging',
      type: 'Governance & Accountability Layer',
      status: 'Implemented & Verified (Phase 1)',
      description:
        'Append-only chronological audit trail capturing actor, role, operation type, entity id, timestamp, and change summaries for every system interaction.',
      items: [
        'Immutable event history for all CRUD and verification actions',
        'Role tracking (Quality Engineer, Calibration Coordinator, Reviewer, Auditor)',
        'Full traceability for certification inspections and audits',
      ],
    },
  };

  const selectedInfo = selectedNode ? nodeDetails[selectedNode] : null;

  return (
    <div className="space-y-6">
      {/* Title & Architecture Banner matching Image 2 */}
      <div className="bg-gradient-to-r from-[#0b2545] via-[#103254] to-[#0b2545] text-white rounded-lg p-5 border border-sky-950 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded bg-white text-[#0b2545] flex items-center justify-center font-black text-3xl tracking-tighter shadow-md ring-2 ring-amber-400">
              FCIS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Factory Compliance Intelligence System
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-900 text-sky-200 border border-sky-600/40">
                  Full-Stack Architecture
                </span>
              </div>
              <p className="text-xs text-sky-200 mt-0.5">
                Industrial Evidence, Standards Readiness & Quality Traceability | Architecture Blueprint
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-sky-950/80 px-4 py-2 rounded-md border border-sky-700/50">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-bold text-xs">
              BIS
            </div>
            <div className="text-right text-xs">
              <div className="text-amber-300 font-semibold">Inspired by BIS Standards</div>
              <div className="text-[10px] text-slate-300">(Not an official BIS portal)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Architecture Canvas */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              System Architecture Diagram (Click any subsystem to inspect details)
            </h3>
            <p className="text-xs text-slate-500">
              Detailed visualization of Users, Frontend modules, Backend Services, Firestore Schemas, and Integrations
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
            Phase 1 & 2 Active: Repository + Deterministic Engine
          </span>
        </div>

        {/* 3 Main Columns: Left (Users & Auth), Middle (Frontend & Backend), Right (Database & Storage) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* COLUMN 1: Users & Roles (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-sky-50/70 border border-sky-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-900 uppercase tracking-wider mb-3">
                <Users className="w-4 h-4 text-sky-700" />
                <span>Users & Roles</span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { title: 'Organisation Administrator', desc: 'Manage organisation, users, settings' },
                  { title: 'Quality Engineer', desc: 'Products, tests, findings, corrective actions' },
                  { title: 'Calibration Coordinator', desc: 'Instruments, calibration records' },
                  { title: 'Compliance Reviewer', desc: 'Documents, requirements, reports' },
                  { title: 'Read-Only Auditor', desc: 'View records, audit trail, reports' },
                  { title: 'Demonstration User', desc: 'Access synthetic data (learning mode)' },
                ].map((role) => (
                  <div key={role.title} className="p-2 bg-white rounded border border-sky-100 shadow-2xs">
                    <div className="font-semibold text-slate-900">{role.title}</div>
                    <div className="text-[11px] text-slate-500">{role.desc}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 p-2 bg-sky-900 text-white rounded text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-300 shrink-0" />
                <div>
                  <div className="font-semibold text-[11px]">Authentication & RBAC</div>
                  <div className="text-[10px] text-sky-200">Role-Based Access Control</div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Frontend & Backend Services (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* Frontend Tier */}
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                <Layout className="w-4 h-4 text-sky-600" />
                <span>Frontend (React + TypeScript)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { name: 'Dashboard', sub: 'Overview & alerts', icon: Layout },
                  { name: 'Product Register', sub: 'Products & batches', icon: Cpu },
                  { name: 'Equipment Register', sub: 'Instruments & calibration', icon: Wrench },
                  { name: 'Documents', sub: 'Evidence & verification', icon: FileText },
                  { name: 'Tests', sub: 'Quality test records', icon: FlaskConical },
                  { name: 'Findings', sub: 'Issues & impact', icon: AlertTriangle },
                  { name: 'Reports', sub: 'Readiness & exports', icon: FileSpreadsheet },
                  { name: 'Dependency Graph', sub: 'Interactive trace', icon: Network },
                ].map((mod) => (
                  <div key={mod.name} className="p-2 bg-white rounded border border-slate-200 text-center shadow-2xs">
                    <mod.icon className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                    <div className="font-semibold text-slate-900 text-[11px] truncate">{mod.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{mod.sub}</div>
                  </div>
                ))}
              </div>

              <div className="mt-2 text-center text-[10px] font-mono text-slate-500">
                UI Components | Routing | State Management | Responsive Design | Forms & Validation
              </div>
            </div>

            {/* Backend Services Tier */}
            <div className="bg-emerald-50/60 border border-emerald-300 rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider mb-3">
                <Server className="w-4 h-4 text-emerald-700" />
                <span>Backend Services (Node.js / Express or Functions)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  {
                    id: 'rule-engine',
                    title: 'Compliance Rule Engine',
                    desc: 'Deterministic rules, date checks',
                  },
                  {
                    id: 'dependency-graph',
                    title: 'Business Logic Layer',
                    desc: 'CRUD & dependency tracing',
                  },
                  {
                    id: 'document-service',
                    title: 'Document Service',
                    desc: 'File upload & Gemini extraction',
                  },
                  {
                    id: 'report-service',
                    title: 'Report Service',
                    desc: 'Readiness reports & exports',
                  },
                  {
                    id: 'audit-service',
                    title: 'Audit Service',
                    desc: 'Event logging & history',
                  },
                  {
                    id: 'api-layer',
                    title: 'API Layer',
                    desc: 'REST endpoints & validation',
                  },
                ].map((svc) => (
                  <button
                    key={svc.title}
                    onClick={() => setSelectedNode(svc.id)}
                    className={`p-2 rounded text-left border transition-all cursor-pointer ${
                      selectedNode === svc.id
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm ring-2 ring-emerald-500'
                        : 'bg-white text-slate-900 border-emerald-200 hover:border-emerald-400 shadow-2xs'
                    }`}
                  >
                    <div className="font-semibold text-[11px] truncate">{svc.title}</div>
                    <div className={`text-[10px] truncate ${selectedNode === svc.id ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {svc.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Evidence Relationships Flow */}
            <div className="bg-amber-50/70 border border-amber-300 rounded-lg p-3 text-xs">
              <div className="font-bold text-amber-950 flex items-center gap-1.5 mb-2">
                <Network className="w-4 h-4 text-amber-700" />
                <span>Core Evidence Relationships</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-amber-900">
                <span className="px-2 py-0.5 rounded bg-white border border-amber-300 font-bold">Product</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-white border border-amber-300 font-bold">Batch</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-white border border-amber-300 font-bold">Test</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-white border border-amber-300 font-bold">Instrument</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-white border border-amber-300 font-bold">Calibration</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-white border border-amber-300 font-bold">Evidence</span>
              </div>
            </div>
          </div>

          {/* COLUMN 3: Database & Integrations (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Firestore Collections */}
            <div className="bg-sky-50/60 border border-sky-300 rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-950 uppercase tracking-wider mb-2">
                <Database className="w-4 h-4 text-sky-700" />
                <span>Data Model (Firestore)</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-700">
                {[
                  'organisations',
                  'factories',
                  'users',
                  'products',
                  'batches',
                  'instruments',
                  'calibrations',
                  'certifications',
                  'documents',
                  'tests',
                  'findings',
                  'actions',
                  'audit_events',
                  'rules',
                  'relationships',
                ].map((col) => (
                  <div key={col} className="bg-white px-2 py-1 rounded border border-sky-200 truncate">
                    {col}
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t border-sky-200 text-[10px] text-slate-500">
                Cloud Storage: Private evidence files (PDF, images) with access control rules.
              </div>
            </div>

            {/* External Supporting Integrations */}
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 text-xs">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                External Integrations
              </div>
              <div className="space-y-2">
                <div
                  onClick={() => setSelectedNode('gemini-service')}
                  className="p-2 bg-white rounded border border-slate-200 cursor-pointer hover:border-amber-400"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Gemini AI (Interactions)</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Document extraction & metadata helper</div>
                </div>

                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <GitBranch className="w-3.5 h-3.5 text-sky-600" />
                    <span>Version Control (GitHub)</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Automated workflows & CI/CD</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Subsystem Inspector Drawer */}
        {selectedInfo && (
          <div className="mt-6 p-4 rounded-lg bg-slate-900 text-white border border-slate-800 shadow-sm animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h4 className="font-bold text-sm text-white">{selectedInfo.title}</h4>
                <span className="text-xs text-slate-400 font-mono">[{selectedInfo.type}]</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                {selectedInfo.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">{selectedInfo.description}</p>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {selectedInfo.items.map((it, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{it}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Bar: Development Phases Roadmap (Matching diagram bottom strip) */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Development Phases Roadmap
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            {[
              {
                num: '1',
                name: 'Foundation',
                sub: 'App shell, data model, core modules',
                active: true,
                status: 'COMPLETE',
              },
              {
                num: '2',
                name: 'Core Workflows',
                sub: 'Full record management, deterministic rules',
                active: true,
                status: 'COMPLETE',
              },
              {
                num: '3',
                name: 'Intelligence',
                sub: 'Dependency graph, reports, advanced rules',
                active: true,
                status: 'ACTIVE',
              },
              {
                num: '4',
                name: 'Firebase Integration',
                sub: 'Auth, Firestore, Storage, security rules',
                active: false,
                status: 'PREPARED',
              },
              {
                num: '5',
                name: 'Pilot & Validation',
                sub: 'Real factory trial, user feedback',
                active: false,
                status: 'PLANNED',
              },
            ].map((phase) => (
              <div
                key={phase.num}
                className={`p-3 rounded border text-left ${
                  phase.active
                    ? 'bg-sky-50 border-sky-400 text-sky-950 ring-1 ring-sky-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-5 h-5 rounded-full bg-[#0b2545] text-white flex items-center justify-center font-bold text-xs">
                    {phase.num}
                  </span>
                  <span className={`text-[10px] font-bold ${phase.active ? 'text-sky-800' : 'text-slate-400'}`}>
                    {phase.status}
                  </span>
                </div>
                <div className="font-bold text-xs mt-2 text-slate-900">{phase.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">{phase.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
