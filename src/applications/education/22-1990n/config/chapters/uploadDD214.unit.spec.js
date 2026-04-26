import { expect } from 'chai';
import {
  uploadDD214UiSchema,
  uploadDD214Schema,
} from './uploadDD214';

describe('chapters/uploadDD214', () => {
  describe('uiSchema', () => {
    it('exports a uiSchema object', () => {
      expect(uploadDD214UiSchema).to.be.an('object');
    });

    it('has supportingDocuments.dd214Upload key', () => {
      expect(uploadDD214UiSchema.supportingDocuments).to.be.an('object');
      expect(uploadDD214UiSchema.supportingDocuments.dd214Upload).to.be.an(
        'object',
      );
    });

    it('dd214Upload title mentions DD Form 214', () => {
      const upload = uploadDD214UiSchema.supportingDocuments.dd214Upload;
      expect(upload['ui:title']).to.include('DD Form 214');
    });
  });

  describe('schema', () => {
    it('exports a schema object', () => {
      expect(uploadDD214Schema).to.be.an('object');
    });

    it('dd214Upload schema is an object', () => {
      const upload =
        uploadDD214Schema.properties.supportingDocuments.properties.dd214Upload;
      expect(upload).to.be.an('object');
    });
  });
});