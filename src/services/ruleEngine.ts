import {
  Instrument,
  CalibrationRecord,
  QualityTest,
  EvidenceDocument,
  CertificationRecord,
  CorrectiveAction,
  Finding,
  Product,
} from '../types';

export interface RuleEvaluationContext {
  assessmentDate: string; // YYYY-MM-DD
  instruments: Instrument[];
  calibrations: CalibrationRecord[];
  tests: QualityTest[];
  documents: EvidenceDocument[];
  certifications: CertificationRecord[];
  actions: CorrectiveAction[];
  products: Product[];
}

export interface RuleDefinition {
  ruleId: string;
  version: string;
  title: string;
  category: 'CALIBRATION' | 'DOCUMENT' | 'CERTIFICATION' | 'TRACEABILITY' | 'ACTION';
  description: string;
  defaultPriority: 'Critical' | 'High' | 'Medium' | 'Low';
  evaluate: (context: RuleEvaluationContext) => Finding[];
}

export const COMPLIANCE_RULES: RuleDefinition[] = [
  {
    ruleId: 'CAL-001',
    version: '1.2.0',
    title: 'Required Calibration Evidence Missing',
    category: 'CALIBRATION',
    description: 'Active instrument has no linked calibration certificate or calibration record in the system.',
    defaultPriority: 'High',
    evaluate: (ctx) => {
      const findings: Finding[] = [];
      for (const inst of ctx.instruments) {
        // Find if instrument has any calibration records
        const cal = ctx.calibrations.find((c) => c.instrumentId === inst.id || c.instrumentId === inst.instrumentId);
        if (!cal) {
          findings.push({
            id: `FND-CAL001-${inst.id}`,
            findingCode: `FND-CAL-001-${inst.instrumentId}`,
            ruleId: 'CAL-001',
            ruleVersion: '1.2.0',
            title: `Missing Calibration Record for Instrument ${inst.instrumentId}`,
            explanation: `Instrument "${inst.name}" (${inst.instrumentId}, SN: ${inst.serialNumber}) in ${inst.laboratoryLocation} has no active or archived calibration record registered in the repository. Industrial quality systems require verified calibration traceability for all measurement equipment.`,
            triggeringRecordType: 'instrument',
            triggeringRecordId: inst.id,
            triggeringRecordLabel: `${inst.instrumentId} (${inst.name})`,
            relevantDates: {
              assessmentDate: ctx.assessmentDate,
            },
            priority: 'High',
            status: 'Action Required',
            recommendedAction:
              'Locate the manufacturer or third-party NABL calibration certificate and enter the calibration record along with supporting PDF evidence.',
            assignedRole: 'calibration_coordinator',
            createdAt: '2026-10-01T08:00:00Z',
          });
        }
      }
      return findings;
    },
  },

  {
    ruleId: 'CAL-002',
    version: '2.0.0',
    title: 'Recorded Calibration Validity Elapsed (Instrument Expiry)',
    category: 'CALIBRATION',
    description:
      'The recorded validity end date of the instrument calibration has passed as of the evaluation assessment date.',
    defaultPriority: 'High',
    evaluate: (ctx) => {
      const findings: Finding[] = [];
      for (const cal of ctx.calibrations) {
        if (cal.validityEndDate && cal.validityEndDate < ctx.assessmentDate) {
          const inst = ctx.instruments.find((i) => i.id === cal.instrumentId || i.instrumentId === cal.instrumentId);
          const daysOverdue = Math.floor(
            (new Date(ctx.assessmentDate).getTime() - new Date(cal.validityEndDate).getTime()) / (1000 * 3600 * 24)
          );

          findings.push({
            id: `FND-CAL002-${cal.id}`,
            findingCode: `FND-CAL-002-${cal.recordId}`,
            ruleId: 'CAL-002',
            ruleVersion: '2.0.0',
            title: `Instrument Calibration Validity Expired for ${inst?.instrumentId || cal.instrumentId}`,
            explanation: `Certificate ${cal.certificateNumber} expired on ${cal.validityEndDate}. Current assessment date is ${ctx.assessmentDate} (${daysOverdue} days past validity period). The instrument must not be deployed for new in-line or final quality inspections until re-calibration is executed.`,
            triggeringRecordType: 'calibration',
            triggeringRecordId: cal.id,
            triggeringRecordLabel: `${cal.recordId} (${cal.certificateNumber})`,
            relatedRecordType: 'instrument',
            relatedRecordId: inst?.id,
            relatedRecordLabel: inst ? `${inst.instrumentId} - ${inst.name}` : undefined,
            evidenceDocumentId: cal.documentId,
            relevantDates: {
              eventDate: cal.calibrationDate,
              validityEndDate: cal.validityEndDate,
              assessmentDate: ctx.assessmentDate,
            },
            priority: 'High',
            status: 'Open',
            recommendedAction:
              'Remove instrument from active production bench to calibration quarantine. Dispatch to accredited metrology laboratory for renewal.',
            assignedRole: 'calibration_coordinator',
            createdAt: '2026-10-02T09:00:00Z',
          });
        }
      }
      return findings;
    },
  },

  {
    ruleId: 'CAL-003',
    version: '2.1.0',
    title: 'Quality Test Performed Outside Calibration Validity Interval',
    category: 'TRACEABILITY',
    description:
      'A recorded quality test date falls after the instrument calibration validity end date (or before calibration date). Requires authorized human review.',
    defaultPriority: 'Critical',
    evaluate: (ctx) => {
      const findings: Finding[] = [];
      for (const test of ctx.tests) {
        // Find linked instrument
        const inst = ctx.instruments.find((i) => i.id === test.instrumentId || i.instrumentId === test.instrumentId);
        if (!inst) continue;

        // Find calibration record for this instrument
        const cal = ctx.calibrations.find((c) => c.instrumentId === inst.id || c.instrumentId === inst.instrumentId);
        if (!cal) continue;

        // Compare testDate with validity interval
        const testDate = test.testDate;
        const calEndDate = cal.validityEndDate;
        const calStartDate = cal.calibrationDate;

        if (calEndDate && testDate > calEndDate) {
          const daysAfter = Math.floor(
            (new Date(testDate).getTime() - new Date(calEndDate).getTime()) / (1000 * 3600 * 24)
          );

          findings.push({
            id: `FND-CAL003-${test.id}`,
            findingCode: `FND-CAL-003-${test.testId}`,
            ruleId: 'CAL-003',
            ruleVersion: '2.1.0',
            title: `Quality Test ${test.testId} Executed After Calibration Validity Concluded`,
            explanation: `Quality Test ${test.testId} (Type: ${test.testType}) for Product ${test.productId} was conducted on ${testDate}. However, the recorded calibration certificate (${cal.certificateNumber}) for instrument ${inst.instrumentId} expired on ${calEndDate} (${daysAfter} days earlier). Note: Historical test T-001 conducted on 2026-09-20 remains valid because its test date was inside the validity window. This finding specifically targets test ${test.testId}.`,
            triggeringRecordType: 'test',
            triggeringRecordId: test.id,
            triggeringRecordLabel: `${test.testId} (Batch: ${test.batchId})`,
            relatedRecordType: 'instrument',
            relatedRecordId: inst.id,
            relatedRecordLabel: `${inst.instrumentId} (${cal.recordId})`,
            evidenceDocumentId: test.supportingDocumentId,
            relevantDates: {
              eventDate: testDate,
              validityEndDate: calEndDate,
              assessmentDate: ctx.assessmentDate,
            },
            priority: 'Critical',
            status: 'Action Required',
            recommendedAction:
              'Initiate CAPA to isolate Batch B-025. Send instrument for emergency calibration and perform secondary reference verification on retained batch sample.',
            assignedRole: 'quality_engineer',
            createdAt: '2026-10-05T19:05:00Z',
          });
        }
      }
      return findings;
    },
  },

  {
    ruleId: 'DOC-001',
    version: '1.1.0',
    title: 'Required Evidence Document Link Missing',
    category: 'DOCUMENT',
    description: 'A test, calibration, or certification record lacks an attached supporting evidence file.',
    defaultPriority: 'Medium',
    evaluate: (ctx) => {
      const findings: Finding[] = [];
      // Check tests without supporting document
      for (const t of ctx.tests) {
        if (!t.supportingDocumentId || !ctx.documents.find((d) => d.id === t.supportingDocumentId)) {
          findings.push({
            id: `FND-DOC001-TEST-${t.id}`,
            findingCode: `FND-DOC-001-${t.testId}`,
            ruleId: 'DOC-001',
            ruleVersion: '1.1.0',
            title: `Missing Supporting Test Sheet for ${t.testId}`,
            explanation: `Test ${t.testId} recorded a result of "${t.testResult}" but has no attached laboratory test report or digital raw log file in the evidence repository.`,
            triggeringRecordType: 'test',
            triggeringRecordId: t.id,
            triggeringRecordLabel: `${t.testId}`,
            relevantDates: {
              assessmentDate: ctx.assessmentDate,
            },
            priority: 'Medium',
            status: 'Open',
            recommendedAction: 'Upload the scanned bench test record or automated ATE log file to establish proof.',
            assignedRole: 'quality_engineer',
            createdAt: '2026-09-25T10:00:00Z',
          });
        }
      }
      return findings;
    },
  },

  {
    ruleId: 'DOC-002',
    version: '1.3.0',
    title: 'Document Metadata Inconsistent With Linked Master Record',
    category: 'DOCUMENT',
    description:
      'Extracted or recorded metadata on the evidence document (e.g. Serial Number, Model) conflicts with the master register entry.',
    defaultPriority: 'Critical',
    evaluate: (ctx) => {
      const findings: Finding[] = [];
      for (const doc of ctx.documents) {
        if (doc.extractedMetadata?.serialNumber && doc.linkedEntityType === 'instrument') {
          const inst = ctx.instruments.find((i) => i.id === doc.linkedEntityId || i.instrumentId === doc.linkedEntityId);
          if (inst && doc.extractedMetadata.serialNumber !== inst.serialNumber) {
            findings.push({
              id: `FND-DOC002-${doc.id}`,
              findingCode: `FND-DOC-002-${doc.docIdentifier}`,
              ruleId: 'DOC-002',
              ruleVersion: '1.3.0',
              title: `Serial Number Discrepancy on ${doc.docIdentifier}`,
              explanation: `Document "${doc.title}" contains extracted serial number "${doc.extractedMetadata.serialNumber}", which contradicts master register serial number "${inst.serialNumber}" for instrument ${inst.instrumentId}. This could indicate a mismatched certificate or typographical error on the calibration certificate.`,
              triggeringRecordType: 'document',
              triggeringRecordId: doc.id,
              triggeringRecordLabel: `${doc.docIdentifier} (${doc.title})`,
              relatedRecordType: 'instrument',
              relatedRecordId: inst.id,
              relatedRecordLabel: `${inst.instrumentId} (Expected: ${inst.serialNumber})`,
              evidenceDocumentId: doc.id,
              relevantDates: {
                assessmentDate: ctx.assessmentDate,
              },
              priority: 'Critical',
              status: 'Under Review',
              recommendedAction:
                'Inspect the physical instrument rating plate and request revised certificate from issuing laboratory if misprinted.',
              assignedRole: 'compliance_reviewer',
              createdAt: '2026-10-06T14:30:00Z',
            });
          }
        }
      }
      return findings;
    },
  },

  {
    ruleId: 'DOC-003',
    version: '1.0.0',
    title: 'Required Evidence Awaiting Human Verification',
    category: 'DOCUMENT',
    description:
      'Uploaded evidence has been processed or submitted but has not received authorized reviewer confirmation.',
    defaultPriority: 'Medium',
    evaluate: (ctx) => {
      const findings: Finding[] = [];
      for (const doc of ctx.documents) {
        if (doc.verificationState === 'Needs Human Verification' || doc.verificationState === 'Not Reviewed') {
          findings.push({
            id: `FND-DOC003-${doc.id}`,
            findingCode: `FND-DOC-003-${doc.docIdentifier}`,
            ruleId: 'DOC-003',
            ruleVersion: '1.0.0',
            title: `Unverified Evidence Document: ${doc.docIdentifier}`,
            explanation: `Document "${doc.title}" has status "${doc.verificationState}". Automatic extraction or technician upload must be verified by an authorized Compliance Reviewer or Lead Quality Engineer prior to formal audit closure.`,
            triggeringRecordType: 'document',
            triggeringRecordId: doc.id,
            triggeringRecordLabel: `${doc.docIdentifier}`,
            evidenceDocumentId: doc.id,
            relevantDates: {
              assessmentDate: ctx.assessmentDate,
            },
            priority: 'Medium',
            status: 'Open',
            recommendedAction:
              'Open the document detail view, review extracted fields, and approve or reject verification status.',
            assignedRole: 'compliance_reviewer',
            createdAt: '2026-10-05T18:15:00Z',
          });
        }
      }
      return findings;
    },
  },

  {
    ruleId: 'CERT-001',
    version: '1.0.0',
    title: 'Standard / Licence Approaching Expiration or Expired',
    category: 'CERTIFICATION',
    description:
      'Recorded certification validity ends within 30 days of the assessment date or has elapsed.',
    defaultPriority: 'High',
    evaluate: (ctx) => {
      const findings: Finding[] = [];
      for (const cert of ctx.certifications) {
        const expiryDate = new Date(cert.expiryDate).getTime();
        const assessDate = new Date(ctx.assessmentDate).getTime();
        const diffDays = Math.round((expiryDate - assessDate) / (1000 * 3600 * 24));

        if (diffDays <= 30) {
          findings.push({
            id: `FND-CERT001-${cert.id}`,
            findingCode: `FND-CERT-001-${cert.licenceNumber.split(' ')[0]}`,
            ruleId: 'CERT-001',
            ruleVersion: '1.0.0',
            title: `Certification Approaching Expiry: ${cert.licenceNumber}`,
            explanation: `Certification scope under ${cert.standardReference} expires on ${cert.expiryDate} (${diffDays} days remaining from assessment date ${ctx.assessmentDate}). Official guidelines require renewal filing at least 30 days prior to expiration.`,
            triggeringRecordType: 'certification',
            triggeringRecordId: cert.id,
            triggeringRecordLabel: `${cert.licenceNumber}`,
            relevantDates: {
              validityEndDate: cert.expiryDate,
              assessmentDate: ctx.assessmentDate,
            },
            priority: diffDays < 0 ? 'Critical' : 'High',
            status: 'Action Required',
            recommendedAction:
              'Submit renewal application dossier via BIS portal and verify payment of annual licence fee.',
            assignedRole: 'compliance_reviewer',
            createdAt: '2026-10-01T09:00:00Z',
          });
        }
      }
      return findings;
    },
  },

  {
    ruleId: 'CERT-002',
    version: '1.0.0',
    title: 'Product Model Not Covered in Certification Scope',
    category: 'CERTIFICATION',
    description:
      'A registered product model references mandatory standards but lacks a documented certification scope link.',
    defaultPriority: 'Medium',
    evaluate: (ctx) => {
      const findings: Finding[] = [];
      for (const prod of ctx.products) {
        // Check if product model is included in any certification's applicableModels
        const covered = ctx.certifications.some((cert) =>
          cert.applicableModels.some((m) => m === prod.modelNumber || m === prod.productCode)
        );

        if (!covered && prod.applicableStandards.length > 0) {
          findings.push({
            id: `FND-CERT002-${prod.id}`,
            findingCode: `FND-CERT-002-${prod.productCode}`,
            ruleId: 'CERT-002',
            ruleVersion: '1.0.0',
            title: `Model Scope Unverified for Product ${prod.productCode}`,
            explanation: `Product ${prod.productCode} (${prod.productName}, Model: ${prod.modelNumber}) references mandatory compliance standards (${prod.applicableStandards.join(', ')}), but this specific model is not listed under the documented certification scope models in any active certificate record.`,
            triggeringRecordType: 'certification',
            triggeringRecordId: prod.id,
            triggeringRecordLabel: `${prod.productCode} (${prod.modelNumber})`,
            relevantDates: {
              assessmentDate: ctx.assessmentDate,
            },
            priority: 'Medium',
            status: 'Under Review',
            recommendedAction:
              'Verify whether an inclusion endorsement was issued by BIS for this model number or apply for model addition.',
            assignedRole: 'compliance_reviewer',
            createdAt: '2026-10-02T10:00:00Z',
          });
        }
      }
      return findings;
    },
  },

  {
    ruleId: 'TRACE-001',
    version: '1.0.0',
    title: 'Quality Test References Uncalibrated Instrument',
    category: 'TRACEABILITY',
    description:
      'A recorded quality test references an instrument for which no valid calibration record exists in the system.',
    defaultPriority: 'Critical',
    evaluate: (ctx) => {
      const findings: Finding[] = [];
      for (const test of ctx.tests) {
        const inst = ctx.instruments.find((i) => i.id === test.instrumentId || i.instrumentId === test.instrumentId);
        if (!inst) continue;

        const cal = ctx.calibrations.find((c) => c.instrumentId === inst.id || c.instrumentId === inst.instrumentId);
        if (!cal) {
          findings.push({
            id: `FND-TRACE001-${test.id}`,
            findingCode: `FND-TRACE-001-${test.testId}`,
            ruleId: 'TRACE-001',
            ruleVersion: '1.0.0',
            title: `Quality Test ${test.testId} References Uncalibrated Instrument ${inst.instrumentId}`,
            explanation: `Quality Test ${test.testId} references instrument ${inst.instrumentId} (${inst.name}), but no calibration certificate record exists for this instrument. Traceability to national standards cannot be established.`,
            triggeringRecordType: 'test',
            triggeringRecordId: test.id,
            triggeringRecordLabel: `${test.testId}`,
            relatedRecordType: 'instrument',
            relatedRecordId: inst.id,
            relatedRecordLabel: inst.instrumentId,
            relevantDates: {
              eventDate: test.testDate,
              assessmentDate: ctx.assessmentDate,
            },
            priority: 'Critical',
            status: 'Action Required',
            recommendedAction:
              'Quarantine the affected batch and upload the missing calibration certificate or repeat test with a calibrated instrument.',
            assignedRole: 'quality_engineer',
            createdAt: '2026-10-03T09:00:00Z',
          });
        }
      }
      return findings;
    },
  },

  {
    ruleId: 'ACT-001',
    version: '1.0.0',
    title: 'Open Corrective Action (CAPA) Past Due Date',
    category: 'ACTION',
    description: 'A corrective action has not reached closure and its target resolution date has elapsed.',
    defaultPriority: 'High',
    evaluate: (ctx) => {
      const findings: Finding[] = [];
      for (const act of ctx.actions) {
        if (act.status !== 'Approved & Closed' && act.dueDate < ctx.assessmentDate) {
          const daysOverdue = Math.floor(
            (new Date(ctx.assessmentDate).getTime() - new Date(act.dueDate).getTime()) / (1000 * 3600 * 24)
          );

          findings.push({
            id: `FND-ACT001-${act.id}`,
            findingCode: `FND-ACT-001-${act.actionCode}`,
            ruleId: 'ACT-001',
            ruleVersion: '1.0.0',
            title: `Overdue Corrective Action: ${act.actionCode}`,
            explanation: `Corrective Action "${act.title}" assigned to ${act.assignedTo} was due on ${act.dueDate}. As of assessment date ${ctx.assessmentDate}, it is ${daysOverdue} days overdue. Current status is "${act.status}".`,
            triggeringRecordType: 'action',
            triggeringRecordId: act.id,
            triggeringRecordLabel: `${act.actionCode} (${act.title})`,
            relevantDates: {
              eventDate: act.dueDate,
              assessmentDate: ctx.assessmentDate,
            },
            priority: 'High',
            status: 'Action Required',
            recommendedAction:
              'Escalate to Department Lead. Complete the root cause analysis, upload resolution evidence, and submit for closure approval.',
            assignedRole: 'org_admin',
            createdAt: '2026-10-04T08:00:00Z',
          });
        }
      }
      return findings;
    },
  },
];

export function runComplianceEvaluation(context: RuleEvaluationContext): Finding[] {
  let allFindings: Finding[] = [];
  for (const rule of COMPLIANCE_RULES) {
    try {
      const generated = rule.evaluate(context);
      allFindings = allFindings.concat(generated);
    } catch (err) {
      console.error(`Error evaluating rule ${rule.ruleId}:`, err);
    }
  }
  return allFindings;
}
