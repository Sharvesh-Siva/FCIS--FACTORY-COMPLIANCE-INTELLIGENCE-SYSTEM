import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Building,
  ShieldCheck,
  Download,
  Info,
  SlidersHorizontal,
  HelpCircle,
  Hash,
} from 'lucide-react';
import { repo } from '../../services/storageRepository';
import { StatusBadge } from '../common/StatusBadge';

export const ReadinessReportsModule: React.FC = () => {
  const state = repo.getState();
  const findings = repo.getFindings();
  const assessmentDate = state.assessmentDate;
  const activeUser = repo.getActiveUser();

  const [selectedProductScope, setSelectedProductScope] = useState<string>('all');
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [includeFindingsTable, setIncludeFindingsTable] = useState(true);
  const [showPrintTips, setShowPrintTips] = useState(false);

  // Filter scoped entities based on selected product scope
  const scopedProducts = selectedProductScope === 'all'
    ? state.products
    : state.products.filter((p) => p.id === selectedProductScope);

  const scopedProduct = selectedProductScope === 'all'
    ? null
    : state.products.find((p) => p.id === selectedProductScope);

  const scopedTests = selectedProductScope === 'all'
    ? state.tests
    : state.tests.filter((t) => t.productId === selectedProductScope);

  const scopedInstrumentIds = new Set(
    selectedProductScope === 'all'
      ? state.instruments.map((i) => i.id)
      : scopedTests.map((t) => t.instrumentId)
  );

  const scopedInstruments = state.instruments.filter(
    (i) => scopedInstrumentIds.has(i.id) || scopedInstrumentIds.has(i.instrumentId)
  );

  const scopedFindings = findings.filter((f) => {
    if (f.status === 'Dismissed') return false;
    if (selectedProductScope === 'all') return true;

    // Direct product finding
    if (f.triggeringRecordId === selectedProductScope || f.relatedRecordId === selectedProductScope) return true;

    // Test finding for this product
    const matchingTest = scopedTests.find((t) => t.id === f.triggeringRecordId || t.testId === f.triggeringRecordId);
    if (matchingTest) return true;

    // Instrument finding linked to this product's test instruments
    const matchingInst = scopedInstruments.find(
      (i) => i.id === f.triggeringRecordId || i.instrumentId === f.triggeringRecordId || i.id === f.relatedRecordId || i.instrumentId === f.relatedRecordId
    );
    if (matchingInst) return true;

    return false;
  });

  // Derived readiness score for scoped records
  const criticalCount = scopedFindings.filter((f) => f.priority === 'Critical').length;
  const highCount = scopedFindings.filter((f) => f.priority === 'High').length;

  // Calculation: Base 100 - (critical * 25) - (high * 10)
  const score = Math.max(0, 100 - criticalCount * 25 - highCount * 10);
  const overallStatus =
    criticalCount > 0
      ? 'Remediation Required (Critical Issues Detected)'
      : highCount > 0
      ? 'Conditional Readiness (Action Required)'
      : 'Ready for External Quality Audit';

  const handlePrint = () => {
    // Triggers standard system print dialog (Destination: Save as PDF)
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar (Hidden in Print) */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-700" />
            <h2 className="text-xl font-bold text-slate-900">Standards Readiness & Compliance Dossier</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              PDF Export Ready
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Assembles factory products, equipment calibration records, in-line test sheets, and findings into a standardized audit document.
          </p>
        </div>

        {/* Primary 'Print Report' Utility Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowPrintTips(!showPrintTips)}
            className="px-3 py-2 rounded text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="PDF Export Configuration Tips"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>PDF Print Guide</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded text-xs font-bold bg-[#0b2545] hover:bg-sky-900 text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer ring-2 ring-amber-400/60"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Report (Save as PDF)</span>
          </button>
        </div>
      </div>

      {/* 2. PDF Print Options & Quick Guide (Hidden in Print) */}
      {showPrintTips && (
        <div className="bg-sky-50 border border-sky-300 rounded-lg p-4 text-xs text-sky-950 space-y-2 print:hidden animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-sky-900">
            <SlidersHorizontal className="w-4 h-4 text-sky-700" />
            <span>Recommended Browser Print Settings for Standardized PDF Export:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1 leading-relaxed">
            <li><strong>Destination:</strong> Select <em>"Save as PDF"</em> in your browser print prompt.</li>
            <li><strong>Paper Size:</strong> <em>A4</em> or <em>Letter</em> (CSS media queries format margins to exact 14mm standard).</li>
            <li><strong>Background Graphics:</strong> Ensure <em>"Background graphics"</em> is checked to preserve status badges and alert colors.</li>
            <li><strong>Headers & Footers:</strong> Uncheck default browser headers/footers so the report's official reference header displays cleanly.</li>
          </ul>
        </div>
      )}

      {/* 3. Scope Selector & Filter Bar (Hidden in Print) */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Scope Filter:</span>
            <select
              value={selectedProductScope}
              onChange={(e) => setSelectedProductScope(e.target.value)}
              className="border border-slate-300 rounded px-3 py-1.5 bg-slate-50 text-slate-800"
            >
              <option value="all">All Registered Models (Full Factory Unit 1 Scope)</option>
              {state.products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productCode} — {p.productName}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSignatures}
              onChange={(e) => setIncludeSignatures(e.target.checked)}
              className="rounded text-sky-600"
            />
            <span>Include Sign-Off Blocks</span>
          </label>

          <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={includeFindingsTable}
              onChange={(e) => setIncludeFindingsTable(e.target.checked)}
              className="rounded text-sky-600"
            />
            <span>Include Detailed Rule Findings</span>
          </label>
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          Assessment Date: <strong className="text-slate-900">{assessmentDate}</strong> | Reviewer: <strong className="text-slate-900">{activeUser.name}</strong>
        </div>
      </div>

      {/* 4. Formal Printable Readiness Report Document */}
      <div className="readiness-report-container bg-white rounded-lg border border-slate-300 shadow-md p-8 md:p-12 space-y-8">
        {/* Document Header with National Standard Style */}
        <div className="border-b-2 border-slate-900 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-[#0b2545] text-white flex items-center justify-center font-bold text-sm">
                  FCIS
                </span>
                <span className="font-bold text-xs uppercase tracking-widest text-slate-500">
                  Industrial Quality System Record
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-950 mt-2">
                Factory Compliance & Standards Readiness Assessment Report
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Electronics Manufacturing Traceability Dossier under IS 13252 (Part 1):2010 / IEC 60950-1
              </p>
            </div>

            <div className="text-right text-xs space-y-1 font-mono shrink-0">
              <div>Report Ref: <strong>RPT-2026-10-09-01</strong></div>
              <div>Assessment Date: <strong>{assessmentDate}</strong></div>
              <div className="text-[10px] text-slate-500">Classification: Controlled Internal Record</div>
              <div className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 inline-block mt-1">
                E-SIGNATURE READY
              </div>
            </div>
          </div>
        </div>

        {/* Organisation & Scope Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded bg-slate-50 border border-slate-200 text-xs avoid-page-break">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Organisation</span>
            <span className="font-bold text-slate-900">{state.organisation.name}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Manufacturing Complex</span>
            <span className="text-slate-900 font-semibold">{state.organisation.factories[0].name}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Authorised Reviewer</span>
            <span className="text-slate-900 font-semibold">{activeUser.name} ({activeUser.role.replace('_', ' ')})</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Report Status</span>
            <StatusBadge status={criticalCount > 0 ? 'Critical Findings' : 'Ready'} size="sm" />
          </div>
        </div>

        {/* Executive Readiness Score & Summary */}
        <div className="p-5 rounded-lg border-2 border-slate-300 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6 avoid-page-break">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Readiness Determination
            </span>
            <h3 className="text-lg font-bold text-slate-900">{overallStatus}</h3>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              Deterministic evaluation against benchmark date <strong>{assessmentDate}</strong>.
              All active product models, measurement instruments, calibration certificates, and in-line tests were reviewed.
            </p>
          </div>

          <div className="text-center p-4 rounded-lg bg-white border border-slate-300 shadow-2xs shrink-0 min-w-[140px]">
            <div className="text-3xl font-black text-slate-900 font-mono">{score}%</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
              Readiness Index
            </div>
          </div>
        </div>

        {/* Section 1: Record Coverage Summary */}
        <div className="space-y-3 avoid-page-break">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              1. Scoped Master Records & Inventory
            </h3>
            {scopedProduct && (
              <span className="text-xs font-mono font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                Filtered: {scopedProduct.productCode}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 border rounded bg-white">
              <span className="text-slate-500 block text-[11px]">Products Reviewed</span>
              <span className="text-base font-bold text-slate-900">{scopedProducts.length} Models</span>
            </div>
            <div className="p-3 border rounded bg-white">
              <span className="text-slate-500 block text-[11px]">Measurement Instruments</span>
              <span className="text-base font-bold text-slate-900">{scopedInstruments.length} Assets</span>
            </div>
            <div className="p-3 border rounded bg-white">
              <span className="text-slate-500 block text-[11px]">Calibration Records</span>
              <span className="text-base font-bold text-slate-900">{state.calibrations.length} Certificates</span>
            </div>
            <div className="p-3 border rounded bg-white">
              <span className="text-slate-500 block text-[11px]">Quality Tests Evaluated</span>
              <span className="text-base font-bold text-slate-900">{scopedTests.length} Test Sheets</span>
            </div>
          </div>
        </div>

        {/* Section 2: Deterministic Compliance Findings */}
        {includeFindingsTable && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                2. Detailed Finding Explanations & Evidence References
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {scopedFindings.length} Scoped Findings
              </span>
            </div>

            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Rule ID</th>
                    <th className="p-2.5">Finding Title</th>
                    <th className="p-2.5">Priority</th>
                    <th className="p-2.5">Trigger Entity</th>
                    <th className="p-2.5">Action Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {scopedFindings.length > 0 ? (
                    scopedFindings.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono font-bold">{f.ruleId}</td>
                        <td className="p-2.5">
                          <div className="font-semibold text-slate-900">{f.title}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-2">{f.explanation}</div>
                        </td>
                        <td className="p-2.5"><StatusBadge status={f.priority} size="sm" /></td>
                        <td className="p-2.5 font-mono text-[11px]">{f.triggeringRecordLabel}</td>
                        <td className="p-2.5"><StatusBadge status={f.status} size="sm" /></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500 text-xs italic">
                        No outstanding compliance findings detected for this selected product scope.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 3: High Priority Remediations (T-002, CAPA-2026-001) */}
        <div className="space-y-3 avoid-page-break">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            3. Required Engineering Remediation Steps
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-300 rounded text-rose-950">
              <span className="font-bold block">1. Batch B-025 Quarantine & Secondary Testing:</span>
              <span>
                Test T-002 was conducted using DMM-104 after its calibration validity ended on 2026-10-01.
                Batch B-025 must remain quarantined pending emergency calibration and confirmatory measurement.
              </span>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-300 rounded text-amber-950">
              <span className="font-bold block">2. Resolution of Overdue CAPA-2026-001:</span>
              <span>
                Due date was 2026-10-03 (overdue as of 2026-10-09). Lead metrology engineer Amit Patel must upload vendor calibration report.
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Institutional Sign-Off Box */}
        {includeSignatures && (
          <div className="pt-6 border-t-2 border-slate-300 avoid-page-break">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-slate-700">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-4">
                  Quality Systems Engineer
                </span>
                <div className="border-b border-slate-400 pb-1 font-semibold text-slate-900">
                  Sharvesh S.
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Date: {assessmentDate}</div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-4">
                  Regulatory Affairs & Compliance
                </span>
                <div className="border-b border-slate-400 pb-1 font-semibold text-slate-900">
                  Dr. Meenakshi Rao
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Date: {assessmentDate}</div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-4">
                  Plant Head / Operations Sign-off
                </span>
                <div className="border-b border-slate-400 pb-1 font-semibold text-slate-900">
                  Rajesh Sharma
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Date: {assessmentDate}</div>
              </div>
            </div>

            <div className="mt-8 p-3 bg-slate-100 rounded text-[11px] text-slate-500 text-center">
              <strong>Institutional Safeguard Notice:</strong> This document is an internal decision-support readiness summary generated by FCIS.
              It does not constitute official certification or an endorsement from the Bureau of Indian Standards (BIS).
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
