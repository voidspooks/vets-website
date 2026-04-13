import { expect } from 'chai';
import migrations from '../../../config/migrations';

const EXAMPLE_METADATA = {
  version: 0,
  prefill: true,
  returnUrl: '/review-applicants',
};

const runMigration = (index, formData, metadata = EXAMPLE_METADATA) =>
  migrations[index]({
    formData: JSON.parse(JSON.stringify(formData)),
    metadata,
  });

describe('10-10d-extended migrations', () => {
  context('migration 0 -> 1: flatten certifier relationship', () => {
    it('should flatten certifierRelationship from nested object', () => {
      const formData = {
        certifierRelationship: { relationshipToVeteran: { other: true } },
      };
      const { formData: migrated } = runMigration(0, formData);
      expect(migrated.certifierRelationship).to.deep.equal({ other: true });
    });

    it('should not modify form data when certifierRelationship does not exist', () => {
      const formData = { applicantName: { first: 'John', last: 'Doe' } };
      const { formData: migrated } = runMigration(0, formData);
      expect(migrated).to.deep.equal(formData);
    });

    it('should preserve other form data fields', () => {
      const formData = {
        certifierRelationship: { relationshipToVeteran: { child: true } },
        applicantName: { first: 'Jane', last: 'Smith' },
      };
      const { formData: migrated } = runMigration(0, formData);
      expect(migrated.applicantName).to.deep.equal({
        first: 'Jane',
        last: 'Smith',
      });
    });

    it('should preserve metadata', () => {
      const formData = {
        certifierRelationship: { relationshipToVeteran: { parent: true } },
      };
      const { metadata } = runMigration(0, formData);
      expect(metadata).to.deep.equal(EXAMPLE_METADATA);
    });
  });
});
