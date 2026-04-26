import { expect } from 'chai';
import {
  uploadDD2863UiSchema,
  uploadDD2863Schema,
} from './uploadDD2863';

describe('config/chapters/uploadDD2863', () => {
  it('uiSchema has supportingDocuments.dd2863Upload', () => {
    expect(uploadDD2863UiSchema).to.have.property('supportingDocuments');
    expect(
      uploadDD2863UiSchema.supportingDocuments,
    ).to.have.property('dd2863Upload');
  });

  it('dd2863Upload uiSchema has a title', () => {
    const field = uploadDD2863UiSchema.supportingDocuments.dd2863Upload;
    expect(field['ui:title']).to.be.a('string');
    expect(field['ui:title']).to.include('DD Form 2863');
  });

  it('schema requires dd2863Upload', () => {
    const required =
      uploadDD2863Schema.properties.supportingDocuments.required;
    expect(required).to.include('dd2863Upload');
  });

  it('dd2863Upload schema is an object with the expected shape', () => {
    const schema =
      uploadDD2863Schema.properties.supportingDocuments.properties
        .dd2863Upload;
    expect(schema).to.exist;
    expect(schema.type).to.be.a('string');
  });
});