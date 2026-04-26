import { expect } from 'chai';
import {
  uploadVoidedCheckUiSchema,
  uploadVoidedCheckSchema,
} from './uploadVoidedCheck';

describe('config/chapters/uploadVoidedCheck', () => {
  it('uiSchema has supportingDocuments.voidedCheckUpload', () => {
    expect(uploadVoidedCheckUiSchema).to.have.property(
      'supportingDocuments',
    );
    expect(
      uploadVoidedCheckUiSchema.supportingDocuments,
    ).to.have.property('voidedCheckUpload');
  });

  it('voidedCheckUpload uiSchema has a title mentioning voided check', () => {
    const field =
      uploadVoidedCheckUiSchema.supportingDocuments.voidedCheckUpload;
    expect(field['ui:title']).to.be.a('string');
    expect(field['ui:title'].toLowerCase()).to.include('voided');
  });

  it('schema has voidedCheckUpload property', () => {
    const schema =
      uploadVoidedCheckSchema.properties.supportingDocuments.properties
        .voidedCheckUpload;
    expect(schema).to.exist;
  });
});