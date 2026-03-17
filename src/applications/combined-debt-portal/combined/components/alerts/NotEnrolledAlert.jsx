import React from 'react';
import { useTranslation } from 'react-i18next';
import BaseAlert from './BaseAlert';
import { LINK_REGISTRY } from '../../../debt-letters/const/linkRegistry';

const NotEnrolledAlert = () => {
  const { t } = useTranslation();
  return (
    <BaseAlert
      status="info"
      headerKey={t('alertsCards.notEnrolled.header')}
      bodyKey={t('alertsCards.notEnrolled.body')}
      components={{
        1: (
          <va-telephone contact={t('shared.phone.applyForHealthCare.value')} />
        ),
        2: <va-telephone contact={t('shared.phone.tty.value')} tty />,
      }}
    >
      <va-link-action
        href={LINK_REGISTRY.applyForHealthCare.href}
        text={t(LINK_REGISTRY.applyForHealthCare.textKey)}
        type="primary"
      />
    </BaseAlert>
  );
};

export default NotEnrolledAlert;
