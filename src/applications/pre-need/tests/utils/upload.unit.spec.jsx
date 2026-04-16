import { expect } from 'chai';
import { fileUploadUi } from '../../utils/upload';

describe('pre-need upload utilities', () => {
  describe('fileUploadUi', () => {
    it('should create file upload UI schema with label', () => {
      const content = {
        label: 'Upload supporting documents',
        description: 'Please upload any supporting documents',
      };

      const result = fileUploadUi(content);

      expect(result).to.be.an('object');
      expect(result['ui:description']).to.equal(content.description);
    });

    it('should create file upload UI schema without label', () => {
      const content = {
        description: 'Please upload any supporting documents',
      };

      const result = fileUploadUi(content);

      expect(result).to.be.an('object');
      expect(result['ui:description']).to.equal(content.description);
    });

    it('should include correct file upload options', () => {
      const content = {
        label: 'Documents',
        description: 'Upload documents',
      };

      const result = fileUploadUi(content);

      expect(result['ui:options'].buttonText).to.equal('Upload file');
      expect(result['ui:options'].addAnotherLabel).to.equal(
        'Upload another file',
      );
      expect(result['ui:options'].fileTypes).to.deep.equal(['pdf']);
      expect(result['ui:options'].maxSize).to.equal(15728640);
      expect(result['ui:options'].minSize).to.equal(1024);
    });

    it('should set hideLabelText based on content.label presence', () => {
      const withLabel = fileUploadUi({
        label: 'Test',
        description: 'Test description',
      });
      const withoutLabel = fileUploadUi({
        description: 'Test description',
      });

      expect(withLabel['ui:options'].hideLabelText).to.be.false;
      expect(withoutLabel['ui:options'].hideLabelText).to.be.true;
    });

    it('should include itemDescription', () => {
      const content = {
        label: 'Documents',
        description: 'Upload your documents here',
      };

      const result = fileUploadUi(content);

      expect(result['ui:options'].itemDescription).to.equal(
        'Upload your documents here',
      );
    });

    it('should have hideOnReview set to false', () => {
      const content = {
        label: 'Documents',
        description: 'Upload documents',
      };

      const result = fileUploadUi(content);

      expect(result['ui:options'].hideOnReview).to.be.false;
    });

    it('should include attachment schema function', () => {
      const content = {
        label: 'Documents',
        description: 'Upload documents',
      };

      const result = fileUploadUi(content);

      expect(result['ui:options'].attachmentSchema).to.be.a('function');
    });

    it('should create attachment schema with correct properties', () => {
      const content = {
        label: 'Documents',
        description: 'Upload documents',
      };

      const result = fileUploadUi(content);
      const attachmentSchema = result['ui:options'].attachmentSchema({
        fileName: 'test.pdf',
      });

      expect(attachmentSchema['ui:title']).to.equal(
        'What kind of file is this?',
      );
      expect(attachmentSchema['ui:disabled']).to.be.false;
      expect(attachmentSchema['ui:options'].messageAriaDescribedby).to.equal(
        'Choose a document type for test.pdf',
      );
    });

    it('should include createPayload and parseResponse functions', () => {
      const content = {
        label: 'Documents',
        description: 'Upload documents',
      };

      const result = fileUploadUi(content);

      expect(result['ui:options'].createPayload).to.be.a('function');
      expect(result['ui:options'].parseResponse).to.be.a('function');
    });

    it('should include attachmentName configuration', () => {
      const content = {
        label: 'Documents',
        description: 'Upload documents',
      };

      const result = fileUploadUi(content);

      expect(result['ui:options'].attachmentName).to.deep.equal({
        'ui:title': 'File name',
      });
    });
  });
});
