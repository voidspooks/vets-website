import React from 'react';
import { Prompt } from 'react-router-dom';
import PropTypes from 'prop-types';

import { useDirectDeposit, useDirectDepositEffects } from '@@profile/hooks';

import Headline from '@@profile/components/ProfileSectionHeadline';
import { ProfileInfoSection } from '@@profile/components/ProfileInfoSection';
import LoadFail from '@@profile/components/alerts/LoadFail';

import VerifyIdentity from '@@profile/components/direct-deposit/alerts/VerifyIdentity';
import { TemporaryOutage } from '@@profile/components/direct-deposit/alerts/TemporaryOutage';
import DirectDepositBlocked from '@@profile/components/direct-deposit/alerts/DirectDepositBlocked';
import { Ineligible } from '@@profile/components/direct-deposit/alerts/Ineligible';
import { AccountInfoView } from '@@profile/components/direct-deposit/AccountInfoView';
import { AccountUpdateView } from '@@profile/components/direct-deposit/AccountUpdateView';
import { DirectDepositDevWidget } from '@@profile/components/direct-deposit/DirectDepositDevWidget';
import { FraudVictimSummary } from '@@profile/components/direct-deposit/FraudVictimSummary';

import DowntimeNotification, {
  externalServices,
} from '~/platform/monitoring/DowntimeNotification';
import { useFeatureToggle } from '~/platform/utilities/feature-toggles';
import { COULD_NOT_DETERMINE_DUE_TO_EXCEPTION } from './config/enums';

const cardHeadingId = 'bank-account-information';

// layout wrapper for common styling
const Wrapper = ({ children }) => {
  return (
    <>
      <Headline dataTestId="unified-direct-deposit">
        Direct deposit information
      </Headline>
      {children}
    </>
  );
};

Wrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

Wrapper.defaultProps = {};

export const DirectDeposit = () => {
  const directDepositHookResult = useDirectDeposit();

  const {
    ui,
    paymentAccount,
    controlInformation,
    veteranStatus,
    isIdentityVerified,
    isBlocked,
    useOAuth,
    showUpdateSuccess,
    formData,
    onFormSubmit,
    saveError,
    loadError,
    setFormData,
    hasUnsavedFormEdits,
    isEligible,
  } = directDepositHookResult;

  useDirectDepositEffects({ ...directDepositHookResult, cardHeadingId });

  const {
    TOGGLE_NAMES,
    useToggleValue,
    useToggleLoadingValue,
  } = useFeatureToggle();

  const hideDirectDeposit = useToggleValue(
    TOGGLE_NAMES.profileHideDirectDeposit,
  );
  const nonVeteranFeatureFlag = useToggleValue(
    TOGGLE_NAMES.profileLimitDirectDepositForNonBeneficiaries,
  );

  const togglesLoading = useToggleLoadingValue();

  if (togglesLoading) {
    return (
      <Wrapper>
        <va-loading-indicator />
      </Wrapper>
    );
  }

  if (hideDirectDeposit) {
    return (
      <Wrapper>
        <TemporaryOutage customMessaging />
        <FraudVictimSummary />
      </Wrapper>
    );
  }

  if (
    loadError ||
    (nonVeteranFeatureFlag &&
      veteranStatus === COULD_NOT_DETERMINE_DUE_TO_EXCEPTION)
  ) {
    return (
      <Wrapper>
        <LoadFail />
      </Wrapper>
    );
  }

  if (isBlocked) {
    return (
      <Wrapper>
        <DirectDepositBlocked />
      </Wrapper>
    );
  }

  if (!isIdentityVerified) {
    return (
      <Wrapper>
        <VerifyIdentity useOAuth={useOAuth} />
      </Wrapper>
    );
  }

  if (!isEligible) {
    return (
      <Wrapper>
        <Ineligible />
      </Wrapper>
    );
  }

  // render the form or the account info view into the card data value
  // based on the UI state isEditing
  const cardDataValue = ui.isEditing ? (
    <AccountUpdateView
      isSaving={ui.isSaving}
      formSubmit={onFormSubmit}
      {...directDepositHookResult}
    />
  ) : (
    <AccountInfoView
      ref={directDepositHookResult.editButtonRef}
      isSaving={ui.isSaving}
      {...directDepositHookResult}
    />
  );

  return (
    <div>
      <Prompt
        message="Are you sure you want to leave? If you leave, your in-progress work won't be saved."
        when={hasUnsavedFormEdits}
      />

      <Wrapper>
        <DowntimeNotification
          appTitle="direct deposit information page"
          dependencies={[externalServices.LIGHTHOUSE_DIRECT_DEPOSIT]}
        >
          <h2 className="vads-u-margin-top--4" id={cardHeadingId}>
            Bank account information
          </h2>
          <p>
            We send payments for your disability compensation, pension, and
            education benefits to this bank account.
          </p>
          <ProfileInfoSection
            data={[{ value: cardDataValue }]}
            namedAnchor={cardHeadingId}
            level={2}
          />
        </DowntimeNotification>
        <DirectDepositDevWidget
          debugData={{
            controlInformation,
            paymentAccount,
            ui,
            isIdentityVerified,
            isBlocked,
            useOAuth,
            showUpdateSuccess,
            formData,
            saveError,
            loadError,
            hasUnsavedFormEdits,
            setFormData,
          }}
        />
        <div className="vads-u-margin-top--4">
          <va-accordion open-single>
            <va-accordion-item header="How do I update direct deposit information for the Foreign Medical Program?">
              <p>
                The Foreign Medical Program (FMP) uses a different system for
                direct deposit than other VA benefits use. To update your direct
                deposit information for FMP, you’ll need to go to the Financial
                Services Center’s Customer Engagement Portal.
              </p>
              <p>
                <va-link
                  href="/resources/how-to-set-up-direct-deposit-for-foreign-medical-program-claims/"
                  text="Learn how to set up direct deposit for Foreign Medical Program claims"
                />
              </p>
            </va-accordion-item>
          </va-accordion>
        </div>
        <FraudVictimSummary />
      </Wrapper>
    </div>
  );
};
