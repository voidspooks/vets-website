import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';

const BaseAlert = ({
  headerKey,
  headerValues,
  bodyKey,
  bodyValues,
  components = {},
  children,
  ...vaAlertProps
}) => {
  const { t } = useTranslation();

  return (
    <va-alert {...vaAlertProps}>
      <h2 slot="headline">{t(headerKey, headerValues)}</h2>
      <p className="vads-u-margin-bottom--0">
        <Trans i18nKey={bodyKey} values={bodyValues} components={components} />
      </p>
      {children}
    </va-alert>
  );
};

BaseAlert.propTypes = {
  bodyKey: PropTypes.string.isRequired,
  headerKey: PropTypes.string.isRequired,
  bodyValues: PropTypes.object,
  children: PropTypes.node,
  components: PropTypes.object,
  headerValues: PropTypes.object,
};

export default BaseAlert;
