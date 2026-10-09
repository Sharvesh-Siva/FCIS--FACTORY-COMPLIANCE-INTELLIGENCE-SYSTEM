import React from 'react';
import { Award, ExternalLink, Calendar, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { repo } from '../../services/storageRepository';
import { StatusBadge } from '../common/StatusBadge';

export const CertificationsModule: React.FC = () => {
  const state = repo.getState();
  const certs = state.certifications;
  const assessmentDate = state.assessmentDate;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-sky-700" />
          <h2 className="text-xl font-bold text-slate-900">Certifications & Mandatory Requirements</h2>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Registered regulatory schemes, Bureau of Indian Standards (BIS) references, product scope lists, and renewal timelines.
        </p>
      </div>

      {/* Scope Cards */}
      <div className="grid grid-cols-1 gap-6">
        {certs.map((c) => {
          const expiryTime = new Date(c.expiryDate).getTime();
          const assessTime = new Date(assessmentDate).getTime();
          const daysLeft = Math.round((expiryTime - assessTime) / (1000 * 3600 * 24));
          const isApproaching = daysLeft <= 30;

          return (
            <div key={c.id} className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#0b2545] text-white">
                      {c.licenceNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{c.schemeName}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{c.standardReference}</h3>
                </div>
                <StatusBadge status={isApproaching ? 'Approaching Expiry' : c.verificationStatus} />
              </div>

              {isApproaching && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Renewal Notice (Rule CERT-001): Licence expires on <strong>{c.expiryDate}</strong> ({daysLeft} days remaining from {assessmentDate}). Renewal application must be filed 30 days prior to expiry.
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Issuing Authority (Recorded):</span>
                  <span className="font-semibold text-slate-900">{c.issuingBody}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Effective Date:</span>
                  <span className="font-mono text-slate-900">{c.effectiveDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Expiration Date:</span>
                  <span className="font-mono font-bold text-amber-800">{c.expiryDate}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-xs text-slate-900 block mb-1">Approved Model Scope:</span>
                <div className="flex flex-wrap gap-2">
                  {c.applicableModels.map((m) => (
                    <span key={m} className="px-2 py-1 rounded bg-sky-50 text-sky-900 border border-sky-300 text-xs font-mono font-medium">
                      Model: {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Compliance Scope & Review Notes:</span>
                <p>{c.scopeDescription}</p>
                {c.reviewerNotes && <p className="mt-1 text-slate-700 italic">Reviewer: {c.reviewerNotes}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
