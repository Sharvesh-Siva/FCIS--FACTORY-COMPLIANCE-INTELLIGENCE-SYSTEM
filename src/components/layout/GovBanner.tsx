import React, { useState } from 'react';
import { ShieldCheck, Info, ChevronDown, ChevronUp, AlertCircle, Building2 } from 'lucide-react';

export const GovBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-900 text-slate-200 text-xs border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-1.5 sm:px-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-100 tracking-wide">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-400/40" />
            <span>FCIS PROTOTYPE NOTICE:</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">
            Independent decision-support prototype for electronics compliance & metrology readiness.
          </span>
          <span className="text-amber-400 font-medium">Not an official Bureau of Indian Standards (BIS) portal.</span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1 text-slate-300 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
        >
          <span>Institutional safeguards & synthetic data scope</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="bg-slate-950/95 border-t border-slate-800/80 px-4 py-4 text-xs text-slate-300 transition-all">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white mb-1">Decision Support & Traceability Only</p>
                <p className="text-slate-400 leading-relaxed">
                  FCIS never independently declares a product unsafe, certifies batches, or issues legal penalties.
                  All findings are explainable recommendations requiring authorized human engineering sign-off.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white mb-1">Synthetic Organisation (DemoCircuits)</p>
                <p className="text-slate-400 leading-relaxed">
                  All serial numbers (e.g. SN-104A), test sheets, and licence identifiers displayed are fictional demonstration
                  records designed to test calibration expiry boundaries and evidence dependency graphs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white mb-1">Standard Reference Grounding</p>
                <p className="text-slate-400 leading-relaxed">
                  References to Indian Standards (such as IS 13252 (Part 1):2010 for Power Electronics) represent publicly documented
                  engineering standards. Real certification requires physical audit by accredited testing laboratories.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
