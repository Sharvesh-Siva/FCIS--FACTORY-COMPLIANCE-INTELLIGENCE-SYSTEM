import React, { useState } from 'react';
import { FileCheck2, Plus, Search, Calendar, FileText, AlertTriangle, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { repo } from '../../services/storageRepository';
import { CalibrationRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const CalibrationsModule: React.FC = () => {
  const state = repo.getState();
  const calibrations = state.calibrations;
  const assessmentDate = state.assessmentDate;

  const [selectedCal, setSelectedCal] = useState<CalibrationRecord | null>(calibrations[0] || null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  // New calibration form
  const [instRef, setInstRef] = useState(state.instruments[0]?.id || '');
  const [recordId, setRecordId] = useState('');
  const [certNum, setCertNum] = useState('');
  const [provider, setProvider] = useState('Apex Precision Metrology Labs (NABL CC-2194)');
  const [calDate, setCalDate] = useState('2026-10-08');
  const [validEnd, setValidEnd] = useState('2027-10-07');
  const [notes, setNotes] = useState('');

  const filtered = calibrations.filter((c) => {
    const isExpired = c.validityEndDate < assessmentDate;
    const matchesSearch =
      c.certificateNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.recordId.toLowerCase().includes(search.toLowerCase()) ||
      c.calibrationProvider.toLowerCase().includes(search.toLowerCase());

    if (filter === 'expired') return matchesSearch && isExpired;
    if (filter === 'valid') return matchesSearch && !isExpired;
    return matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (certNum && calDate && validEnd) {
      const created = repo.addCalibration({
        recordId: recordId || `CAL-CERT-${Date.now().toString().slice(-4)}`,
        instrumentId: instRef,
        certificateNumber: certNum,
        calibrationProvider: provider,
        calibrationDate: calDate,
        validityEndDate: validEnd,
        result: 'Pass / Within Tolerance',
        verificationState: 'Verified',
        validityRuleSource: 'Annual Metrology Schedule (12 Months)',
        notes: notes || 'Calibrated under NABL accredited standard.',
      });
      setSelectedCal(created);
      setModalOpen(false);
      setCertNum('');
      setRecordId('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-sky-700" />
            <h2 className="text-xl font-bold text-slate-900">Calibration Certificate Register</h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            NABL-accredited metrology certificates, validity intervals, and document verification states.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-2 rounded text-xs font-semibold bg-[#0b2545] hover:bg-sky-900 text-white flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Calibration</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search certificate number, record ID, or provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-600"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Status Filter:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 text-slate-800"
          >
            <option value="all">All Records</option>
            <option value="valid">Valid Records</option>
            <option value="expired">Expired Records</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calibrations List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Certificates ({filtered.length})</span>
            <span className="text-[11px] font-mono text-slate-500">Benchmark: {assessmentDate}</span>
          </div>

          {filtered.map((cal) => {
            const isSelected = selectedCal?.id === cal.id;
            const isExpired = cal.validityEndDate < assessmentDate;
            const inst = state.instruments.find(
              (i) => i.id === cal.instrumentId || i.instrumentId === cal.instrumentId
            );

            return (
              <div
                key={cal.id}
                onClick={() => setSelectedCal(cal)}
                className={`p-4 transition-colors cursor-pointer ${
                  isSelected ? 'bg-sky-50 border-l-4 border-l-[#0b2545]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-200/80 px-1.5 py-0.5 rounded">
                        {cal.recordId}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">{inst?.instrumentId || cal.instrumentId}</span>
                    </div>
                    <h4 className="text-xs font-mono font-bold text-slate-900 mt-1">{cal.certificateNumber}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{cal.calibrationProvider}</p>
                  </div>
                  <StatusBadge status={isExpired ? 'Expired' : 'Valid'} size="sm" />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">End: {cal.validityEndDate}</span>
                  <StatusBadge status={cal.verificationState} size="sm" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Calibration Details (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-5">
          {selectedCal ? (
            <>
              {(() => {
                const isExpired = selectedCal.validityEndDate < assessmentDate;
                const inst = state.instruments.find(
                  (i) => i.id === selectedCal.instrumentId || i.instrumentId === selectedCal.instrumentId
                );
                const doc = state.documents.find((d) => d.id === selectedCal.documentId);

                return (
                  <>
                    <div className="pb-3 border-b border-slate-200 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#0b2545] text-white">
                            {selectedCal.recordId}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            Instrument: {inst?.instrumentId || selectedCal.instrumentId}
                          </span>
                        </div>
                        <h3 className="text-base font-bold font-mono text-slate-900 mt-1">
                          {selectedCal.certificateNumber}
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5">{selectedCal.calibrationProvider}</p>
                      </div>
                      <StatusBadge status={isExpired ? 'Calibration Expired' : 'Valid Certificate'} />
                    </div>

                    {/* Expiry alert */}
                    {isExpired && (
                      <div className="p-3 bg-rose-50 border border-rose-300 rounded text-xs text-rose-900">
                        <strong className="block mb-0.5">Validity Expired:</strong>
                        Certificate validity concluded on <strong>{selectedCal.validityEndDate}</strong>. Current assessment date is <strong>{assessmentDate}</strong>.
                      </div>
                    )}

                    {/* Technical details */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded border border-slate-200">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Calibration Execution Date:</span>
                        <span className="font-mono font-bold text-slate-900">{selectedCal.calibrationDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Recorded Validity End Date:</span>
                        <span className={`font-mono font-bold ${isExpired ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {selectedCal.validityEndDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Verification State:</span>
                        <StatusBadge status={selectedCal.verificationState} size="sm" />
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Laboratory Accreditation:</span>
                        <span className="text-slate-900 font-medium">{selectedCal.accreditationDetails || 'NABL Accredited'}</span>
                      </div>
                    </div>

                    {/* Supporting Evidence File */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Attached Evidence Document
                      </h4>
                      {doc ? (
                        <div className="p-3 rounded border border-slate-200 bg-white flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-5 h-5 text-rose-600" />
                            <div>
                              <div className="font-semibold text-slate-900">{doc.title}</div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {doc.originalFilename} ({doc.fileSizeKb} KB)
                              </div>
                            </div>
                          </div>
                          <StatusBadge status={doc.verificationState} size="sm" />
                        </div>
                      ) : (
                        <div className="p-3 rounded border border-slate-200 text-xs text-slate-500">
                          Digital PDF archive link registered (ApexLabs_NABL_CC_0110.pdf)
                        </div>
                      )}
                    </div>

                    {/* Validity Source Note */}
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
                      <span className="font-bold text-slate-800 block mb-1">Source of Validity Requirement:</span>
                      <p>{selectedCal.validityRuleSource}</p>
                    </div>
                  </>
                );
              })()}
            </>
          ) : (
            <div className="text-center text-slate-500 py-12 text-xs">
              Select a calibration certificate to inspect validity.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">Record New Calibration Certificate</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Instrument *</label>
                <select
                  value={instRef}
                  onChange={(e) => setInstRef(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300 bg-white"
                >
                  {state.instruments.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.instrumentId} — {i.name} (SN: {i.serialNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Record ID</label>
                  <input
                    type="text"
                    placeholder="e.g. CAL-CERT-04"
                    value={recordId}
                    onChange={(e) => setRecordId(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Certificate Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NABL/CC/2026/1008-DMM"
                    value={certNum}
                    onChange={(e) => setCertNum(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Calibration Laboratory *</label>
                <input
                  type="text"
                  required
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Calibration Date *</label>
                  <input
                    type="date"
                    required
                    value={calDate}
                    onChange={(e) => setCalDate(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Validity End Date *</label>
                  <input
                    type="date"
                    required
                    value={validEnd}
                    onChange={(e) => setValidEnd(e.target.value)}
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
                  Save Calibration Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
