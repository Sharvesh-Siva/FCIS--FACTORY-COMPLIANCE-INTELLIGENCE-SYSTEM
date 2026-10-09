import React from 'react';
import { Users, Shield, Check, X, UserCheck } from 'lucide-react';
import { repo } from '../../services/storageRepository';

export const RoleManagementModule: React.FC = () => {
  const state = repo.getState();
  const activeUser = repo.getActiveUser();

  const roleDefinitions = [
    {
      role: 'org_admin',
      name: 'Organisation Administrator',
      desc: 'Full administrative access across factories, users, settings, and rule configurations.',
      permissions: {
        viewAll: true,
        editMasters: true,
        uploadEvidence: true,
        evaluateRules: true,
        approveCapa: true,
        exportReports: true,
        adminSettings: true,
      },
    },
    {
      role: 'quality_engineer',
      name: 'Quality Engineer',
      desc: 'Manages product specifications, in-line quality tests, CAPA investigations, and defect assessments.',
      permissions: {
        viewAll: true,
        editMasters: true,
        uploadEvidence: true,
        evaluateRules: true,
        approveCapa: true,
        exportReports: true,
        adminSettings: false,
      },
    },
    {
      role: 'calibration_coordinator',
      name: 'Calibration Coordinator',
      desc: 'Maintains equipment register, calibration certificates, laboratory accreditation, and validity dates.',
      permissions: {
        viewAll: true,
        editMasters: true,
        uploadEvidence: true,
        evaluateRules: true,
        approveCapa: false,
        exportReports: false,
        adminSettings: false,
      },
    },
    {
      role: 'compliance_reviewer',
      name: 'Compliance Reviewer',
      desc: 'Inspects evidence relationships, signs off document verifications, and generates audit dossiers.',
      permissions: {
        viewAll: true,
        editMasters: false,
        uploadEvidence: true,
        evaluateRules: true,
        approveCapa: true,
        exportReports: true,
        adminSettings: false,
      },
    },
    {
      role: 'auditor',
      name: 'Read-Only Auditor',
      desc: 'Third-party surveillance and regulatory inspection role. Can view and export, but cannot mutate records.',
      permissions: {
        viewAll: true,
        editMasters: false,
        uploadEvidence: false,
        evaluateRules: true,
        approveCapa: false,
        exportReports: true,
        adminSettings: false,
      },
    },
    {
      role: 'demo_user',
      name: 'Demonstration User',
      desc: 'Sandbox observation persona for interactive workflow trials with synthetic factory records.',
      permissions: {
        viewAll: true,
        editMasters: false,
        uploadEvidence: false,
        evaluateRules: true,
        approveCapa: false,
        exportReports: false,
        adminSettings: false,
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-sky-700" />
          <h2 className="text-xl font-bold text-slate-900">User Personas & Role Permissions Matrix</h2>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Role-Based Access Control (RBAC) governance governing record mutation, calibration sign-off, and audit readiness.
        </p>
      </div>

      {/* Active User Persona Banner */}
      <div className="bg-sky-50 border border-sky-300 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0b2545] text-white flex items-center justify-center font-bold text-sm">
            {activeUser.avatar || 'US'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">{activeUser.name}</span>
              <span className="font-mono text-[10px] bg-sky-200 text-sky-900 px-2 py-0.5 rounded font-bold uppercase">
                {activeUser.role}
              </span>
            </div>
            <div className="text-slate-500 mt-0.5">{activeUser.department} • {activeUser.email}</div>
          </div>
        </div>

        <div className="text-slate-600 text-[11px]">
          To test different personas, click the user menu in the top navigation bar.
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase tracking-wider">
          Permission Governance Matrix
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold">
              <tr>
                <th className="p-3">Role Persona</th>
                <th className="p-3 text-center">View All Records</th>
                <th className="p-3 text-center">Mutate Masters</th>
                <th className="p-3 text-center">Upload Evidence</th>
                <th className="p-3 text-center">Execute Rules</th>
                <th className="p-3 text-center">Approve CAPA</th>
                <th className="p-3 text-center">Export Dossier</th>
                <th className="p-3 text-center">Admin Config</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roleDefinitions.map((r) => {
                const isActive = activeUser.role === r.role;
                return (
                  <tr key={r.role} className={`hover:bg-slate-50 ${isActive ? 'bg-sky-50/60 font-semibold' : ''}`}>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{r.name}</span>
                        {isActive && (
                          <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[10px] font-bold">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal mt-0.5">{r.desc}</div>
                    </td>
                    <td className="p-3 text-center">{r.permissions.viewAll ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                    <td className="p-3 text-center">{r.permissions.editMasters ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                    <td className="p-3 text-center">{r.permissions.uploadEvidence ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                    <td className="p-3 text-center">{r.permissions.evaluateRules ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                    <td className="p-3 text-center">{r.permissions.approveCapa ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                    <td className="p-3 text-center">{r.permissions.exportReports ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                    <td className="p-3 text-center">{r.permissions.adminSettings ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
