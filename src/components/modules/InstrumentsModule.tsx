import React, { useState } from 'react';
import { Wrench, Plus, Search, Calendar, FileText, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { repo } from '../../services/storageRepository';
import { Instrument } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface InstrumentsModuleProps {
  onNavigateToCalibrations?: (instId: string) => void;
}

export const InstrumentsModule: React.FC<InstrumentsModuleProps> = ({ onNavigateToCalibrations }) => {
  const state = repo.getState();
  const instruments = state.instruments;
  const assessmentDate = state.assessmentDate;

  const [selectedInst, setSelectedInst] = useState<Instrument | null>(instruments[0] || null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New instrument form
  const [newInstId, setNewInstId] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Digital Multimeter');
  const [newMfr, setNewMfr] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newSerial, setNewSerial] = useState('');
  const [newLoc, setNewLoc] = useState('Electronics Quality Lab');
  const [newInterval, setNewInterval] = useState(12);

  const filtered = instruments.filter(
    (i) =>
      i.instrumentId.toLowerCase().includes(search.toLowerCase()) ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.serialNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInstId && newName && newSerial) {
      const created = repo.addInstrument({
        instrumentId: newInstId.toUpperCase(),
        name: newName,
        instrumentType: newType,
        manufacturer: newMfr || 'Standard Instruments',
        model: newModel || 'Model-X',
        serialNumber: newSerial,
        factoryId: state.organisation.factories[0].id,
        laboratoryLocation: newLoc,
        responsibleDepartment: 'Metrology & Instrument Maintenance',
        calibrationIntervalMonths: Number(newInterval),
        currentStatus: 'Active',
      });
      setSelectedInst(created);
      setModalOpen(false);
      setNewInstId('');
      setNewName('');
      setNewSerial('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-sky-700" />
            <h2 className="text-xl font-bold text-slate-900">Equipment & Instrument Master Register</h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Certified measurement equipment, serial tracking, laboratories, and active calibration intervals.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-2 rounded text-xs font-semibold bg-[#0b2545] hover:bg-sky-900 text-white flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Instrument</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search instruments by ID (e.g. DMM-104), serial number, or manufacturer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-600"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Instrument List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Registered Instruments ({filtered.length})</span>
            <span className="text-[11px] font-mono text-slate-500">Benchmark: {assessmentDate}</span>
          </div>

          {filtered.map((inst) => {
            const isSelected = selectedInst?.id === inst.id;
            const cal = state.calibrations.find(
              (c) => c.instrumentId === inst.id || c.instrumentId === inst.instrumentId
            );
            const isExpired = cal && cal.validityEndDate < assessmentDate;

            return (
              <div
                key={inst.id}
                onClick={() => setSelectedInst(inst)}
                className={`p-4 transition-colors cursor-pointer ${
                  isSelected ? 'bg-sky-50 border-l-4 border-l-[#0b2545]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-200/80 px-1.5 py-0.5 rounded">
                        {inst.instrumentId}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">SN: {inst.serialNumber}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{inst.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{inst.manufacturer} • {inst.model}</p>
                  </div>
                  <StatusBadge status={isExpired ? 'Calibration Expired' : inst.currentStatus} size="sm" />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Cal End: {cal?.validityEndDate || 'NO RECORD'}</span>
                  {isExpired && <span className="text-rose-700 font-bold">Past Due</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Instrument Detail (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-5">
          {selectedInst ? (
            <>
              {(() => {
                const cal = state.calibrations.find(
                  (c) => c.instrumentId === selectedInst.id || c.instrumentId === selectedInst.instrumentId
                );
                const isExpired = cal && cal.validityEndDate < assessmentDate;
                const daysDiff = cal
                  ? Math.floor(
                      (new Date(assessmentDate).getTime() - new Date(cal.validityEndDate).getTime()) /
                        (1000 * 3600 * 24)
                    )
                  : null;

                return (
                  <>
                    <div className="pb-3 border-b border-slate-200 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#0b2545] text-white">
                            {selectedInst.instrumentId}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">SN: {selectedInst.serialNumber}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{selectedInst.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{selectedInst.instrumentType}</p>
                      </div>
                      <StatusBadge status={isExpired ? 'Calibration Expired' : selectedInst.currentStatus} />
                    </div>

                    {/* Expiry Warning Callout if Expired */}
                    {isExpired && (
                      <div className="p-3 bg-rose-50 border border-rose-300 rounded text-xs text-rose-900 flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Calibration Period Elapsed: </span>
                          <span>
                            Recorded validity ended on <strong>{cal?.validityEndDate}</strong> ({daysDiff} days past validity as of benchmark date {assessmentDate}).
                            New quality inspections using this instrument are blocked by deterministic rule CAL-002.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Specification Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded border border-slate-200">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Manufacturer:</span>
                        <span className="font-semibold text-slate-900">{selectedInst.manufacturer}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Model Number:</span>
                        <span className="font-semibold text-slate-900">{selectedInst.model}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Laboratory Location:</span>
                        <span className="text-slate-900">{selectedInst.laboratoryLocation}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Calibration Interval:</span>
                        <span className="font-mono text-slate-900">{selectedInst.calibrationIntervalMonths} Months</span>
                      </div>
                    </div>

                    {/* Calibration Certificate Details */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Active Calibration Certificate Record
                      </h4>
                      {cal ? (
                        <div className="p-3.5 rounded border border-slate-200 bg-white space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-900">{cal.certificateNumber}</span>
                            <StatusBadge status={cal.verificationState} size="sm" />
                          </div>
                          <div className="text-[11px] text-slate-600">
                            Provider: <strong>{cal.calibrationProvider}</strong>
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 pt-1 border-t border-slate-100">
                            <span>Calibrated: {cal.calibrationDate}</span>
                            <span className={isExpired ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                              Validity End: {cal.validityEndDate}
                            </span>
                          </div>
                          {cal.notes && (
                            <div className="text-[11px] text-slate-500 italic pt-1">
                              Note: {cal.notes}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 rounded border border-amber-300 bg-amber-50 text-xs text-amber-900 flex items-center justify-between">
                          <span>No calibration record registered for this instrument. (Triggered rule CAL-001).</span>
                        </div>
                      )}
                    </div>

                    {/* Quality Tests Linked to This Instrument */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Quality Tests Using This Instrument
                      </h4>
                      <div className="space-y-1.5">
                        {state.tests
                          .filter((t) => t.instrumentId === selectedInst.id || t.instrumentId === selectedInst.instrumentId)
                          .map((test) => (
                            <div
                              key={test.id}
                              className="p-2.5 rounded border border-slate-200 bg-white flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-mono font-bold text-slate-900">{test.testId}</span>
                                <span className="text-slate-600 ml-2">Batch {test.batchId} ({test.testDate})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] text-emerald-700 font-semibold">{test.testResult}</span>
                                <StatusBadge status={test.reviewStatus} size="sm" />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </>
          ) : (
            <div className="text-center text-slate-500 py-12 text-xs">
              Select an instrument to view calibration parameters.
            </div>
          )}
        </div>
      </div>

      {/* Add Instrument Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">Add Instrument to Register</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Instrument ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DMM-105"
                    value={newInstId}
                    onChange={(e) => setNewInstId(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Serial Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SN-105D"
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instrument Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Precision True-RMS Multimeter"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. Fluke"
                    value={newMfr}
                    onChange={(e) => setNewMfr(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Model</label>
                  <input
                    type="text"
                    placeholder="e.g. 87V"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Laboratory Location</label>
                  <input
                    type="text"
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Interval (Months)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={newInterval}
                    onChange={(e) => setNewInterval(Number(e.target.value))}
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
                  Save Instrument
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
