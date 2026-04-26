import { expect } from 'chai';
import {
  uploadDD2863UiSchema,
  uploadDD2863Schema,
} from './uploadDD2863';

describe('chapters/uploadDD2863', () => {
  describe('uiSchema', () => {
    it('exports a uiSchema object', () => {
      expect(uploadDD2863UiSchema).to.be.an('object');
    });

    it('has supportingDocuments.dd2863Upload key', () => {
      expect(uploadDD2863UiSchema.supportingDocuments).to.be.an('object');
      expect(
        uploadDD2863UiSchema.supportingDocuments.dd2863Upload,
      ).to.be.an('object');
    });

    it('dd2863Upload has a title', () => {
      const upload = uploadDD2863UiSchema.supportingDocuments.dd2863Upload;
      expect(upload['ui:title']).to.be.a('string');
      expect(upload['ui:title']).to.include('DD Form 2863');
    });
  });

  describe('schema', () => {
    it('exports a schema object', () => {
      expect(uploadDD2863Schema).to.be.an('object');
    });

    it('supportingDocuments is required', () => {
      expect(uploadDD2863Schema.required).to.include('supportingDocuments');
    });

    it('dd2863Upload is required inside supportingDocuments', () => {
      const sd = uploadDD2863Schema.properties.supportingDocuments;
      expect(sd.required).to.include('dd2863Upload');
    });

    it('dd2863Upload schema is an object', () => {
      const upload =
        uploadDD2863Schema.properties.supportingDocuments.properties
          .dd2863Upload;
      expect(upload).to.be.an('object');
    });
  });
});