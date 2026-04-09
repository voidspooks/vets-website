import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { setData } from '@department-of-veterans-affairs/platform-forms-system/actions';
import { CONTACTS } from '@department-of-veterans-affairs/component-library/contacts';
import {
  PersonalInformation,
  PersonalInformationCardHeader,
  PersonalInformationHeader,
  PersonalInformationNote,
} from 'platform/forms-system/src/js/components/PersonalInformation/PersonalInformation';

const CustomPersonalInfo = props => {
  return (
    <PersonalInformation
      {...props}
      data={props.formData}
      config={{
        name: { show: false },
        ssn: { show: true, required: false },
        dateOfBirth: { show: true },
      }}
      dataAdapter={{
        ssnPath: 'veteranSsnLastFour',
      }}
      formOptions={props.formOptions}
    >
      <PersonalInformationHeader>
        <h3 className="vads-u-margin-bottom--3">
          Confirm the personal information we have on file for you
        </h3>
      </PersonalInformationHeader>
      <PersonalInformationCardHeader>
        <h4 className="vads-u-font-size--h3 vads-u-margin-top--1 vads-u-font-size--h3">
          Personal information
        </h4>
      </PersonalInformationCardHeader>
      <PersonalInformationNote>
        <p>
          <strong>Note:</strong> To protect your personal information, we don’t
          allow online changes to your date of birth, or Social Security number.
          If you need to change this information, call us at{' '}
          <va-telephone contact={CONTACTS.VA_BENEFITS} /> (
          <va-telephone contact={CONTACTS[711]} tty />
          ). We’re here Monday through Friday, between 8:00 a.m. and 9:00 p.m.{' '}
          <dfn>
            <abbr title="Eastern Time">ET</abbr>
          </dfn>
          .
        </p>
      </PersonalInformationNote>
    </PersonalInformation>
  );
};

CustomPersonalInfo.propTypes = {
  formData: PropTypes.object,
  formOptions: PropTypes.object,
  setFormData: PropTypes.func,
};

const mapStateToProps = state => ({
  formData: state.form?.data,
  formOptions: state.form?.formConfig?.formOptions,
});

const mapDispatchToProps = {
  setFormData: setData,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CustomPersonalInfo);
