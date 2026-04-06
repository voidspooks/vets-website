/* eslint-disable react/sort-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  fileInputUI,
  fileInputSchema,
  fileInputMultipleUI,
  fileInputMultipleSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import { VaModal } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import SchemaForm from '@department-of-veterans-affairs/platform-forms-system/SchemaForm';
import FormNavButtons from '~/platform/forms-system/src/js/components/FormNavButtons';
import environment from '@department-of-veterans-affairs/platform-utilities/environment';
import {
  getAlert,
  getFormContent,
  onClickContinueBdd,
  onModalNext,
} from '../../helpers';
import {
  emptyObjectSchema,
  uploadTitleAndDescription,
  supportingEvidenceTitleAndDescription,
  bddTitleAndDescription,
} from '../../helpers/helpers';
import SupportingEvidenceViewField from '../../components/SupportingEvidenceViewField';

// pass this to the formConfig's pageConfig. NOT directly into the SchemaForm
// otherwise updateSchema type code may not work
const { formNumber, title, message } = getFormContent();
const baseURL = `${environment.API_URL}/accredited_representative_portal/v0`;
const fileUploadUrl = `${baseURL}/representative_form_upload`;
const bddUploadUrl = `${baseURL}/upload_bdd_sha_documents`;

export const warningsPresent = formData => {
  if (formData.uploadedFile?.warnings?.length > 0) return true;
  // eslint-disable-next-line sonarjs/prefer-single-boolean-return
  if (formData.supportingDocuments?.some(doc => doc.warnings?.length > 0))
    return true;
  return false;
};

export const bddCustomPage = {
  uiSchema: {
    'ui:description': props => {
      const modifiedProps = { ...props };
      modifiedProps.data = modifiedProps.formData;
      modifiedProps.name = 'uploadPage';
      return getAlert(modifiedProps);
    },
    ...uploadTitleAndDescription,
    uploadedFile: {
      ...fileInputUI({
        errorMessages: { required: `Upload a completed VA Form ${formNumber}` },
        name: 'form-upload-file-input',
        fileUploadUrl,
        title,
        hint:
          'You can upload only one file no larger than 25MB.\nYour file must be .pdf format.',
        formNumber,
        required: () => true,
        // Disallow uploads greater than 25 MB
        maxFileSize: 26214400, // 25MB in bytes
        updateUiSchema: formData => {
          return {
            'ui:title': warningsPresent(formData)
              ? message.replace('Upload ', '')
              : message,
          };
        },
      }),
    },
    ...bddTitleAndDescription,
    uploadBdd: {
      ...fileInputUI({
        errorMessages: { required: `Upload a completed VA Form ${formNumber}` },
        name: 'form-upload-file-input',
        fileUploadUrl: bddUploadUrl,
        hint:
          'You can upload only one file no larger than 25MB.\nYour file must be .pdf format.',
        formNumber,
        required: () => false,
        // Disallow uploads greater than 25 MB
        maxFileSize: 26214400, // 25MB in bytes
        updateUiSchema: formData => {
          return {
            'ui:title': warningsPresent(formData)
              ? message.replace('Upload ', '')
              : message,
          };
        },
      }),
    },
    'ui:objectViewField': SupportingEvidenceViewField,
    ...supportingEvidenceTitleAndDescription,
    supportingDocuments: {
      ...fileInputMultipleUI({
        title: 'Upload supporting evidence',
        required: false,
        skipUpload: false,
        fileUploadUrl: `${baseURL}/upload_supporting_documents`,
        // Disallow uploads greater than 100 MB
        maxFileSize: 104857600, // 100MB in bytes
        accept: '.pdf,jpg,.jpeg,.png',
        errorMessages: { required: `Upload a completed VA Form ${formNumber}` },
        hint:
          'You can upload one file at a time no larger than 100MB.\nYour file can be .pdf, .png, or .jpg.',
        formNumber,
      }),
    },
  },
  schema: {
    type: 'object',
    properties: {
      'view:uploadTitle': emptyObjectSchema,
      'view:uploadFormNumberDescription': emptyObjectSchema,
      'view:uploadDescription': emptyObjectSchema,
      uploadedFile: fileInputSchema(),
      'view:bddTitle': emptyObjectSchema,
      'view:bddDescription': emptyObjectSchema,
      uploadBdd: fileInputSchema(),
      'view:supportingEvidenceTitle': emptyObjectSchema,
      'view:supportingEvidenceDescription': emptyObjectSchema,
      supportingDocuments: fileInputMultipleSchema(),
    },
    required: ['uploadedFile'],
  },
};

/** @type {CustomPageType} */
export function BddCustomPage(props) {
  const [modalVisible, setModalVisible] = useState(null);

  const onClose = () => {
    setModalVisible(false);
  };

  return (
    <SchemaForm {...props}>
      <>
        <VaModal
          modalTitle="Continue without a Separation Health Assessment - Part A?"
          onCloseEvent={onClose}
          onPrimaryButtonClick={() => onModalNext(props, setModalVisible)}
          onSecondaryButtonClick={onClose}
          primaryButtonText="Continue"
          secondaryButtonText="Cancel"
          status="warning"
          visible={modalVisible}
        >
          <p>
            If you continue without a Separation Health Assessment - Part A
            Self-Assessment form, the submission will be processed as a standard
            disability compensation claim.
          </p>
          <p>This may delay the start date for the claimant's benefits.</p>
        </VaModal>
        {/* contentBeforeButtons = save-in-progress links */}
        {props.contentBeforeButtons}
        <FormNavButtons
          goBack={props.goBack}
          goForward={event => onClickContinueBdd(props, setModalVisible, event)}
          submitToContinue
        />
        {props.contentAfterButtons}
      </>
    </SchemaForm>
  );
}

BddCustomPage.propTypes = {
  name: PropTypes.string.isRequired,
  schema: PropTypes.object.isRequired,
  uiSchema: PropTypes.object.isRequired,
  appStateData: PropTypes.object,
  contentAfterButtons: PropTypes.node,
  contentBeforeButtons: PropTypes.node,
  data: PropTypes.object,
  formContext: PropTypes.object,
  goBack: PropTypes.func,
  onChange: PropTypes.func,
  onContinue: PropTypes.func,
  onReviewPage: PropTypes.bool,
  onSubmit: PropTypes.func,
  pagePerItemIndex: PropTypes.number,
  title: PropTypes.string,
  trackingPrefix: PropTypes.string,
};
