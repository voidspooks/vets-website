const emptyMigration = savedData => savedData;

/**
 * Spouse date of birth was moved from /personal-information to the page
 * before /current-legal-name, so if the returnUrl indicates that the in
 * progress is on that page. We can't assume that the birth date is valid
 * so that's why we're including this redirect
 * @param {Object} savedData the saved formData and metadata
 * @returns {Object} the migrated formData and metadata
 */
const movedSpouseDob = savedData => {
  const { formData, metadata } = savedData;
  if (metadata.returnUrl?.includes('add-spouse/personal-information')) {
    metadata.returnUrl = '/add-spouse/current-legal-name';
  }
  return { formData, metadata };
};

/**
 * In PR #42528, the `benefitSchemaLabels` were changed from
 * ['ch35', 'fry', 'feca', 'other'] to ['ch35', 'fry', 'feca', 'none']. Adding
 * this migration to prevent issues with stale in-progress forms. It may be
 * too late now since the original PR was merged a month prior to adding this
 * migration
 * @param {Object} savedData the saved formData and metadata
 * @returns {Object} the migrated formData and metadata
 */
const migrateStudentBenefitToRadio = savedData => {
  const { formData, metadata } = savedData;
  const students = formData?.studentInformation;
  if (Array.isArray(students)) {
    const newStudents = students.map(student => {
      const benefit = student.typeOfProgramOrBenefit;
      if (benefit) {
        const selected =
          typeof benefit === 'object'
            ? Object.keys(benefit).find(key => benefit[key])
            : benefit;
        return {
          ...student,
          typeOfProgramOrBenefit:
            (selected === 'other' ? 'none' : selected) || 'none',
        };
      }
      return student;
    });
    formData.studentInformation = newStudents;
  }

  return { formData, metadata };
};

/**
 * In PR #43340, the `reasonMarriageEnded` options were changed from
 * ['Divorce', 'Annulment', 'Other'] (Death is transformed in a separate
 *  function) to ['Divorce', 'Other']. Adding this migration to prevent issues
 * with stale in-progress forms. It may be too late now since the original
 * PR was merged almost a month prior to adding this migration
 * @param {Object} savedData the saved formData and metadata
 * @returns {Object} the migrated formData and metadata
 */
const migrateReportDivorceReason = savedData => {
  const { formData, metadata } = savedData;
  if (formData?.reportDivorce?.reasonMarriageEnded === 'Annulment') {
    formData.reportDivorce.reasonMarriageEnded = 'Other';
  }
  return { formData, metadata };
};

const migrations = [
  emptyMigration,
  movedSpouseDob,
  migrateStudentBenefitToRadio,
  migrateReportDivorceReason,
];

export default migrations;
