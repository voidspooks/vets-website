import { expect } from 'chai';
import migrations from '../../../config/migrations';
import { certifierPages } from '../../../chapters/certifier';

const EXAMPLE_METADATA = {
  version: 0,
  prefill: true,
  returnUrl: '/review-applicants',
};
const STALE_CERTIFIER_PATH = `/${Object.values(certifierPages)[0].path}`;

const clone = value => JSON.parse(JSON.stringify(value));

const runMigration = (
  index,
  { formData = {}, metadata = EXAMPLE_METADATA } = {},
) =>
  migrations[index]({
    formData: clone(formData),
    metadata: clone(metadata),
  });

describe('10-10d-extended migrations', () => {
  context('migration 0 -> 1: flatten certifier relationship', () => {
    const SHARED_ADDRESS_KEY = 'view:sharesAddressWith';
    const APPLICANT_ADDRESS_KEY = 'view:applicantSharedAddress';

    it('should flatten certifierRelationship from nested object', () => {
      const formData = {
        certifierRelationship: { relationshipToVeteran: { other: true } },
      };
      const { formData: migrated } = runMigration(0, { formData });
      expect(migrated.certifierRelationship).to.deep.equal({ other: true });
    });

    it('should not modify form data when certifierRelationship does not exist', () => {
      const formData = { applicantName: { first: 'John', last: 'Doe' } };
      const { formData: migrated } = runMigration(0, { formData });
      expect(migrated).to.deep.equal(formData);
    });

    it('should remove original root-level address sharing key', () => {
      const formData = { [SHARED_ADDRESS_KEY]: 'na' };
      const { formData: migratedData } = runMigration(0, { formData });
      expect(migratedData).to.not.have.property(SHARED_ADDRESS_KEY);
    });

    it('should migrate applicant address sharing key to new key name', () => {
      const formData = {
        applicants: [{ ssn: '411111111', [SHARED_ADDRESS_KEY]: 'na' }],
      };
      const { formData: migratedData } = runMigration(0, { formData });
      expect(migratedData.applicants[0]).to.deep.equal({
        ssn: '411111111',
        [APPLICANT_ADDRESS_KEY]: 'na',
      });
    });

    it('should not modify applicants without address sharing key', () => {
      const formData = { applicants: [{ ssn: '411111111' }] };
      const { formData: migratedData } = runMigration(0, { formData });
      expect(migratedData.applicants).to.deep.equal(formData.applicants);
    });

    it('should handle mixed applicants (some with key, some without)', () => {
      const formData = {
        applicants: [
          { ssn: '411111111', [SHARED_ADDRESS_KEY]: 'na' },
          { ssn: '311111111' },
        ],
      };
      const { formData: migratedData } = runMigration(0, { formData });
      expect(migratedData.applicants).to.deep.equal([
        { ssn: '411111111', [APPLICANT_ADDRESS_KEY]: 'na' },
        { ssn: '311111111' },
      ]);
    });

    it('should remove root key when applicants do not yet exist', () => {
      const formData = { [SHARED_ADDRESS_KEY]: 'na' };
      const { formData: migratedData } = runMigration(0, { formData });
      expect(migratedData).to.deep.equal({});
    });

    it('should preserve other form data fields', () => {
      const formData = {
        certifierRelationship: { relationshipToVeteran: { child: true } },
        applicantName: { first: 'Jane', last: 'Smith' },
      };
      const { formData: migrated } = runMigration(0, { formData });
      expect(migrated.applicantName).to.deep.equal({
        first: 'Jane',
        last: 'Smith',
      });
    });

    it('should preserve metadata when returnUrl is not a certifier path', () => {
      const formData = {
        certifierRelationship: { relationshipToVeteran: { parent: true } },
      };
      const { metadata } = runMigration(0, { formData });
      expect(metadata).to.deep.equal(EXAMPLE_METADATA);
    });

    it('should not reset returnUrl when it does not point to a certifier page', () => {
      const metadata = {
        version: 0,
        prefill: true,
        returnUrl: '/review-and-submit',
      };
      const { metadata: migrated } = runMigration(0, { metadata });
      expect(migrated).to.deep.equal(metadata);
    });

    ['returnUrl', 'return_url'].forEach(returnUrlKey => {
      it(`should reset stale ${returnUrlKey} when it points to a certifier page`, () => {
        const metadata = {
          version: 0,
          prefill: true,
          [returnUrlKey]: STALE_CERTIFIER_PATH,
        };
        const { metadata: migrated } = runMigration(0, { metadata });
        expect(migrated).to.deep.equal({
          ...metadata,
          returnUrl: '/who-is-applying',
        });
      });
    });
  });
});
