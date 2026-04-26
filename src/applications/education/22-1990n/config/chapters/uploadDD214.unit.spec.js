import { expect } from 'chai';
import {
  uploadDD214UiSchema,
  uploadDD214Schema,
} from './uploadDD214';

describe('config/chapters/uploadDD214', () => {
  it('uiSchema has supportingDocuments.dd214Upload', () => {
    expect(uploadDD214UiSchema).to.have.property('supportingDocuments');
    expect(uploadDD214UiSchema.supportingDocuments).to.have.property(
      'dd214Upload',
    );
  });

  it('dd214Upload uiSchema has a title mentioning DD Form 214', () => {
    const field = uploadDD214UiSchema.supportingDocuments.dd214Upload;
    expect(field['ui:title']).to.be.a('string');
    expect(field['ui:title']).to.include('DD Form 214');
  });

  it('dd214Upload required function returns false when on terminal leave', () => {
    const reqFn =
      uploadDD214UiSchema.supportingDocuments.dd214Upload['ui:required'];
    if (reqFn) {
      expect(
        reqFn({ serviceInformation: { isOnTerminalLeave: true } }),
      ).to.equal(false);
      expect(
        reqFn({ serviceInformation: { isOnTerminalLeave: false } }),
      ).to.equal(true);
    }
  });

  it('schema has dd214Upload property', () => {
    const schema =
      uploadDD214Schema.properties.supportingDocuments.properties
        .dd214Upload;
    expect(schema).to.exist;
  });
});