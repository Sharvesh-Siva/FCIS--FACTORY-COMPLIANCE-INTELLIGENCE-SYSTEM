import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Eye,
  X,
  FileCheck,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { repo } from '../../services/storageRepository';
import { EvidenceDocument, DocumentCategory, DocumentVerificationState } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const DocumentsModule: React.FC = () => {
  const state = repo.getState();
  const documents = state.documents;
  const activeUser = repo.getActiveUser();

  const [selectedDoc, setSelectedDoc] = useState<EvidenceDocument | null>(documents[0] || null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [verifyNotes, setVerifyNotes] = useState('');

  // New document form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DocumentCategory>('Calibration Certificate');
  const [newFilename, setNewFilename] = useState('');

  const filtered = documents.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.docIdentifier.toLowerCase().includes(search.toLowerCase()) ||
      d.originalFilename.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || d.category === categoryFilter;
    const matchesVerif = verificationFilter === 'all' || d.verificationState === verificationFilter;

    return matchesSearch && matchesCategory && matchesVerif;
  });

  const handleSimulateGeminiExtraction = () => {
    if (!selectedDoc) return;
    setIsExtracting(true);
    setTimeout(() => {
      setIsExtracting(false);
      // simulate extraction
      alert(`Gemini AI Assistant processed "${selectedDoc.originalFilename}". Extracted candidate fields with 96% confidence score. Human sign-off is required.`);
    }, 1200);
  };

  const handleVerify = (status: DocumentVerificationState) => {
    if (!selectedDoc) return;
    repo.verifyDocument(selectedDoc.id, status, verifyNotes || undefined);
    setVerifyNotes('');
    const updated = repo.getDocuments().find((d) => d.id === selectedDoc.id);
    if (updated) setSelectedDoc(updated);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle && newFilename) {
      const created = repo.addDocument({
        docIdentifier: `DOC-${Date.now().toString().slice(-4)}`,
        title: newTitle,
        originalFilename: newFilename,
        fileSizeKb: Math.floor(Math.random() * 800) + 200,
        fileType: 'application/pdf',
        category: newCategory,
        linkedEntityType: 'instrument',
        linkedEntityId: state.instruments[0].id,
        uploadedBy: activeUser.name,
        verificationState: 'Needs Human Verification',
        extractedMetadata: {
          confidenceScore: 0.92,
          extractedAt: new Date().toISOString(),
        },
      });
      setSelectedDoc(created);
      setUploadModalOpen(false);
      setNewTitle('');
      setNewFilename('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-700" />
            <h2 className="text-xl font-bold text-slate-900">Documents & Evidence Repository</h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Certified calibration certificates, laboratory test sheets, BIS CRS licences, and raw records.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-3.5 py-2 rounded text-xs font-semibold bg-[#0b2545] hover:bg-sky-900 text-white flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Evidence File</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search document title, identifier, or filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 text-slate-800"
          >
            <option value="all">All Categories</option>
            <option value="Calibration Certificate">Calibration Certificate</option>
            <option value="Test Report">Test Report</option>
            <option value="BIS Licence / Certificate">BIS Licence / Certificate</option>
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 text-slate-800"
          >
            <option value="all">All Verification States</option>
            <option value="Verified">Verified</option>
            <option value="Needs Human Verification">Needs Human Verification</option>
            <option value="Not Reviewed">Not Reviewed</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Evidence Files ({filtered.length})</span>
            <span className="text-[11px] text-slate-500">Repository</span>
          </div>

          {filtered.map((doc) => {
            const isSelected = selectedDoc?.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-4 transition-colors cursor-pointer ${
                  isSelected ? 'bg-sky-50 border-l-4 border-l-[#0b2545]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-200/80 px-1.5 py-0.5 rounded">
                        {doc.docIdentifier}
                      </span>
                      <span className="text-[11px] text-slate-500">{doc.category}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{doc.title}</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{doc.originalFilename}</p>
                  </div>
                  <StatusBadge status={doc.verificationState} size="sm" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Document Detail & AI Extraction (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-5">
          {selectedDoc ? (
            <>
              <div className="pb-3 border-b border-slate-200 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#0b2545] text-white">
                      {selectedDoc.docIdentifier}
                    </span>
                    <span className="text-xs text-slate-500">{selectedDoc.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{selectedDoc.title}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {selectedDoc.originalFilename} • {selectedDoc.fileSizeKb} KB • Uploaded by {selectedDoc.uploadedBy}
                  </p>
                </div>
                <StatusBadge status={selectedDoc.verificationState} />
              </div>

              {/* Gemini AI Intelligence Assistant Card */}
              <div className="bg-gradient-to-r from-sky-50 to-amber-50/50 border border-sky-300 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-xs text-slate-900">
                      Gemini Document Intelligence & Metadata Extraction
                    </span>
                  </div>
                  <button
                    onClick={handleSimulateGeminiExtraction}
                    disabled={isExtracting}
                    className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 hover:border-amber-400 text-slate-800 rounded shadow-2xs flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isExtracting ? 'Analyzing...' : 'Re-run AI Analysis'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Extracted key metadata fields from scanned document image/PDF. Safeguard: AI extraction does not automatically certify or verify records.
                </p>

                {selectedDoc.extractedMetadata && (
                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded border border-slate-200 font-mono">
                    {selectedDoc.extractedMetadata.instrumentId && (
                      <div>
                        <span className="text-slate-500 text-[10px] block">Instrument ID:</span>
                        <span className="font-bold text-slate-900">{selectedDoc.extractedMetadata.instrumentId}</span>
                      </div>
                    )}
                    {selectedDoc.extractedMetadata.serialNumber && (
                      <div>
                        <span className="text-slate-500 text-[10px] block">Extracted Serial No:</span>
                        <span className={`font-bold ${selectedDoc.extractedMetadata.serialNumber.includes('INCONSISTENT') ? 'text-rose-600' : 'text-slate-900'}`}>
                          {selectedDoc.extractedMetadata.serialNumber}
                        </span>
                      </div>
                    )}
                    {selectedDoc.extractedMetadata.certificateNo && (
                      <div>
                        <span className="text-slate-500 text-[10px] block">Certificate No:</span>
                        <span className="font-bold text-slate-900">{selectedDoc.extractedMetadata.certificateNo}</span>
                      </div>
                    )}
                    {selectedDoc.extractedMetadata.confidenceScore && (
                      <div>
                        <span className="text-slate-500 text-[10px] block">AI Confidence Score:</span>
                        <span className="font-bold text-emerald-700">
                          {Math.round(selectedDoc.extractedMetadata.confidenceScore * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mismatch Warning Callout for synthetic DOC-MISMATCH-99 */}
              {selectedDoc.extractedMetadata?.serialNumber?.includes('INCONSISTENT') && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded text-xs text-rose-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Serial Number Conflict (Rule DOC-002 Triggered):</span>
                  </div>
                  <p className="leading-relaxed">
                    Extracted serial number on certificate is <strong>SN-104B-INCONSISTENT</strong>, whereas equipment register lists <strong>SN-104A</strong>.
                    Human reviewer investigation required to confirm physical asset rating plate.
                  </p>
                </div>
              )}

              {/* Human Reviewer Sign-Off Box */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Human Reviewer Verification Sign-Off
                  </span>
                  {selectedDoc.verifiedBy && (
                    <span className="text-slate-500 text-[11px]">
                      Verified by: <strong>{selectedDoc.verifiedBy}</strong>
                    </span>
                  )}
                </div>

                {selectedDoc.reviewerNotes && (
                  <div className="p-2.5 bg-white rounded border border-slate-200 text-slate-700 italic">
                    Reviewer Notes: "{selectedDoc.reviewerNotes}"
                  </div>
                )}

                <textarea
                  rows={2}
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="Enter audit review comments or verification justification..."
                  className="w-full p-2 text-xs bg-white border rounded border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => handleVerify('Verified')}
                    className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Verify Evidence</span>
                  </button>
                  <button
                    onClick={() => handleVerify('Needs Human Verification')}
                    className="px-3 py-1.5 rounded bg-sky-100 hover:bg-sky-200 text-sky-900 font-medium border border-sky-300"
                  >
                    Flag for Secondary Review
                  </button>
                  <button
                    onClick={() => handleVerify('Rejected')}
                    className="px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 font-medium border border-rose-300"
                  >
                    Reject Document
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-500 py-12 text-xs">
              Select an evidence file from the repository.
            </div>
          )}
        </div>
      </div>

      {/* Upload Evidence Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">Upload New Evidence Document</h3>
              <button onClick={() => setUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fluke 87V 2026 Calibration Report"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as DocumentCategory)}
                  className="w-full p-2 border rounded border-slate-300 bg-white"
                >
                  <option value="Calibration Certificate">Calibration Certificate</option>
                  <option value="Test Report">Test Report</option>
                  <option value="BIS Licence / Certificate">BIS Licence / Certificate</option>
                  <option value="Technical Specification">Technical Specification</option>
                  <option value="Corrective Action Evidence">Corrective Action Evidence</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Original Filename *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ApexLabs_Cert_2026.pdf"
                  value={newFilename}
                  onChange={(e) => setNewFilename(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300 font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded text-center">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="text-slate-600 text-xs">Simulated upload will parse metadata and add file to secure repository.</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0b2545] hover:bg-sky-900 text-white font-semibold rounded shadow-xs"
                >
                  Confirm & Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
