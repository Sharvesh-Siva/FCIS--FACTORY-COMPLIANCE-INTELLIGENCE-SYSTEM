import React, { useState } from 'react';
import {
  Network,
  Cpu,
  Layers,
  FlaskConical,
  Wrench,
  FileCheck2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Info,
  ListFilter,
  Eye,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { repo } from '../../services/storageRepository';
import { StatusBadge } from '../common/StatusBadge';

export const DependencyExplorer: React.FC = () => {
  const state = repo.getState();
  const findings = repo.getFindings();
  const [selectedChain, setSelectedChain] = useState<'t002' | 't001' | 'all'>('t002');
  const [activeNodeId, setActiveNodeId] = useState<string>('node-test-t002');
  const [viewMode, setViewMode] = useState<'visual' | 'textual'>('visual');

  // Node data mapping
  const nodes = {
    'node-prod-p001': {
      id: 'node-prod-p001',
      category: 'Product',
      label: 'P-001 (PA-12)',
      name: '12V 2.5A Regulated Power Adapter',
      model: 'DC-PA12-2500M',
      standards: ['IS 13252 (Part 1):2010', 'IEC 60950-1'],
      status: 'Review Required',
      notes: 'Parent manufactured model. Linked to production lots B-024 and B-025.',
    },
    'node-batch-b024': {
      id: 'node-batch-b024',
      category: 'Batch',
      label: 'Batch B-024',
      name: 'LOT-2026-09-B024 (1,200 units)',
      mfgDate: '2026-09-18',
      status: 'Passed',
      notes: 'Tested on 2026-09-20 under valid calibration. Ready for distribution.',
    },
    'node-batch-b025': {
      id: 'node-batch-b025',
      category: 'Batch',
      label: 'Batch B-025',
      name: 'LOT-2026-10-B025 (1,500 units)',
      mfgDate: '2026-10-04',
      status: 'Under Review',
      notes: 'Tested on 2026-10-05 after DMM-104 validity expired. Quarantined for review.',
    },
    'node-test-t001': {
      id: 'node-test-t001',
      category: 'Quality Test',
      label: 'Test T-001',
      name: 'Output Voltage Regulation (12V DC)',
      testDate: '2026-09-20',
      result: 'Pass (12.04V)',
      instrument: 'DMM-104',
      status: 'Approved',
      validityCheck: 'VALID: Test date (2026-09-20) < Cal validity end date (2026-10-01).',
      flagged: false,
    },
    'node-test-t002': {
      id: 'node-test-t002',
      category: 'Quality Test',
      label: 'Test T-002',
      name: 'Output Voltage Regulation (12V DC)',
      testDate: '2026-10-05',
      result: 'Pass (12.02V)',
      instrument: 'DMM-104',
      status: 'Review Required',
      validityCheck: 'CAL-003 TRIGGERED: Test date (2026-10-05) is 4 days AFTER Cal expiry (2026-10-01).',
      flagged: true,
    },
    'node-inst-dmm104': {
      id: 'node-inst-dmm104',
      category: 'Instrument',
      label: 'DMM-104',
      name: 'Fluke 87V Digital Multimeter',
      serialNumber: 'SN-104A',
      location: 'Electronics Quality Lab - Bench 4',
      calValidityEnd: '2026-10-01',
      status: 'Calibration Expired',
      notes: 'Instrument validity ended on 01 October 2026. Cannot be used for tests after this date without re-calibration.',
      flagged: true,
    },
    'node-cal-cert01': {
      id: 'node-cal-cert01',
      category: 'Calibration Record',
      label: 'CAL-CERT-01',
      name: 'Certificate NABL/CC/2026/0110-DMM',
      lab: 'Apex Precision Metrology Labs (NABL Accr. CC-2194)',
      calDate: '2026-01-10',
      validityEndDate: '2026-10-01',
      status: 'Expired (as of 2026-10-09)',
      notes: 'Accredited calibration with 9-month interval.',
    },
    'node-doc-cal01': {
      id: 'node-doc-cal01',
      category: 'Evidence Document',
      label: 'DOC-2026-CAL-01',
      name: 'Calibration_Certificate_DMM104_SN104A_ApexLabs.pdf',
      fileType: 'application/pdf',
      verifiedBy: 'Amit Patel (Metrology Coordinator)',
      status: 'Verified',
      notes: 'Tamper-evident seal and certificate hash verified.',
    },
  };

  const activeNode = nodes[activeNodeId as keyof typeof nodes] || nodes['node-test-t002'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-sky-700" />
              <h2 className="text-xl font-bold text-slate-900">Evidence Dependency Graph</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-100 text-sky-900 border border-sky-300">
                Deterministic Traceability
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Trace connections between Products, Batches, Quality Tests, Equipment, Calibration Records, and Evidence files.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-md shadow-2xs border border-slate-300 bg-slate-100 p-0.5">
              <button
                onClick={() => setViewMode('visual')}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  viewMode === 'visual' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Visual Graph
              </button>
              <button
                onClick={() => setViewMode('textual')}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  viewMode === 'textual' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Accessible Tree
              </button>
            </div>
          </div>
        </div>

        {/* Chain selector */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Select Trace Scenario:</span>
            <button
              onClick={() => {
                setSelectedChain('t002');
                setActiveNodeId('node-test-t002');
              }}
              className={`px-3 py-1.5 rounded font-medium border transition-colors cursor-pointer ${
                selectedChain === 't002'
                  ? 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-400/30'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="font-bold text-rose-700">Flagged Path:</span> Test T-002 (Post-Expiry Anomaly)
            </button>
            <button
              onClick={() => {
                setSelectedChain('t001');
                setActiveNodeId('node-test-t001');
              }}
              className={`px-3 py-1.5 rounded font-medium border transition-colors cursor-pointer ${
                selectedChain === 't001'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-400/30'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="font-bold text-emerald-700">Valid Path:</span> Test T-001 (Valid In-Period Test)
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Benchmark Assessment Date: <strong>{state.assessmentDate}</strong>
          </div>
        </div>
      </div>

      {/* Main Graph & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          {viewMode === 'visual' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span className="font-semibold">Dependency Direction: Origin Entity → Supporting Evidence Chain</span>
                <span className="font-mono text-[11px]">Click node to inspect metadata</span>
              </div>

              {/* Graphical Path Diagram */}
              <div className="relative py-4 flex flex-col gap-6">
                {/* Level 1: Product */}
                <div className="flex justify-center">
                  <div
                    onClick={() => setActiveNodeId('node-prod-p001')}
                    className={`p-3.5 rounded-lg border-2 w-72 text-center cursor-pointer transition-all shadow-2xs ${
                      activeNodeId === 'node-prod-p001'
                        ? 'border-sky-600 bg-sky-50/70 ring-2 ring-sky-400/40'
                        : 'border-slate-300 bg-white hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-sky-800">PRODUCT</span>
                      <StatusBadge status="Under Review" size="sm" />
                    </div>
                    <div className="font-bold text-sm text-slate-900">P-001 (PA-12)</div>
                    <div className="text-[11px] text-slate-600">12V 2.5A Regulated Power Adapter</div>
                  </div>
                </div>

                {/* Connector Arrow */}
                <div className="flex justify-center text-slate-400">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>

                {/* Level 2: Batch (T-001 or T-002) */}
                <div className="flex justify-center">
                  {selectedChain === 't002' ? (
                    <div
                      onClick={() => setActiveNodeId('node-batch-b025')}
                      className={`p-3.5 rounded-lg border-2 w-72 text-center cursor-pointer transition-all shadow-2xs ${
                        activeNodeId === 'node-batch-b025'
                          ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-400/40'
                          : 'border-rose-300 bg-rose-50/50 hover:border-rose-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-rose-800">BATCH</span>
                        <StatusBadge status="Under Review" size="sm" />
                      </div>
                      <div className="font-bold text-sm text-slate-900">Batch B-025</div>
                      <div className="text-[11px] text-slate-600">Manufactured: 2026-10-04 (1,500 units)</div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setActiveNodeId('node-batch-b024')}
                      className={`p-3.5 rounded-lg border-2 w-72 text-center cursor-pointer transition-all shadow-2xs ${
                        activeNodeId === 'node-batch-b024'
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400/40'
                          : 'border-emerald-300 bg-emerald-50/50 hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-emerald-800">BATCH</span>
                        <StatusBadge status="Passed" size="sm" />
                      </div>
                      <div className="font-bold text-sm text-slate-900">Batch B-024</div>
                      <div className="text-[11px] text-slate-600">Manufactured: 2026-09-18 (1,200 units)</div>
                    </div>
                  )}
                </div>

                {/* Connector Arrow */}
                <div className="flex justify-center text-slate-400">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>

                {/* Level 3: Quality Test (The critical divergence point) */}
                <div className="flex justify-center">
                  {selectedChain === 't002' ? (
                    <div
                      onClick={() => setActiveNodeId('node-test-t002')}
                      className={`p-4 rounded-lg border-2 w-80 text-center cursor-pointer transition-all shadow-sm ${
                        activeNodeId === 'node-test-t002'
                          ? 'border-rose-600 bg-rose-100 ring-2 ring-rose-500/50'
                          : 'border-rose-400 bg-rose-50 hover:border-rose-500'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-rose-900">QUALITY TEST (FLAGGED)</span>
                        <StatusBadge status="CAL-003 Triggered" size="sm" />
                      </div>
                      <div className="font-bold text-base text-slate-900">Test T-002 (Pass Recorded)</div>
                      <div className="text-xs text-rose-900 font-semibold mt-1">
                        Conducted: 2026-10-05
                      </div>
                      <div className="text-[11px] text-rose-800 mt-1 font-mono bg-white/70 py-1 px-2 rounded border border-rose-200">
                        ⚠ 4 days AFTER DMM-104 validity expired (2026-10-01)
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setActiveNodeId('node-test-t001')}
                      className={`p-4 rounded-lg border-2 w-80 text-center cursor-pointer transition-all shadow-sm ${
                        activeNodeId === 'node-test-t001'
                          ? 'border-emerald-600 bg-emerald-100 ring-2 ring-emerald-500/50'
                          : 'border-emerald-400 bg-emerald-50 hover:border-emerald-500'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-emerald-900">QUALITY TEST (VALID)</span>
                        <StatusBadge status="Approved" size="sm" />
                      </div>
                      <div className="font-bold text-base text-slate-900">Test T-001 (Pass Recorded)</div>
                      <div className="text-xs text-emerald-900 font-semibold mt-1">
                        Conducted: 2026-09-20
                      </div>
                      <div className="text-[11px] text-emerald-800 mt-1 font-mono bg-white/70 py-1 px-2 rounded border border-emerald-200">
                        ✓ Inside DMM-104 validity window (Ends 2026-10-01)
                      </div>
                    </div>
                  )}
                </div>

                {/* Connector Arrow */}
                <div className="flex justify-center text-slate-400">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>

                {/* Level 4: Instrument */}
                <div className="flex justify-center">
                  <div
                    onClick={() => setActiveNodeId('node-inst-dmm104')}
                    className={`p-3.5 rounded-lg border-2 w-72 text-center cursor-pointer transition-all shadow-2xs ${
                      activeNodeId === 'node-inst-dmm104'
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400/40'
                        : 'border-amber-300 bg-amber-50/40 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-amber-900">INSTRUMENT</span>
                      <StatusBadge status="Calibration Expired" size="sm" />
                    </div>
                    <div className="font-bold text-sm text-slate-900">DMM-104 (Fluke 87V)</div>
                    <div className="text-[11px] text-slate-600">Serial: SN-104A | Bench 4</div>
                  </div>
                </div>

                {/* Connector Arrow */}
                <div className="flex justify-center text-slate-400">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>

                {/* Level 5: Calibration Record & Evidence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setActiveNodeId('node-cal-cert01')}
                    className={`p-3.5 rounded-lg border-2 text-center cursor-pointer transition-all shadow-2xs ${
                      activeNodeId === 'node-cal-cert01'
                        ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-400/40'
                        : 'border-slate-300 bg-white hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-slate-700">CALIBRATION</span>
                      <span className="text-[10px] font-mono text-rose-600 font-bold">END: 2026-10-01</span>
                    </div>
                    <div className="font-bold text-xs text-slate-900">CAL-CERT-01</div>
                    <div className="text-[10px] text-slate-500 truncate">NABL/CC/2026/0110-DMM</div>
                  </div>

                  <div
                    onClick={() => setActiveNodeId('node-doc-cal01')}
                    className={`p-3.5 rounded-lg border-2 text-center cursor-pointer transition-all shadow-2xs ${
                      activeNodeId === 'node-doc-cal01'
                        ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-400/40'
                        : 'border-slate-300 bg-white hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-slate-700">PDF EVIDENCE</span>
                      <StatusBadge status="Verified" size="sm" />
                    </div>
                    <div className="font-bold text-xs text-slate-900 truncate">DOC-2026-CAL-01</div>
                    <div className="text-[10px] text-slate-500 truncate">ApexLabs_CalCert.pdf</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Textual Tree Representation for Accessibility */
            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="font-bold text-slate-900 text-sm mb-2">Hierarchical Dependency Tree:</div>
                <ul className="space-y-2 text-slate-700 list-none pl-2">
                  <li>
                    📂 <strong>Product: P-001 (PA-12)</strong> [IS 13252 (Part 1):2010]
                    <ul className="pl-4 mt-1 border-l-2 border-slate-300 space-y-2">
                      <li>
                        📦 <strong>Batch: B-024</strong> (Mfg: 2026-09-18)
                        <ul className="pl-4 border-l-2 border-emerald-300 text-emerald-800">
                          <li>
                            🔬 <strong>Test: T-001</strong> (Date: 2026-09-20 | Pass)
                            <br />↳ Instrument: DMM-104 (Cal End: 2026-10-01)
                            <br />↳ Status: <strong>VALID INTERVAL</strong>
                          </li>
                        </ul>
                      </li>
                      <li>
                        📦 <strong>Batch: B-025</strong> (Mfg: 2026-10-04)
                        <ul className="pl-4 border-l-2 border-rose-400 text-rose-900">
                          <li>
                            🔬 <strong>Test: T-002</strong> (Date: 2026-10-05 | Pass)
                            <br />↳ Instrument: DMM-104 (Cal End: 2026-10-01)
                            <br />↳ Status: <strong className="text-rose-700">CAL-003 TRIGGERED (Post-expiry test)</strong>
                          </li>
                        </ul>
                      </li>
                      <li>
                        🔧 <strong>Shared Instrument: DMM-104</strong> (Fluke 87V, SN: SN-104A)
                        <br />↳ Calibration Record: CAL-CERT-01 (Apex Labs CC-2194)
                        <br />↳ Supporting Evidence: DOC-2026-CAL-01.pdf (Verified by Amit Patel)
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right Detail Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Inspected Node
                </span>
                <h3 className="text-sm font-bold text-slate-900">{activeNode.label}</h3>
              </div>
              <StatusBadge status={activeNode.status} />
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Entity Category:</span>
                <span className="font-semibold text-slate-800">{activeNode.category}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Entity Name / Description:</span>
                <span className="text-slate-900 font-medium">{activeNode.name}</span>
              </div>

              {'validityCheck' in activeNode && (
                <div className={`p-2.5 rounded border ${
                  activeNode.flagged ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}>
                  <span className="font-bold block text-[11px] uppercase">Rule Evaluation Result:</span>
                  <span className="mt-0.5 block leading-relaxed">{activeNode.validityCheck}</span>
                </div>
              )}

              {'serialNumber' in activeNode && (
                <div>
                  <span className="text-slate-500 block text-[11px]">Serial Number:</span>
                  <span className="font-mono text-slate-800">{activeNode.serialNumber}</span>
                </div>
              )}

              {'calValidityEnd' in activeNode && (
                <div>
                  <span className="text-slate-500 block text-[11px]">Recorded Validity End Date:</span>
                  <span className="font-mono font-bold text-rose-700">{activeNode.calValidityEnd}</span>
                </div>
              )}

              {'standards' in activeNode && (
                <div>
                  <span className="text-slate-500 block text-[11px]">Applicable Standards:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeNode.standards.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {'notes' in activeNode && (
                <div>
                  <span className="text-slate-500 block text-[11px]">Technical Notes:</span>
                  <p className="text-slate-600 leading-relaxed mt-0.5">{activeNode.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 p-5 rounded-b-lg">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Architectural Principle</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-normal">
              An expired calibration record marks the instrument invalid for new tests, but does not retrospectively invalidate
              historical tests performed while calibration was in force.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
