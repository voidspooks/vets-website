import { expect } from 'chai';
import sinon from 'sinon';
import plannedAddress from '../../../pages/plannedAddress';
import { FORM_21_4502, veteranFields } from '../../../definitions/constants';

describe('21-4502 plannedAddress page', () => {
  const { schema, uiSchema } = plannedAddress;
  const veteranSchema = schema.properties[veteranFields.parentObject];
  const veteranUiSchema = uiSchema[veteranFields.parentObject];
  const { PLANNED_ADDRESS: P } = FORM_21_4502;

  it('defines plannedAddress as optional', () => {
    expect(veteranSchema.properties[veteranFields.plannedAddress]).to.exist;
    const required = veteranSchema.required || [];
    expect(required).to.not.include(veteranFields.plannedAddress);
  });

  it('defines the not applicable checkbox', () => {
    expect(veteranSchema.properties[veteranFields.plannedAddressNotApplicable])
      .to.exist;
    expect(
      veteranUiSchema[veteranFields.plannedAddressNotApplicable]['ui:title'],
    ).to.equal(P.NOT_APPLICABLE);
  });

  it('does not mark address fields required before the user starts the section', () => {
    const plannedAddressUi = veteranUiSchema[veteranFields.plannedAddress];

    expect(plannedAddressUi.street['ui:required']({})).to.equal(false);
    expect(plannedAddressUi.city['ui:required']({})).to.equal(false);
    expect(plannedAddressUi.postalCode['ui:required']({})).to.equal(false);
    expect(plannedAddressUi.state['ui:required']({})).to.equal(false);
    expect(plannedAddressUi.country['ui:required']({})).to.equal(false);
  });

  it('marks address fields required after the user starts entering an address', () => {
    const plannedAddressUi = veteranUiSchema[veteranFields.plannedAddress];
    const formData = {
      veteran: {
        plannedAddress: {
          street: '123 Main St',
          country: 'USA',
        },
      },
    };

    expect(plannedAddressUi.street['ui:required'](formData)).to.equal(true);
    expect(plannedAddressUi.city['ui:required'](formData)).to.equal(true);
    expect(plannedAddressUi.postalCode['ui:required'](formData)).to.equal(true);
    expect(plannedAddressUi.state['ui:required'](formData)).to.equal(true);
    expect(plannedAddressUi.country['ui:required'](formData)).to.equal(true);
  });

  it('marks address fields required when the military base checkbox is selected', () => {
    const plannedAddressUi = veteranUiSchema[veteranFields.plannedAddress];
    const formData = {
      veteran: {
        plannedAddress: {
          isMilitary: true,
        },
      },
    };

    expect(plannedAddressUi.street['ui:required'](formData)).to.equal(true);
    expect(plannedAddressUi.city['ui:required'](formData)).to.equal(true);
    expect(plannedAddressUi.postalCode['ui:required'](formData)).to.equal(true);
    expect(plannedAddressUi.state['ui:required'](formData)).to.equal(true);
    expect(plannedAddressUi.country['ui:required'](formData)).to.equal(false);
  });

  it('shows the new page-level error when no address data is entered', () => {
    const validation =
      veteranUiSchema[veteranFields.plannedAddressNotApplicable][
        'ui:validations'
      ][0];
    const errors = { addError: sinon.spy() };

    validation(errors, false, {});

    expect(errors.addError.calledOnce).to.equal(true);
    expect(errors.addError.firstCall.args[0]).to.equal(P.ERROR_REQUIRED);
  });

  it('does not show the new page-level error when not applicable is selected', () => {
    const validation =
      veteranUiSchema[veteranFields.plannedAddressNotApplicable][
        'ui:validations'
      ][0];
    const errors = { addError: sinon.spy() };

    validation(errors, true, {});

    expect(errors.addError.called).to.equal(false);
  });
});
