import { expect } from 'chai';
import informationRequired from '../../../pages/informationRequired';

describe('21-0788 informationRequired page', () => {
  const { schema } = informationRequired;

  it('should require both acknowledgement fields', () => {
    expect(schema.required).to.include.members([
      'formPurposeAcknowledged',
      'privacyActAcknowledged',
    ]);
  });

  it('should define acknowledgement properties', () => {
    expect(schema.properties).to.include.keys(
      'formPurposeAcknowledged',
      'privacyActAcknowledged',
    );
  });
});
