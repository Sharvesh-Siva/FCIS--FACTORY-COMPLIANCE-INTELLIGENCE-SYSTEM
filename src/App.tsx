/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, ChevronRight, PanelLeft } from 'lucide-react';
import { repo } from './services/storageRepository';

// Layout
import { GovBanner } from './components/layout/GovBanner';
import { Header } from './components/layout/Header';
import { TopModuleNavigation } from './components/layout/TopModuleNavigation';
import { Sidebar } from './components/layout/Sidebar';

// Modules
import { DashboardView } from './components/modules/DashboardView';
import { ArchitectureView } from './components/modules/ArchitectureView';
import { DependencyExplorer } from './components/modules/DependencyExplorer';
import { ProductsModule } from './components/modules/ProductsModule';
import { InstrumentsModule } from './components/modules/InstrumentsModule';
import { CalibrationsModule } from './components/modules/CalibrationsModule';
import { QualityTestsModule } from './components/modules/QualityTestsModule';
import { DocumentsModule } from './components/modules/DocumentsModule';
import { CertificationsModule } from './components/modules/CertificationsModule';
import { FindingsModule } from './components/modules/FindingsModule';
import { CorrectiveActionsModule } from './components/modules/CorrectiveActionsModule';
import { ReadinessReportsModule } from './components/modules/ReadinessReportsModule';
import { AuditTrailModule } from './components/modules/AuditTrailModule';
import { RoleManagementModule } from './components/modules/RoleManagementModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { OrganisationsModule } from './components/modules/OrganisationsModule';

export default function App() {
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState<boolean>(false); // Collapsed by default so top-level System Overview & Master Registers take center stage
  const [, setTick] = useState(0);

  // Subscribe to persistent repository changes
  useEffect(() => {
    const unsubscribe = repo.subscribe(() => {
      setTick((t) => t + 1);
    });
    return () => unsubscribe();
  }, []);

  const moduleTitles: Record<string, string> = {
    dashboard: 'Overview Dashboard',
    architecture: 'Architecture & System Blueprint',
    dependencies: 'Evidence Dependency Graph',
    organisations: 'Organisations & Factory Units',
    products: 'Products & Product Models',
    instruments: 'Equipment & Instrument Register',
    calibrations: 'Calibration Records',
    tests: 'Quality Tests & Batch Inspection',
    certifications: 'Certifications & Requirements',
    documents: 'Documents & Evidence Repository',
    findings: 'Compliance Findings',
    actions: 'Corrective Actions (CAPA)',
    reports: 'Readiness Dossier & Reports',
    audit: 'Audit Trail & Event History',
    roles: 'Users & Role Permissions',
    settings: 'Settings & Rule Catalog',
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans">
      {/* 1. Institutional Safeguard & Government-Style Disclosure Banner */}
      <GovBanner />

      {/* 2. Institutional Navy Header */}
      <Header
        activeModule={activeModule}
        setActiveModule={setActiveModule}
      />

      {/* 3. Top System Overview & Master Registers Navigation (Persistent below Title) */}
      <TopModuleNavigation
        activeModule={activeModule}
        setActiveModule={setActiveModule}
      />

      {/* 4. Main Workspace Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
          desktopVisible={desktopSidebarOpen}
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col">
          {/* Top Breadcrumbs and Mobile Hamburger Toggle */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-1.5 -ml-1 text-slate-700 hover:text-slate-950 rounded border border-slate-300 bg-white"
                title="Open menu"
              >
                <Menu className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs font-semibold cursor-pointer"
                title="Toggle Left Auxiliary Sidebar"
              >
                <PanelLeft className="w-3.5 h-3.5 text-sky-700" />
                <span>{desktopSidebarOpen ? 'Hide Left Drawer' : 'Show Left Drawer'}</span>
              </button>
              <span
                onClick={() => setActiveModule('dashboard')}
                className="hover:text-slate-900 cursor-pointer"
              >
                FCIS Platform
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-semibold">
                {moduleTitles[activeModule] || 'Dashboard'}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Org: DEMOCIRCUITS-IND</span>
              <span>• Unit 1 (BLR-U1)</span>
            </div>
          </div>

          {/* Module Router View */}
          <div className="flex-1">
            {activeModule === 'dashboard' && <DashboardView onNavigate={(mod) => setActiveModule(mod)} />}
            {activeModule === 'architecture' && <ArchitectureView />}
            {activeModule === 'dependencies' && <DependencyExplorer />}
            {activeModule === 'organisations' && <OrganisationsModule />}
            {activeModule === 'products' && <ProductsModule />}
            {activeModule === 'instruments' && <InstrumentsModule onNavigateToCalibrations={() => setActiveModule('calibrations')} />}
            {activeModule === 'calibrations' && <CalibrationsModule />}
            {activeModule === 'tests' && <QualityTestsModule onNavigateToDependency={() => setActiveModule('dependencies')} />}
            {activeModule === 'certifications' && <CertificationsModule />}
            {activeModule === 'documents' && <DocumentsModule />}
            {activeModule === 'findings' && (
              <FindingsModule
                onNavigateToCapa={() => setActiveModule('actions')}
              />
            )}
            {activeModule === 'actions' && <CorrectiveActionsModule />}
            {activeModule === 'reports' && <ReadinessReportsModule />}
            {activeModule === 'audit' && <AuditTrailModule />}
            {activeModule === 'roles' && <RoleManagementModule />}
            {activeModule === 'settings' && <SettingsModule />}
          </div>
        </main>
      </div>

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded bg-[#0b2545] text-white flex items-center justify-center font-bold text-xs">
              FCIS
            </span>
            <span>
              Factory Compliance Intelligence System — Industrial Quality Traceability Architecture
            </span>
          </div>

          <div className="text-[11px] text-slate-400 text-center md:text-right">
            Independent software prototype for electronics quality standards readiness. Not an official BIS application.
          </div>
        </div>
      </footer>
    </div>
  );
}
