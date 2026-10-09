import React, { useState } from 'react';
import { FlaskConical, Plus, Search, Calendar, FileText, AlertTriangle, CheckCircle2, X, ArrowRight } from 'lucide-react';
import { repo } from '../../services/storageRepository';
import { QualityTest } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface QualityTestsModuleProps {
  onNavigateToDependency?: () => void;
}

export const QualityTestsModule: React.FC<QualityTestsModuleProps> = ({ onNavigateToDependency }) => {
  const state = repo.getState();
  const tests = state.tests;
  const assessmentDate = state.assessmentDate;

  const [selectedTest, setSelectedTest] = useState<QualityTest | null>(tests[1] || tests[0] || null); // default to T-002 to showcase condition
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New test form
  const [newTestId, setNewTestId] = useState('');
  const [productId, setProductId] = useState(state.products[0]?.id || '');
  const [batchId, setBatchId] = useState(state.batches[0]?.id || '');
  const [testType, setTestType] = useState('Output Voltage Regulation');
  const [testDate, setTestDate] = useState('2026-10-06');
  const [result, setResult] = useState<'Pass' | 'Fail' | 'Conditional'>('Pass');
  const [criteria, setCriteria] = useState('Voltage: 12.0V ± 0.3V; Ripple < 120mV');
  const [instrumentId, setInstrumentId] = useState(state.instruments[0]?.id || '');
  const [operator, setOperator] = useState('Ramesh K.');

  const filtered = tests.filter(
    (t) =>
      t.testId.toLowerCase().includes(search.toLowerCase()) ||
      t.testType.toLowerCase().includes(search.toLowerCase()) ||
      t.batchId.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTestId) {
      const created = repo.addTest({
        testId: newTestId.toUpperCase(),
        productId,
        batchId,
        testType,
        testDate,
        testResult: result,
        acceptanceCriteria: criteria,
        instrumentId,
        operatorName: operator,
        reviewStatus: 'Pending',
      });
      setSelectedTest(created);
      setModalOpen(false);
      setNewTestId('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-sky-700" />
            <h2 className="text-xl font-bold text-slate-900">Quality Tests & In-Line Inspection Records</h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Production test logs, instrument calibration interval validation, and operator verification.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-2 rounded text-xs font-semibold bg-[#0b2545] hover:bg-sky-900 text-white flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Test</span>
        </button>
      </div>

      {/* Flagship Notice on T-001 vs T-002 */}
      <div className="bg-sky-50/70 border border-sky-300 rounded-lg p-4 text-xs text-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sky-950">Deterministic Traceability in Practice: </span>
              <span>
                Both <strong>T-001</strong> and <strong>T-002</strong> used instrument <strong>DMM-104</strong> (whose calibration expired on 2026-10-01).
                Because <strong>T-001</strong> was executed on <strong>2026-09-20</strong> (inside validity), it remains <em>valid</em>.
                Only <strong>T-002</strong> (executed <strong>2026-10-05</strong>) is flagged for review.
              </span>
            </div>
          </div>
          {onNavigateToDependency && (
            <button
              onClick={onNavigateToDependency}
              className="font-bold text-sky-800 hover:text-sky-950 underline shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <span>View in Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search test ID (e.g. T-002), batch number, or test type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-600"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Test List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Recorded Tests ({filtered.length})</span>
            <span className="text-[11px] font-mono text-slate-500">Benchmark: {assessmentDate}</span>
          </div>

          {filtered.map((test) => {
            const isSelected = selectedTest?.id === test.id;
            const inst = state.instruments.find(
              (i) => i.id === test.instrumentId || i.instrumentId === test.instrumentId
            );
            const cal = state.calibrations.find(
              (c) => c.instrumentId === inst?.id || c.instrumentId === inst?.instrumentId
            );
            const isOutOfCal = cal && cal.validityEndDate && test.testDate > cal.validityEndDate;

            return (
              <div
                key={test.id}
                onClick={() => setSelectedTest(test)}
                className={`p-4 transition-colors cursor-pointer ${
                  isSelected ? 'bg-sky-50 border-l-4 border-l-[#0b2545]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-200/80 px-1.5 py-0.5 rounded">
                        {test.testId}
                      </span>
                      <span className="text-[11px] font-mono text-slate-600">Batch {test.batchId}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{test.testType}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Instrument: {inst?.instrumentId || test.instrumentId} • Test Date: {test.testDate}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={test.testResult} size="sm" />
                    {isOutOfCal && <StatusBadge status="CAL-003 Issue" size="sm" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Test Details (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-5">
          {selectedTest ? (
            <>
              {(() => {
                const inst = state.instruments.find(
                  (i) => i.id === selectedTest.instrumentId || i.instrumentId === selectedTest.instrumentId
                );
                const cal = state.calibrations.find(
                  (c) => c.instrumentId === inst?.id || c.instrumentId === inst?.instrumentId
                );
                const isOutOfCal = cal && cal.validityEndDate && selectedTest.testDate > cal.validityEndDate;
                const doc = state.documents.find((d) => d.id === selectedTest.supportingDocumentId);

                return (
                  <>
                    <div className="pb-3 border-b border-slate-200 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#0b2545] text-white">
                            {selectedTest.testId}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            Product: {selectedTest.productId} | Batch: {selectedTest.batchId}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{selectedTest.testType}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Tested by: {selectedTest.operatorName}</p>
                      </div>
                      <StatusBadge status={isOutOfCal ? 'Review Required' : selectedTest.reviewStatus} />
                    </div>

                    {/* Boundary Alert if Test was after Cal validity */}
                    {isOutOfCal && (
                      <div className="p-3 bg-rose-50 border border-rose-300 rounded text-xs text-rose-900 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>Out-of-Interval Execution Anomaly (Rule CAL-003):</span>
                        </div>
                        <p className="leading-relaxed">
                          Test executed on <strong>{selectedTest.testDate}</strong>, whereas instrument{' '}
                          <strong>{inst?.instrumentId}</strong> calibration expired on <strong>{cal?.validityEndDate}</strong>.
                          Requires authorized engineering review and secondary sample verification.
                        </p>
                      </div>
                    )}

                    {!isOutOfCal && cal && (
                      <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          Calibration valid at time of test: Conducted on <strong>{selectedTest.testDate}</strong> within instrument validity window (Ended {cal.validityEndDate}).
                        </span>
                      </div>
                    )}

                    {/* Criteria & Results */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded border border-slate-200">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Execution Test Date:</span>
                        <span className="font-mono font-bold text-slate-900">{selectedTest.testDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Recorded Result:</span>
                        <span className="font-bold text-emerald-700">{selectedTest.testResult}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block text-[11px]">Recorded Acceptance Criteria:</span>
                        <span className="font-mono text-slate-900">{selectedTest.acceptanceCriteria}</span>
                      </div>
                    </div>

                    {/* Instrument Trace Link */}
                    <div className="p-3 rounded border border-slate-200 bg-white space-y-1.5 text-xs">
                      <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                        Linked Measurement Instrument
                      </span>
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-900">
                          {inst?.instrumentId} — {inst?.name} (SN: {inst?.serialNumber})
                        </div>
                        <StatusBadge status={inst?.currentStatus || 'Active'} size="sm" />
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Lab: {inst?.laboratoryLocation} • Last Cal: {inst?.lastCalibrationDate} • Cal End: {inst?.calibrationValidityEndDate}
                      </div>
                    </div>

                    {/* Supporting Evidence File */}
                    {doc && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                          Supporting Lab Test Sheet
                        </h4>
                        <div className="p-3 rounded border border-slate-200 bg-white flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-rose-600" />
                            <div>
                              <div className="font-semibold text-slate-900">{doc.title}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{doc.originalFilename}</div>
                            </div>
                          </div>
                          <StatusBadge status={doc.verificationState} size="sm" />
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          ) : (
            <div className="text-center text-slate-500 py-12 text-xs">
              Select a quality test to inspect parameters.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">Record New Quality Test</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Test ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. T-005"
                    value={newTestId}
                    onChange={(e) => setNewTestId(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Test Date *</label>
                  <input
                    type="date"
                    required
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product</label>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300 bg-white"
                  >
                    {state.products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.productCode} — {p.productName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch</label>
                  <select
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300 bg-white"
                  >
                    {state.batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batchNumber} ({b.quantity} pcs)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instrument Used *</label>
                <select
                  value={instrumentId}
                  onChange={(e) => setInstrumentId(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300 bg-white"
                >
                  {state.instruments.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.instrumentId} — {i.name} (SN: {i.serialNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Test Type *</label>
                <input
                  type="text"
                  required
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Acceptance Criteria</label>
                <input
                  type="text"
                  value={criteria}
                  onChange={(e) => setCriteria(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300"
                />
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
                  Save Quality Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
