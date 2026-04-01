import { expect } from 'chai';
import page from '../../../../config/chapters/04-household-information/reasonForSeparation';

describe('Reason for separation page', () => {
  const { uiSchema, schema } = page;

  it('uiSchema contains separationDueToAssignedReasons radio', () => {
    expect(uiSchema).to.be.an('object');
    expect(
      uiSchema.separationDueToAssignedReasons,
      'separationDueToAssignedReasons missing',
    ).to.exist;
  });

  it('schema requires separationDueToAssignedReasons', () => {
    expect(schema).to.be.an('object');
    expect(schema.required).to.include('separationDueToAssignedReasons');
  });
});
