import React, { useEffect, useState, useRef } from 'react';
import { VaModal } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import FormNavButtons from 'platform/forms-system/src/js/components/FormNavButtons';
import { focusElement } from 'platform/utilities/ui/focus';
import { $ } from 'platform/forms-system/src/js/utilities/ui';
import { Element, scrollTo } from 'platform/utilities/scroll';
import {
  getVAEvidence,
  getPrivateEvidence,
  getOtherEvidence,
} from '../../utils/form-data-retrieval';
import { content } from '../../content/evidence/summary';
import { PrivateDetailsDisplay } from './PrivateDetailsDisplay';
import { EvidenceUploadContent } from '../EvidenceUploadContent';
import { VaDetailsDisplay } from './VaDetailsDisplay';
import { HAS_PRIVATE_LIMITATION } from '../../constants';
import { customPageProps995 } from '../../../shared/props';
import { focusFirstError } from '../../../shared/utils/focus';
import { redesignActive } from '../../utils';
import EvidenceSummaryUploadDisplay from './EvidenceSummaryUploadDisplay';

const Summary = ({
  data,
  goBack,
  goForward,
  setFormData,
  contentBeforeButtons,
  contentAfterButtons,
  // on review & submit page, in edit mode
  onReviewPage,
  updatePage,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [removeData, setRemoveData] = useState({});
  const [hasErrors, setHasErrors] = useState(false);
  const containerRef = useRef(null);
  const isScRedesign = redesignActive(data);

  const { limitedConsent = '', privacyAgreementAccepted } = data;
  const vaEvidence = getVAEvidence(data);
  const privateEvidence = getPrivateEvidence(data);
  const otherEvidence = getOtherEvidence(data);

  const evidenceLength =
    vaEvidence.length + privateEvidence.length + otherEvidence.length;

  useEffect(
    () => {
      setHasErrors(
        containerRef?.current.querySelectorAll('.usa-input-error-message')
          .length > 0,
      );
    },
    [containerRef, evidenceLength],
  );

  useEffect(
    () => {
      if (evidenceLength === 0) {
        focusElement('#no-evidence');
        scrollTo('evidenceSummaryScrollElement');
      }
    },
    [evidenceLength],
  );

  const callbacks = {
    va: () => {
      vaEvidence.splice(removeData.index, 1);
      setFormData({ ...data, locations: vaEvidence });
    },
    private: () => {
      privateEvidence.splice(removeData.index, 1);
      setFormData({ ...data, providerFacility: privateEvidence });
    },
    limitation: () => {
      setFormData({ ...data, limitedConsent: '' });
    },
    upload: () => {
      otherEvidence.splice(removeData.index, 1);
      setFormData({ ...data, additionalDocuments: otherEvidence });
    },
  };

  const getName = (type, index) => {
    const sections = {
      va: vaEvidence[index]?.locationAndName,
      private: privateEvidence[index]?.providerFacilityName,
      upload: otherEvidence[index]?.name,
    };
    return sections[type];
  };

  const handlers = {
    showModal: event => {
      const { target } = event;
      const { type, index } = target.dataset;

      setRemoveData({
        type,
        index: parseInt(index, 10),
        name: getName(type, index),
      });

      setShowModal(true);
    },
    closeModal: () => {
      const { type, index } = removeData;
      const focusTarget = $(
        `.remove-item[data-type="${type}"][data-index="${index}"]`,
      );

      setShowModal(false);
      scrollTo(focusTarget);
      focusElement('button', {}, focusTarget?.shadowRoot);
      setRemoveData({});
    },
    removeEvidence: () => {
      setShowModal(false);
      callbacks[removeData.type]();
      focusElement('.vads-c-action-link--green');
      setRemoveData({});
    },

    onGoForward: () => {
      if (hasErrors) {
        focusFirstError();
      } else {
        goForward(data);
      }
    },
    onUpdate: () => {
      if (hasErrors) {
        focusFirstError();
      } else {
        updatePage();
      }
    },
  };
  const visibleError = evidenceLength === 0;
  const H = onReviewPage ? 'h5' : 'h3';
  const Header = onReviewPage ? 'h4' : 'h3';
  const modalTitle = content.removeEvidence.title;

  let modalPrimaryButtonText = content.removeEvidence.modalRemove;

  if (removeData.type === 'upload') {
    modalPrimaryButtonText = content.removeEvidence.modalDelete;
  }

  const props = {
    handlers,
    isOnReviewPage: onReviewPage,
    testing: contentBeforeButtons === 'testing',
  };

  return (
    <div
      ref={containerRef}
      className={onReviewPage ? 'form-review-panel-page' : ''}
    >
      {/* <Element> is outside of div wrapper because of how the first element
        is found and focused in the ReviewCollapsibleChapter code */}
      <Element name="evidenceSummaryScrollElement" />
      <div>
        {/* Maintains header levels in edit mode on review & submit page */}
        <Header className="vads-u-font-size--h3 vads-u-margin--0">
          {content.summaryTitle}
        </Header>

        {/* We are rendering the va-alert so the focus doesn't need to wait for
          render. Problems that show up include:
          - focusElement will add -1 if this isn't set; and don't make it
            tabbable when hidden
          - Only render the alert content since the screenreader can still
            target the headers inside */}
        {!isScRedesign && (
          <va-alert
            id="no-evidence"
            status="warning"
            visible={visibleError}
            class="vads-u-margin-top--4"
          >
            {visibleError && (
              <>
                <H slot="headline">{content.missingEvidenceHeader}</H>
                {content.missingEvidenceText}
              </>
            )}
          </va-alert>
        )}
        {isScRedesign && (
          <va-alert
            id="no-evidence"
            status="warning"
            visible={otherEvidence?.length === 0}
            class="vads-u-margin-top--4"
          >
            {otherEvidence?.length === 0 && (
              <>
                <H slot="headline">You haven’t added new evidence</H>
                <p>
                  If you’re filing based on new evidence, we encourage you to
                  submit it with your claim. But if you don’t have it now, you
                  can still file. We’ll work with you to get the evidence.
                </p>
                <p>
                  <strong>Note</strong>: Some conditions are presumed to be
                  caused by your service. But you may still need to provide
                  evidence, such as proof of diagnosis or exposure.
                </p>
                <va-link
                  external
                  href="/disability/eligibility/#presumptive-conditions"
                  text="Learn more about presumptive conditions"
                />
              </>
            )}
          </va-alert>
        )}
        <VaModal
          clickToClose
          status="warning"
          visible={showModal}
          modalTitle={modalTitle}
          onCloseEvent={handlers.closeModal}
          onPrimaryButtonClick={handlers.removeEvidence}
          onSecondaryButtonClick={handlers.closeModal}
          primaryButtonText={modalPrimaryButtonText}
          secondaryButtonText={content.removeEvidence.modalNotRemove}
        >
          <p>
            {content.removeEvidence[(removeData?.type)] || ''}
            {removeData?.name ? <strong>{` ${removeData.name}`}</strong> : null}
          </p>
        </VaModal>
        {!isScRedesign && (
          <>
            <VaDetailsDisplay list={vaEvidence} {...props} />
            <PrivateDetailsDisplay
              list={privateEvidence}
              limitedConsentResponse={data?.[HAS_PRIVATE_LIMITATION]}
              limitedConsent={limitedConsent}
              privacyAgreementAccepted={privacyAgreementAccepted}
              {...props}
            />
            <EvidenceUploadContent list={otherEvidence} {...props} />
            {content.addMoreLink()}
          </>
        )}
        {isScRedesign && (
          <EvidenceSummaryUploadDisplay list={otherEvidence} {...props} />
        )}
        <div className="form-nav-buttons vads-u-margin-top--4">
          {onReviewPage && (
            <va-button
              onClick={handlers.onUpdate}
              label="Update evidence page"
              text={content.update}
            />
          )}
          {!onReviewPage && (
            <>
              {contentBeforeButtons}
              <FormNavButtons
                goBack={goBack}
                goForward={handlers.onGoForward}
                useWebComponents
              />
              {contentAfterButtons}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

Summary.propTypes = customPageProps995;

export default Summary;
