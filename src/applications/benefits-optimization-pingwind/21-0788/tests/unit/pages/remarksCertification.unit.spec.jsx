import { expect } from 'chai';
import remarksCertification from '../../../pages/remarksCertification';
import { remarksCertificationText } from '../../../definitions/constants';

describe('21-0788 remarksCertification page', () => {
  const { schema, uiSchema } = remarksCertification;

  it('requires the certification checkbox', () => {
    expect(schema.required).to.deep.equal(['certifyStatement']);
  });

  it('defines remarks, certifyStatement, and the penalty view', () => {
    expect(schema.properties).to.include.keys(
      'remarks',
      'certifyStatement',
      'view:penaltyAlert',
    );
    expect(schema.properties.remarks.maxLength).to.equal(2000);
  });

  it('fixes ui:order so the penalty alert renders last', () => {
    expect(uiSchema['ui:order']).to.deep.equal([
      'remarks',
      'certifyStatement',
      'view:penaltyAlert',
    ]);
  });

  it('uses the certification error text from constants', () => {
    expect(uiSchema.certifyStatement['ui:errorMessages'].required).to.equal(
      remarksCertificationText.certifyError,
    );
    expect(uiSchema.certifyStatement['ui:errorMessages'].enum).to.equal(
      remarksCertificationText.certifyError,
    );
  });

  it('renders the penalty alert as a view field', () => {
    const alertUi = uiSchema['view:penaltyAlert'];
    expect(alertUi['ui:field']).to.equal('ViewField');
    expect(alertUi['ui:description']).to.exist;
  });
});
