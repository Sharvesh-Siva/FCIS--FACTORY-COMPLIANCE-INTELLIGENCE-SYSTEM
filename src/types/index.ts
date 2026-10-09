// Domain Types for FCIS (Factory Compliance Intelligence System)

export type UserRole =
  | 'org_admin'
  | 'quality_engineer'
  | 'calibration_coordinator'
  | 'compliance_reviewer'
  | 'auditor'
  | 'demo_user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  permittedActions: string[];
}

export interface Organisation {
  id: string;
  name: string;
  code: string;
  registrationNumber: string;
  headquarters: string;
  contactEmail: string;
  phone: string;
  factories: Factory[];
}

export interface Factory {
  id: string;
  orgId: string;
  name: string;
  unitCode: string;
  location: string;
  state: string;
  contactPerson: string;
  productionLines: string[];
  activeStatus: boolean;
}

export interface Product {
  id: string;
  productCode: string;
  productName: string;
  modelNumber: string;
  category: string;
  description: string;
  factoryId: string;
  productionLine: string;
  applicableStandards: string[];
  reviewStatus: 'Ready' | 'Review Required' | 'Non-Compliant' | 'Pending Verification';
  recordOwner: string;
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  productId: string;
  batchNumber: string;
  manufacturingDate: string;
  quantity: number;
  productionLine: string;
  inspectionStatus: 'Passed' | 'Under Review' | 'Quarantined';
  testIds: string[];
}

export type InstrumentStatus = 'Active' | 'In Calibration' | 'Out of Service' | 'Calibration Expired';

export interface Instrument {
  id: string;
  instrumentId: string; // e.g. DMM-104
  name: string;
  instrumentType: string;
  manufacturer: string;
  model: string;
  serialNumber: string; // e.g. SN-104A
  factoryId: string;
  laboratoryLocation: string;
  responsibleDepartment: string;
  calibrationIntervalMonths: number;
  currentStatus: InstrumentStatus;
  lastCalibrationDate?: string;
  calibrationValidityEndDate?: string;
  notes?: string;
}

export interface CalibrationRecord {
  id: string;
  recordId: string; // e.g. CAL-CERT-01
  instrumentId: string;
  certificateNumber: string;
  calibrationProvider: string;
  accreditationDetails?: string; // NABL or laboratory accreditation
  calibrationDate: string; // YYYY-MM-DD
  validityEndDate: string; // YYYY-MM-DD
  result: 'Pass / Within Tolerance' | 'Conditional' | 'Out of Tolerance';
  documentId?: string;
  verificationState: 'Verified' | 'Needs Human Verification' | 'Rejected' | 'Not Reviewed';
  verifiedBy?: string;
  verifiedAt?: string;
  validityRuleSource: string;
  notes?: string;
}

export type DocumentCategory =
  | 'Calibration Certificate'
  | 'Test Report'
  | 'BIS Licence / Certificate'
  | 'Technical Specification'
  | 'Standard Operating Procedure'
  | 'Corrective Action Evidence';

export type DocumentVerificationState =
  | 'Not Reviewed'
  | 'Extraction Pending'
  | 'Needs Human Verification'
  | 'Verified'
  | 'Rejected'
  | 'Superseded';

export interface EvidenceDocument {
  id: string;
  docIdentifier: string; // e.g. DOC-2026-CAL-01
  title: string;
  originalFilename: string;
  fileSizeKb: number;
  fileType: string;
  category: DocumentCategory;
  linkedEntityType: 'instrument' | 'product' | 'batch' | 'test' | 'certification' | 'action';
  linkedEntityId: string;
  uploadTimestamp: string;
  uploadedBy: string;
  verificationState: DocumentVerificationState;
  extractedMetadata?: {
    instrumentId?: string;
    serialNumber?: string;
    certificateNo?: string;
    calibrationDate?: string;
    validityDate?: string;
    calibratedBy?: string;
    confidenceScore?: number;
    extractedAt?: string;
  };
  reviewerNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface QualityTest {
  id: string;
  testId: string; // e.g. T-001
  productId: string;
  batchId: string;
  testType: string;
  testDate: string; // YYYY-MM-DD
  testResult: 'Pass' | 'Fail' | 'Conditional';
  acceptanceCriteria: string;
  instrumentId: string; // references Instrument
  operatorName: string;
  supportingDocumentId?: string;
  reviewStatus: 'Approved' | 'Review Required' | 'Pending';
  notes?: string;
}

export interface CertificationRecord {
  id: string;
  licenceNumber: string; // e.g. CMD/CRS/2026/0912
  schemeName: string; // e.g. Compulsory Registration Scheme (CRS)
  standardReference: string; // e.g. IS 13252 (Part 1):2010 / IEC 60950-1
  productCategory: string;
  applicableModels: string[];
  issuingBody: string; // e.g. Bureau of Indian Standards (Recorded reference)
  effectiveDate: string;
  expiryDate: string;
  verificationStatus: 'Verified' | 'Needs Review' | 'Expired';
  scopeDescription: string;
  supportingDocumentId?: string;
  sourceUrl?: string;
  reviewerNotes?: string;
}

export type FindingPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type FindingStatus = 'Open' | 'Under Review' | 'Action Required' | 'Resolved' | 'Dismissed';

export interface Finding {
  id: string;
  findingCode: string; // e.g. FND-2026-001
  ruleId: string; // e.g. CAL-003
  ruleVersion: string;
  title: string;
  explanation: string;
  triggeringRecordType: 'instrument' | 'test' | 'calibration' | 'document' | 'certification' | 'action';
  triggeringRecordId: string;
  triggeringRecordLabel: string;
  relatedRecordType?: string;
  relatedRecordId?: string;
  relatedRecordLabel?: string;
  evidenceDocumentId?: string;
  relevantDates: {
    eventDate?: string;
    validityEndDate?: string;
    assessmentDate: string;
  };
  priority: FindingPriority;
  status: FindingStatus;
  recommendedAction: string;
  assignedReviewer?: string;
  assignedRole?: UserRole;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export type ActionStatus = 'Open' | 'Under Investigation' | 'Evidence Attached' | 'Submitted for Approval' | 'Approved & Closed';
export type ActionPriority = 'High' | 'Medium' | 'Low';

export interface CorrectiveAction {
  id: string;
  actionCode: string; // e.g. CAPA-2026-001
  findingId: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedRole: UserRole;
  dueDate: string;
  status: ActionStatus;
  priority: ActionPriority;
  rootCauseAnalysis?: string;
  proposedAction?: string;
  evidenceDocumentId?: string;
  resolutionNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'VERIFY' | 'EVALUATE' | 'APPROVE' | 'DISMISS';
  entityType: string;
  entityId: string;
  entityLabel: string;
  summary: string;
  changes?: Record<string, { from: any; to: any }>;
}

export interface ReadinessReport {
  id: string;
  reportCode: string; // e.g. RPT-2026-10-001
  title: string;
  factoryId: string;
  scopeType: 'all_factory' | 'product_specific' | 'instrument_focused';
  targetProductIds: string[];
  assessmentDate: string;
  generatedAt: string;
  generatedBy: string;
  totalProductsReviewed: number;
  totalInstrumentsReviewed: number;
  totalTestsReviewed: number;
  totalFindings: number;
  criticalFindings: number;
  highFindings: number;
  resolvedFindings: number;
  readinessIndexScore: number; // 0-100 percentage
  overallAssessment: 'Ready for External Inspection' | 'Conditional Readiness' | 'Remediation Required';
  findings: Finding[];
  disclaimer: string;
}
