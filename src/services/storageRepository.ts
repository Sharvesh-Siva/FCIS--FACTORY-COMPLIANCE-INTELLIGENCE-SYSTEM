import {
  Organisation,
  Product,
  Batch,
  Instrument,
  CalibrationRecord,
  EvidenceDocument,
  QualityTest,
  CertificationRecord,
  CorrectiveAction,
  AuditEvent,
  User,
  UserRole,
  Finding,
} from '../types';
import {
  INITIAL_ASSESSMENT_DATE,
  INITIAL_USERS,
  INITIAL_ORGANISATION,
  INITIAL_PRODUCTS,
  INITIAL_BATCHES,
  INITIAL_INSTRUMENTS,
  INITIAL_CALIBRATIONS,
  INITIAL_DOCUMENTS,
  INITIAL_TESTS,
  INITIAL_CERTIFICATIONS,
  INITIAL_ACTIONS,
  INITIAL_AUDIT_EVENTS,
} from './mockData';
import { runComplianceEvaluation, COMPLIANCE_RULES } from './ruleEngine';

const STORAGE_KEY = 'fcis_data_store_v1';

export interface FCISState {
  assessmentDate: string;
  activeUserId: string;
  organisation: Organisation;
  products: Product[];
  batches: Batch[];
  instruments: Instrument[];
  calibrations: CalibrationRecord[];
  documents: EvidenceDocument[];
  tests: QualityTest[];
  certifications: CertificationRecord[];
  actions: CorrectiveAction[];
  auditEvents: AuditEvent[];
  users: User[];
  dismissedFindingIds: string[];
}

export class FCISRepository {
  private state: FCISState;
  private listeners: Array<() => void> = [];

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): FCISState {
    const defaultState: FCISState = {
      assessmentDate: INITIAL_ASSESSMENT_DATE,
      activeUserId: 'USR-01',
      organisation: INITIAL_ORGANISATION,
      products: INITIAL_PRODUCTS,
      batches: INITIAL_BATCHES,
      instruments: INITIAL_INSTRUMENTS,
      calibrations: INITIAL_CALIBRATIONS,
      documents: INITIAL_DOCUMENTS,
      tests: INITIAL_TESTS,
      certifications: INITIAL_CERTIFICATIONS,
      actions: INITIAL_ACTIONS,
      auditEvents: INITIAL_AUDIT_EVENTS,
      users: INITIAL_USERS,
      dismissedFindingIds: [],
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          assessmentDate: parsed.assessmentDate || defaultState.assessmentDate,
          activeUserId: parsed.activeUserId || defaultState.activeUserId,
          organisation: parsed.organisation || defaultState.organisation,
          products: Array.isArray(parsed.products) ? parsed.products : defaultState.products,
          batches: Array.isArray(parsed.batches) ? parsed.batches : defaultState.batches,
          instruments: Array.isArray(parsed.instruments) ? parsed.instruments : defaultState.instruments,
          calibrations: Array.isArray(parsed.calibrations) ? parsed.calibrations : defaultState.calibrations,
          documents: Array.isArray(parsed.documents) ? parsed.documents : defaultState.documents,
          tests: Array.isArray(parsed.tests) ? parsed.tests : defaultState.tests,
          certifications: Array.isArray(parsed.certifications) ? parsed.certifications : defaultState.certifications,
          actions: Array.isArray(parsed.actions) ? parsed.actions : defaultState.actions,
          auditEvents: Array.isArray(parsed.auditEvents) ? parsed.auditEvents : defaultState.auditEvents,
          users: Array.isArray(parsed.users) ? parsed.users : defaultState.users,
          dismissedFindingIds: Array.isArray(parsed.dismissedFindingIds) ? parsed.dismissedFindingIds : [],
        };
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using initial seed data', e);
    }

    return defaultState;
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public resetToSeedData(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.state = {
      assessmentDate: INITIAL_ASSESSMENT_DATE,
      activeUserId: 'USR-01',
      organisation: INITIAL_ORGANISATION,
      products: INITIAL_PRODUCTS,
      batches: INITIAL_BATCHES,
      instruments: INITIAL_INSTRUMENTS,
      calibrations: INITIAL_CALIBRATIONS,
      documents: INITIAL_DOCUMENTS,
      tests: INITIAL_TESTS,
      certifications: INITIAL_CERTIFICATIONS,
      actions: INITIAL_ACTIONS,
      auditEvents: INITIAL_AUDIT_EVENTS,
      users: INITIAL_USERS,
      dismissedFindingIds: [],
    };
    this.saveState();
  }

  // Getters
  public getState(): FCISState {
    return this.state;
  }

  public getActiveUser(): User {
    const user = this.state.users.find((u) => u.id === this.state.activeUserId);
    return user || this.state.users[0];
  }

  public setActiveUser(userId: string): void {
    this.state.activeUserId = userId;
    this.saveState();
  }

  public getAssessmentDate(): string {
    return this.state.assessmentDate;
  }

  public setAssessmentDate(newDate: string): void {
    const old = this.state.assessmentDate;
    this.state.assessmentDate = newDate;
    this.addAuditEvent({
      operation: 'UPDATE',
      entityType: 'SystemSettings',
      entityId: 'ASSESSMENT_DATE',
      entityLabel: 'Global Assessment Date',
      summary: `Assessment evaluation benchmark date changed from ${old} to ${newDate}`,
    });
    this.saveState();
  }

  // Compliance Rule Findings
  public getFindings(): Finding[] {
    const generated = runComplianceEvaluation({
      assessmentDate: this.state.assessmentDate,
      instruments: this.state.instruments,
      calibrations: this.state.calibrations,
      tests: this.state.tests,
      documents: this.state.documents,
      certifications: this.state.certifications,
      actions: this.state.actions,
      products: this.state.products,
    });

    // Mark dismissed ones
    return generated.map((f) => {
      if (this.state.dismissedFindingIds.includes(f.id)) {
        return { ...f, status: 'Dismissed' as const };
      }
      return f;
    });
  }

  public dismissFinding(findingId: string, reason: string): void {
    if (!this.state.dismissedFindingIds.includes(findingId)) {
      this.state.dismissedFindingIds.push(findingId);
    }
    this.addAuditEvent({
      operation: 'DISMISS',
      entityType: 'Finding',
      entityId: findingId,
      entityLabel: `Finding ${findingId}`,
      summary: `Finding dismissed by authorized reviewer with justification: "${reason}"`,
    });
    this.saveState();
  }

  // Audit Events
  public addAuditEvent(params: {
    operation: AuditEvent['operation'];
    entityType: string;
    entityId: string;
    entityLabel: string;
    summary: string;
    changes?: Record<string, { from: any; to: any }>;
  }): void {
    const user = this.getActiveUser();
    const event: AuditEvent = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorName: user.name,
      actorRole: user.role,
      operation: params.operation,
      entityType: params.entityType,
      entityId: params.entityId,
      entityLabel: params.entityLabel,
      summary: params.summary,
      changes: params.changes,
    };
    this.state.auditEvents.unshift(event);
  }

  // Products
  public getProducts(): Product[] {
    return this.state.products;
  }

  public addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const user = this.getActiveUser();
    const newProduct: Product = {
      ...product,
      id: `P-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.products.push(newProduct);
    this.addAuditEvent({
      operation: 'CREATE',
      entityType: 'Product',
      entityId: newProduct.id,
      entityLabel: `${newProduct.productCode} (${newProduct.productName})`,
      summary: `Registered new product model ${newProduct.productCode} under factory ${newProduct.factoryId}`,
    });
    this.saveState();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): void {
    const idx = this.state.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.state.products[idx] = {
        ...this.state.products[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.addAuditEvent({
        operation: 'UPDATE',
        entityType: 'Product',
        entityId: id,
        entityLabel: this.state.products[idx].productCode,
        summary: `Updated product specification and standards metadata`,
      });
      this.saveState();
    }
  }

  // Instruments
  public getInstruments(): Instrument[] {
    return this.state.instruments;
  }

  public addInstrument(instrument: Omit<Instrument, 'id'>): Instrument {
    const newInst: Instrument = {
      ...instrument,
      id: `INST-${instrument.instrumentId.replace(/\s+/g, '-').toUpperCase()}`,
    };
    this.state.instruments.push(newInst);
    this.addAuditEvent({
      operation: 'CREATE',
      entityType: 'Instrument',
      entityId: newInst.id,
      entityLabel: `${newInst.instrumentId} (${newInst.name})`,
      summary: `Added instrument ${newInst.instrumentId} (Serial: ${newInst.serialNumber}) to equipment register`,
    });
    this.saveState();
    return newInst;
  }

  public updateInstrument(id: string, updates: Partial<Instrument>): void {
    const idx = this.state.instruments.findIndex((i) => i.id === id);
    if (idx !== -1) {
      this.state.instruments[idx] = { ...this.state.instruments[idx], ...updates };
      this.addAuditEvent({
        operation: 'UPDATE',
        entityType: 'Instrument',
        entityId: id,
        entityLabel: this.state.instruments[idx].instrumentId,
        summary: `Updated instrument parameters & location`,
      });
      this.saveState();
    }
  }

  // Calibrations
  public getCalibrations(): CalibrationRecord[] {
    return this.state.calibrations;
  }

  public addCalibration(calibration: Omit<CalibrationRecord, 'id'>): CalibrationRecord {
    const newCal: CalibrationRecord = {
      ...calibration,
      id: `CAL-${Date.now().toString().slice(-4)}`,
    };
    this.state.calibrations.push(newCal);

    // Also update linked instrument's last calibration date and validity
    const inst = this.state.instruments.find(
      (i) => i.id === calibration.instrumentId || i.instrumentId === calibration.instrumentId
    );
    if (inst) {
      inst.lastCalibrationDate = calibration.calibrationDate;
      inst.calibrationValidityEndDate = calibration.validityEndDate;
      inst.currentStatus = calibration.validityEndDate >= this.state.assessmentDate ? 'Active' : 'Calibration Expired';
    }

    this.addAuditEvent({
      operation: 'CREATE',
      entityType: 'CalibrationRecord',
      entityId: newCal.id,
      entityLabel: newCal.recordId,
      summary: `Registered calibration certificate ${newCal.certificateNumber} valid until ${newCal.validityEndDate}`,
    });
    this.saveState();
    return newCal;
  }

  // Documents
  public getDocuments(): EvidenceDocument[] {
    return this.state.documents;
  }

  public addDocument(doc: Omit<EvidenceDocument, 'id' | 'uploadTimestamp'>): EvidenceDocument {
    const newDoc: EvidenceDocument = {
      ...doc,
      id: `DOC-${Date.now().toString().slice(-4)}`,
      uploadTimestamp: new Date().toISOString(),
    };
    this.state.documents.push(newDoc);
    this.addAuditEvent({
      operation: 'CREATE',
      entityType: 'EvidenceDocument',
      entityId: newDoc.id,
      entityLabel: newDoc.docIdentifier,
      summary: `Uploaded evidence file "${newDoc.originalFilename}" under category ${newDoc.category}`,
    });
    this.saveState();
    return newDoc;
  }

  public verifyDocument(
    docId: string,
    state: EvidenceDocument['verificationState'],
    notes?: string
  ): void {
    const user = this.getActiveUser();
    const doc = this.state.documents.find((d) => d.id === docId);
    if (doc) {
      doc.verificationState = state;
      doc.verifiedBy = user.name;
      doc.verifiedAt = new Date().toISOString();
      if (notes) doc.reviewerNotes = notes;

      this.addAuditEvent({
        operation: 'VERIFY',
        entityType: 'EvidenceDocument',
        entityId: doc.id,
        entityLabel: doc.docIdentifier,
        summary: `Document marked as "${state}" by ${user.name}`,
      });
      this.saveState();
    }
  }

  // Quality Tests
  public getTests(): QualityTest[] {
    return this.state.tests;
  }

  public addTest(test: Omit<QualityTest, 'id'>): QualityTest {
    const newTest: QualityTest = {
      ...test,
      id: `T-${Date.now().toString().slice(-4)}`,
    };
    this.state.tests.push(newTest);
    this.addAuditEvent({
      operation: 'CREATE',
      entityType: 'QualityTest',
      entityId: newTest.id,
      entityLabel: newTest.testId,
      summary: `Recorded quality test result "${newTest.testResult}" on batch ${newTest.batchId} with instrument ${newTest.instrumentId}`,
    });
    this.saveState();
    return newTest;
  }

  // Corrective Actions
  public getActions(): CorrectiveAction[] {
    return this.state.actions;
  }

  public addAction(action: Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'>): CorrectiveAction {
    const newAction: CorrectiveAction = {
      ...action,
      id: `ACT-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.actions.push(newAction);
    this.addAuditEvent({
      operation: 'CREATE',
      entityType: 'CorrectiveAction',
      entityId: newAction.id,
      entityLabel: newAction.actionCode,
      summary: `Initiated CAPA "${newAction.title}" assigned to ${newAction.assignedTo} due ${newAction.dueDate}`,
    });
    this.saveState();
    return newAction;
  }

  public updateAction(id: string, updates: Partial<CorrectiveAction>): void {
    const user = this.getActiveUser();
    const idx = this.state.actions.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.state.actions[idx] = {
        ...this.state.actions[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.addAuditEvent({
        operation: updates.status === 'Approved & Closed' ? 'APPROVE' : 'UPDATE',
        entityType: 'CorrectiveAction',
        entityId: id,
        entityLabel: this.state.actions[idx].actionCode,
        summary: `Updated CAPA status to "${this.state.actions[idx].status}" by ${user.name}`,
      });
      this.saveState();
    }
  }

  // Certifications
  public getCertifications(): CertificationRecord[] {
    return this.state.certifications;
  }

  // Audit Events
  public getAuditEvents(): AuditEvent[] {
    return this.state.auditEvents;
  }
}

export const repo = new FCISRepository();
