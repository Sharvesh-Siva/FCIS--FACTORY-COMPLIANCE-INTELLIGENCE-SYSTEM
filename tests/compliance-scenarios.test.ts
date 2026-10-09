import assert from 'node:assert';
import { runComplianceEvaluation, COMPLIANCE_RULES } from '../src/services/ruleEngine';
import {
  INITIAL_ASSESSMENT_DATE,
  INITIAL_INSTRUMENTS,
  INITIAL_CALIBRATIONS,
  INITIAL_TESTS,
  INITIAL_DOCUMENTS,
  INITIAL_CERTIFICATIONS,
  INITIAL_ACTIONS,
  INITIAL_PRODUCTS,
} from '../src/services/mockData';

console.log('--- STARTING FCIS COMPLIANCE SCENARIOS AUDIT TESTS ---');

const baseContext = {
  assessmentDate: INITIAL_ASSESSMENT_DATE, // '2026-10-09'
  instruments: INITIAL_INSTRUMENTS,
  calibrations: INITIAL_CALIBRATIONS,
  tests: INITIAL_TESTS,
  documents: INITIAL_DOCUMENTS,
  certifications: INITIAL_CERTIFICATIONS,
  actions: INITIAL_ACTIONS,
  products: INITIAL_PRODUCTS,
};

// 1. Verify Assessment Date
assert.strictEqual(INITIAL_ASSESSMENT_DATE, '2026-10-09', 'Assessment date must be exactly 2026-10-09');
console.log('✓ Scenario 1: Fixed assessment benchmark date is 9 October 2026');

// Run rule evaluation
const findings = runComplianceEvaluation(baseContext);

// 2. Verify DMM-104 calibration expiry (Rule CAL-002)
const dmm104Cal = INITIAL_CALIBRATIONS.find((c) => c.instrumentId === 'INST-DMM-104');
assert.ok(dmm104Cal, 'DMM-104 calibration record must exist');
assert.strictEqual(dmm104Cal.validityEndDate, '2026-10-01', 'DMM-104 validity must end 2026-10-01');

const cal002Finding = findings.find((f) => f.ruleId === 'CAL-002' && f.triggeringRecordId === dmm104Cal.id);
assert.ok(cal002Finding, 'CAL-002 must trigger for expired instrument DMM-104');
console.log('✓ Scenario 2: CAL-002 triggered for DMM-104 (validity ended 2026-10-01 vs 2026-10-09)');

// 3. Verify Test T-001 is NOT flagged solely because instrument validity is expired today (Rule CAL-003)
const t001 = INITIAL_TESTS.find((t) => t.id === 'T-001');
assert.ok(t001, 'Test T-001 must exist');
assert.strictEqual(t001.testDate, '2026-09-20', 'T-001 testDate must be 2026-09-20');
assert.ok(t001.testDate <= dmm104Cal.validityEndDate, 'T-001 test date was within calibration validity');

const cal003ForT001 = findings.find((f) => f.ruleId === 'CAL-003' && f.triggeringRecordId === 'T-001');
assert.strictEqual(cal003ForT001, undefined, 'CRITICAL: T-001 must NOT be flagged by CAL-003');
console.log('✓ Scenario 3: Test T-001 (2026-09-20) occurred within validity interval and is NOT flagged by CAL-003');

// 4. Verify Test T-002 triggers CAL-003 because test date (2026-10-05) is after validity end date (2026-10-01)
const t002 = INITIAL_TESTS.find((t) => t.id === 'T-002');
assert.ok(t002, 'Test T-002 must exist');
assert.strictEqual(t002.testDate, '2026-10-05', 'T-002 testDate must be 2026-10-05');
assert.ok(t002.testDate > dmm104Cal.validityEndDate, 'T-002 test date was after calibration validity ended');

const cal003ForT002 = findings.find((f) => f.ruleId === 'CAL-003' && f.triggeringRecordId === 'T-002');
assert.ok(cal003ForT002, 'CRITICAL: T-002 must trigger CAL-003 review');
assert.strictEqual(cal003ForT002.priority, 'Critical', 'T-002 finding priority must be Critical');
console.log('✓ Scenario 4: Test T-002 (2026-10-05) executed after DMM-104 validity elapsed and triggers Critical CAL-003 review');

// 5. Verify Missing Calibration Evidence for TH-401 (Rule CAL-001)
const cal001Finding = findings.find((f) => f.ruleId === 'CAL-001' && f.triggeringRecordId === 'INST-TH-401');
assert.ok(cal001Finding, 'CAL-001 must trigger for instrument TH-401 without calibration record');
console.log('✓ Scenario 5: CAL-001 triggered for TH-401 (instrument has no calibration record)');

// 6. Verify Serial Number Mismatch on DOC-MISMATCH-99 (Rule DOC-002)
const doc002Finding = findings.find((f) => f.ruleId === 'DOC-002' && f.triggeringRecordId === 'DOC-MISMATCH-99');
assert.ok(doc002Finding, 'DOC-002 must trigger for DOC-MISMATCH-99 (SN-104B-INCONSISTENT vs SN-104A)');
console.log('✓ Scenario 6: DOC-002 triggered for serial number conflict on DOC-MISMATCH-99');

// 7. Verify Unverified Evidence (Rule DOC-003)
const doc003Finding = findings.find((f) => f.ruleId === 'DOC-003');
assert.ok(doc003Finding, 'DOC-003 must trigger for unverified documents');
console.log('✓ Scenario 7: DOC-003 triggered for documents awaiting human verification');

// 8. Verify Certification Expiry Window (Rule CERT-001)
const cert001Finding = findings.find((f) => f.ruleId === 'CERT-001' && f.triggeringRecordId === 'CERT-01');
assert.ok(cert001Finding, 'CERT-001 must trigger for CERT-01 expiring 2026-10-31 (within 30 days)');
console.log('✓ Scenario 8: CERT-001 triggered for certification licence expiring within 30 days');

// 9. Verify Overdue Corrective Action (Rule ACT-001)
const act001Finding = findings.find((f) => f.ruleId === 'ACT-001' && f.triggeringRecordId === 'ACT-001');
assert.ok(act001Finding, 'ACT-001 must trigger for CAPA-2026-001 (due date 2026-10-03 vs assessment date 2026-10-09)');
console.log('✓ Scenario 9: ACT-001 triggered for overdue CAPA-2026-001');

// 10. Verify Model Scope Consistency (Rule CERT-002)
const cert002Finding = findings.find((f) => f.ruleId === 'CERT-002' && f.triggeringRecordId === 'P-002');
assert.ok(cert002Finding, 'CERT-002 must trigger for product P-002 model DC-CTRL-V2-ARM not covered in cert');
console.log('✓ Scenario 10: CERT-002 triggered for product P-002 model scope verification');

console.log('--- ALL 10 COMPLIANCE RULE SCENARIOS PASSED VERIFICATION ---');
