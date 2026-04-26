import { expect } from 'chai';
import {
  uploadVoidedCheckUiSchema,
  uploadVoidedCheckSchema,
} from './uploadVoidedCheck';

describe('chapters/uploadVoidedCheck', () => {
  describe('uiSchema', () => {
    it('exports a uiSchema object', () => {
      expect(uploadVoidedCheckUiSchema).to.be.an('object');
    });

    it('has supportingDocuments.voidedCheckUpload key', () => {
      expect(uploadVoidedCheckUiSchema.supportingDocuments).to.be.an('object');
      expect(
        uploadVoidedCheckUiSchema.supportingDocuments.voidedCheckUpload,
      ).to.be.an('object');
    });

    it('voidedCheckUpload title mentions voided check', () => {
      const upload =
        uploadVoidedCheckUiSchema.supportingDocuments.voidedCheckUpload;
      expect(upload['ui:title'].toLowerCase()).to.include('voided');
    });
  });

  describe('schema', () => {
    it('exports a schema object', () => {
      expect(uploadVoidedCheckSchema).to.be.an('object');
    });

    it('supportingDocuments is required', () => {
      expect(uploadVoidedCheckSchema.required).to.include('supportingDocuments');
    });

    it('voidedCheckUpload is required inside supportingDocuments', () => {
      const sd = uploadVoidedCheckSchema.properties.supportingDocuments;
      expect(sd.required).to.include('voidedCheckUpload');
    });
  });
});