import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import RoutedSavableApp from 'platform/forms/save-in-progress/RoutedSavableApp';
import { setData } from 'platform/forms-system/src/js/actions';
import { isLoggedIn } from 'platform/user/selectors';
import formConfig from '../config/form';
import Breadcrumbs from '../components/Breadcrumbs';
import manifest from '../manifest.json';
import { TITLE } from '../constants';
import {
  fetchDirectDeposit,
  fetchDuplicateContactInfo,
  fetchPersonalInformation,
} from '../actions';
import prefillTransformer from '../config/prefill-transformer';

function App({
  location,
  children,
  userLoggedIn,
  getPersonalInformation,
  setFormData,
  formData,
  user,
  getDirectDeposit,
  getDuplicateContactInfo,
  claimantInfo,
  duplicateEmail,
  duplicatePhone,
}) {
  const [fetchedUserInfo, setFetchedUserInfo] = useState(false);
  const [fetchedDirectDeposit, setFetchedDirectDeposit] = useState(false);

  useEffect(() => {
    document.title = `${TITLE} | Veterans Affairs`;
  });

  useEffect(
    () => {
      if (!userLoggedIn && location.pathname !== '/introduction') {
        window.location.href = manifest.rootUrl;
      }
    },
    [userLoggedIn, location],
  );

  useEffect(
    () => {
      if (!user?.login?.currentlyLoggedIn) {
        return;
      }
      if (!fetchedUserInfo) {
        setFetchedUserInfo(true);
        getPersonalInformation();
      }
    },
    [fetchedUserInfo, getPersonalInformation, user?.login?.currentlyLoggedIn],
  );

  useEffect(
    () => {
      if (user?.login?.currentlyLoggedIn && !fetchedDirectDeposit) {
        setFetchedDirectDeposit(true);
        getDirectDeposit();
      }
    },
    [fetchedDirectDeposit, getDirectDeposit, user?.login?.currentlyLoggedIn],
  );

  // Merge claimantInfo into formData if we have prefill data but formData doesn't
  // Check for name/DOB presence instead of claimantId (which may be undefined in local dev)
  useEffect(
    () => {
      const hasClaimantData =
        claimantInfo?.applicantFullName?.first ||
        claimantInfo?.applicantFullName?.last ||
        claimantInfo?.dateOfBirth;

      const formDataMissingName =
        !formData?.applicantFullName?.first &&
        !formData?.applicantFullName?.last;

      if (hasClaimantData && formDataMissingName) {
        setFormData({
          ...formData,
          ...claimantInfo,
        });
      }
    },
    [claimantInfo, formData, setFormData],
  );

  // Extract nested formData values to prevent infinite re-renders
  // (following TOE pattern - see ToeApp.jsx lines 114-117)
  const mobilePhoneContact = formData?.contactInfo?.mobilePhone?.contact;
  const emailAddress = formData?.contactInfo?.emailAddress;
  const formDataDuplicateEmail = formData?.duplicateEmail;
  const formDataDuplicatePhone = formData?.duplicatePhone;

  useEffect(
    () => {
      if (
        mobilePhoneContact &&
        emailAddress &&
        !formDataDuplicateEmail &&
        !formDataDuplicatePhone
      ) {
        getDuplicateContactInfo(
          [{ value: emailAddress, dupe: '' }],
          [{ value: mobilePhoneContact, dupe: '' }],
        );
      }
    },
    [
      getDuplicateContactInfo,
      mobilePhoneContact,
      emailAddress,
      formDataDuplicateEmail,
      formDataDuplicatePhone,
    ],
  );

  useEffect(
    () => {
      if (
        duplicateEmail?.length > 0 &&
        duplicateEmail !== formDataDuplicateEmail
      ) {
        setFormData({
          ...formData,
          duplicateEmail,
        });
      }

      if (
        duplicatePhone?.length > 0 &&
        duplicatePhone !== formDataDuplicatePhone
      ) {
        setFormData({
          ...formData,
          duplicatePhone,
        });
      }
    },
    [
      duplicateEmail,
      duplicatePhone,
      formDataDuplicateEmail,
      formDataDuplicatePhone,
      formData,
      setFormData,
    ],
  );

  return (
    <div className="form-22-10297-container row">
      <div className="vads-u-padding-left--0">
        <Breadcrumbs />
      </div>
      <RoutedSavableApp formConfig={formConfig} currentLocation={location}>
        {children}
      </RoutedSavableApp>
    </div>
  );
}

App.propTypes = {
  children: PropTypes.node,
  claimantInfo: PropTypes.object,
  duplicateEmail: PropTypes.array,
  duplicatePhone: PropTypes.array,
  formData: PropTypes.object,
  getDirectDeposit: PropTypes.func,
  getDuplicateContactInfo: PropTypes.func,
  getPersonalInformation: PropTypes.func,
  location: PropTypes.object,
  setFormData: PropTypes.func,
  user: PropTypes.object,
  userLoggedIn: PropTypes.bool,
};

const mapStateToProps = state => {
  const formData = state.form?.data || {};
  const transformedClaimantInfo = prefillTransformer(null, {}, null, state);
  const claimantInfo = transformedClaimantInfo?.formData || {};

  return {
    userLoggedIn: isLoggedIn(state),
    user: state.user,
    formData,
    claimantInfo,
    duplicateEmail: state.data?.duplicateEmail,
    duplicatePhone: state.data?.duplicatePhone,
  };
};

const mapDispatchToProps = {
  getDirectDeposit: fetchDirectDeposit,
  getPersonalInformation: fetchPersonalInformation,
  setFormData: setData,
  getDuplicateContactInfo: fetchDuplicateContactInfo,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);
