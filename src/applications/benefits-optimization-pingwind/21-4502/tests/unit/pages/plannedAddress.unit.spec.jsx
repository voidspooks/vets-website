import { expect } from 'chai';
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

  it('hides the address when not applicable is checked', () => {
    const addressUiOptions =
      veteranUiSchema[veteranFields.plannedAddress]['ui:options'];
    const formData = { veteran: { plannedAddressNotApplicable: true } };

    expect(addressUiOptions.hideIf(formData)).to.equal(true);
  });

  it('shows the address when not applicable is not checked', () => {
    const addressUiOptions =
      veteranUiSchema[veteranFields.plannedAddress]['ui:options'];
    const formData = { veteran: { plannedAddressNotApplicable: false } };

    expect(addressUiOptions.hideIf(formData)).to.equal(false);
  });

  it('shows the address by default when not applicable is undefined', () => {
    const addressUiOptions =
      veteranUiSchema[veteranFields.plannedAddress]['ui:options'];

    expect(addressUiOptions.hideIf({})).to.equal(false);
  });

  it('marks address fields required when address is visible', () => {
    const plannedAddressUi = veteranUiSchema[veteranFields.plannedAddress];
    const formData = {
      veteran: {
        plannedAddress: {
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

  it('does not require country when military base checkbox is selected', () => {
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

  it('does not require address fields when not applicable is checked', () => {
    const plannedAddressUi = veteranUiSchema[veteranFields.plannedAddress];
    const formData = {
      veteran: {
        plannedAddressNotApplicable: true,
        plannedAddress: {
          street: '123 Main St',
          country: 'USA',
        },
      },
    };

    expect(plannedAddressUi.street['ui:required'](formData)).to.equal(false);
    expect(plannedAddressUi.city['ui:required'](formData)).to.equal(false);
    expect(plannedAddressUi.postalCode['ui:required'](formData)).to.equal(
      false,
    );
    expect(plannedAddressUi.state['ui:required'](formData)).to.equal(false);
    expect(plannedAddressUi.country['ui:required'](formData)).to.equal(false);
  });
});
