import React from 'react';
import { Building, MapPin, Mail, Phone, Layers, CheckCircle2 } from 'lucide-react';
import { repo } from '../../services/storageRepository';

export const OrganisationsModule: React.FC = () => {
  const state = repo.getState();
  const org = state.organisation;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-sky-700" />
          <h2 className="text-xl font-bold text-slate-900">Organisation & Factory Units</h2>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Manufacturing facilities, corporate identity, production lines, and data isolation scopes.
        </p>
      </div>

      {/* Corporate Profile Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#0b2545] text-white">
                {org.code}
              </span>
              <span className="text-xs text-slate-500 font-mono">Registration: {org.registrationNumber}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">{org.name}</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 self-start sm:self-auto">
            Active Multi-Plant License
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded border border-slate-200">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 block text-[11px]">Headquarters:</span>
              <span className="text-slate-900 font-medium">{org.headquarters}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 block text-[11px]">Compliance Email:</span>
              <span className="font-mono text-slate-900 font-medium">{org.contactEmail}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 block text-[11px]">Central Desk:</span>
              <span className="font-mono text-slate-900 font-medium">{org.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Factory Complexes Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Registered Manufacturing Units & Complexes ({org.factories.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {org.factories.map((fact) => {
            const productsInFact = state.products.filter((p) => p.factoryId === fact.id);
            const instrumentsInFact = state.instruments.filter((i) => i.factoryId === fact.id);

            return (
              <div key={fact.id} className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
                <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {fact.unitCode}
                      </span>
                      <span className="text-xs text-slate-500">{fact.state}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{fact.name}</h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    OPERATIONAL
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div><strong>Address:</strong> {fact.location}</div>
                  <div><strong>Plant In-Charge:</strong> {fact.contactPerson}</div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Active Production Lines:
                  </span>
                  <div className="space-y-1">
                    {fact.productionLines.map((line) => (
                      <div key={line} className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Assigned Products: <strong>{productsInFact.length}</strong></span>
                  <span>Registered Equipment: <strong>{instrumentsInFact.length}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
