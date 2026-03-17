import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

export const NeedHelp = () => {
  const { t } = useTranslation();

  return (
    <va-need-help
      class="vads-u-margin-top--4 medium-screen:vads-l-col--12 small-desktop-screen:vads-l-col--8"
      data-testid="need-help"
    >
      <div slot="content">
        <p>
          <Trans
            i18nKey="shared.needHelp.benefitOverpayments"
            components={{
              1: <va-telephone contact={t('shared.phone.tollFree.value')} />,
              2: <va-telephone contact={t('shared.phone.tty.value')} tty />,
              3: (
                <va-telephone
                  contact={t('shared.phone.international.value')}
                  international
                />
              ),
            }}
          />
        </p>
        <p>
          <Trans
            i18nKey="shared.needHelp.copayBills"
            components={{
              1: <va-telephone contact={t('shared.phone.hrc.value')} />,
              2: <va-telephone contact={t('shared.phone.tty.value')} tty />,
            }}
          />
        </p>
        <p>
          <Trans
            i18nKey="shared.needHelp.questions"
            components={{
              1: (
                <va-link
                  href="https://ask.va.gov/"
                  text={t('shared.linkText.contactUsVA')}
                />
              ),
            }}
          />
        </p>
      </div>
    </va-need-help>
  );
};

export default NeedHelp;
