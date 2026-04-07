import { expect } from 'chai';

import migrations from '../../config/migrations';

describe('Migrations', () => {
  const runMigrations = savedData =>
    migrations.reduce((data, migration) => migration(data), savedData);

  it('should run all migrations', () => {
    const savedData = {
      formData: { test: true },
      metadata: {
        returnUrl: '/veteran-information',
      },
    };
    const migratedData = runMigrations(savedData);

    expect(migratedData).to.deep.equal(savedData);
  });

  it('should run all migrations and return correct returnUrl redirect', () => {
    const savedData = {
      formData: { test: true },
      metadata: {
        returnUrl: '/add-spouse/personal-information',
      },
    };
    const migratedData = runMigrations(savedData);

    expect(migratedData).to.deep.equal({
      formData: { test: true },
      metadata: {
        returnUrl: '/add-spouse/current-legal-name',
      },
    });
  });

  it('should convert old object typeOfProgramOrBenefit to string', () => {
    const savedData = {
      formData: {
        studentInformation: [
          { typeOfProgramOrBenefit: 'other' },
          { typeOfProgramOrBenefit: 'ch35' },
          { typeOfProgramOrBenefit: 'fry' },
          { typeOfProgramOrBenefit: 'feca' },
          { typeOfProgramOrBenefit: 'none' },
        ],
      },
      metadata: { returnUrl: '/report-674' },
    };
    const migratedData = runMigrations(savedData);

    const results = migratedData.formData.studentInformation.map(
      student => student.typeOfProgramOrBenefit,
    );
    expect(results).to.deep.equal(['none', 'ch35', 'fry', 'feca', 'none']);
  });

  it('should leave string typeOfProgramOrBenefit unchanged', () => {
    const savedData = {
      formData: {
        studentInformation: [{ typeOfProgramOrBenefit: 'ch35' }],
      },
      metadata: { returnUrl: '/report-674' },
    };
    const migratedData = runMigrations(savedData);

    expect(
      migratedData.formData.studentInformation[0].typeOfProgramOrBenefit,
    ).to.equal('ch35');
  });

  it('should convert reasonMarriageEnded of Annulment to Other', () => {
    const savedData = {
      formData: {
        reportDivorce: { reasonMarriageEnded: 'Annulment' },
      },
      metadata: { returnUrl: '/report-674' },
    };
    const migratedData = runMigrations(savedData);

    expect(migratedData.formData.reportDivorce.reasonMarriageEnded).to.equal(
      'Other',
    );
  });

  it('should leave reasonMarriageEnded unchanged if not Annulment', () => {
    const savedData = {
      formData: {
        reportDivorce: { reasonMarriageEnded: 'Divorce' },
      },
      metadata: { returnUrl: '/report-674' },
    };
    const migratedData = runMigrations(savedData);

    expect(migratedData.formData.reportDivorce.reasonMarriageEnded).to.equal(
      'Divorce',
    );
  });
});
