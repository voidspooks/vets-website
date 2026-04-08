import { expect } from 'chai';
import veteranDisabilityCompensation from '../../../pages/veteranDisabilityCompensation';
import {
  applicationInfoFields,
  FORM_21_4502,
} from '../../../definitions/constants';

describe('21-4502 veteranDisabilityCompensation page', () => {
  const { schema, uiSchema } = veteranDisabilityCompensation;
  const appSchema = schema.properties[applicationInfoFields.parentObject];
  const appUiSchema = uiSchema[applicationInfoFields.parentObject];
  const { VETERAN_DISABILITY_COMPENSATION: V } = FORM_21_4502;

  it('requires veteranDisabilityCompensation', () => {
    expect(appSchema.required).to.include(
      applicationInfoFields.veteranDisabilityCompensation,
    );
  });

  it('defines appliedDisabilityCompensationPlace and appliedDisabilityCompensationDate', () => {
    expect(
      appSchema.properties[
        applicationInfoFields.appliedDisabilityCompensationPlace
      ],
    ).to.exist;
    expect(
      appSchema.properties[
        applicationInfoFields.appliedDisabilityCompensationDate
      ],
    ).to.exist;
  });

  it('uses the custom required messages', () => {
    expect(
      appUiSchema[applicationInfoFields.veteranDisabilityCompensation][
        'ui:errorMessages'
      ].required,
    ).to.equal(V.ERROR_APPLIED);
    expect(
      appUiSchema[applicationInfoFields.appliedDisabilityCompensationPlace][
        'ui:errorMessages'
      ].required,
    ).to.equal(V.ERROR_IF_YES);
    expect(
      appUiSchema[applicationInfoFields.appliedDisabilityCompensationPlace][
        'ui:required'
      ],
    ).to.be.a('function');
    expect(
      appUiSchema[applicationInfoFields.appliedDisabilityCompensationPlace][
        'ui:required'
      ]({
        applicationInfo: {
          [applicationInfoFields.veteranDisabilityCompensation]: true,
        },
      }),
    ).to.equal(true);
  });

  it('uses the custom date hint and messages', () => {
    const dateUi =
      appUiSchema[applicationInfoFields.appliedDisabilityCompensationDate];

    expect(dateUi['ui:options'].hint).to.equal(V.HINT_DATE_APPLIED);
    expect(dateUi['ui:options'].hideIf).to.be.a('function');
    expect(
      dateUi['ui:options'].hideIf({
        applicationInfo: {
          [applicationInfoFields.veteranDisabilityCompensation]: true,
        },
      }),
    ).to.equal(false);
    expect(dateUi['ui:errorMessages'].required).to.equal(
      V.ERROR_DATE_APPLIED_REQUIRED,
    );
    expect(dateUi['ui:errorMessages'].pattern).to.equal(
      V.ERROR_DATE_APPLIED_INVALID,
    );
    expect(dateUi['ui:validations']).to.have.length(1);
  });
});
