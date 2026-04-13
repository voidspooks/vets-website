import React from 'react';
import { CONTACTS } from '@department-of-veterans-affairs/component-library/contacts';
import PropTypes from 'prop-types';

const MedsByMailContent = ({ headingLevel = 2 }) => {
  const HeadingTag = `h${headingLevel}`;
  const headingClass =
    headingLevel > 2
      ? 'vads-u-margin-top--0 vads-u-font-size--h4'
      : 'vads-u-margin-top--3 medium-screen:vads-u-font-size--h3';

  return (
    <>
      <HeadingTag className={headingClass} data-testid="meds-by-mail-header">
        If you use Meds by Mail
      </HeadingTag>
      <p data-testid="meds-by-mail-top-level-text">
        We may not have your allergy records in our My HealtheVet tools. But the
        Meds by Mail servicing center keeps a record of your allergies and
        reactions to medications.
      </p>
      <div className="vads-u-margin-bottom--4">
        <va-additional-info
          data-testid="meds-by-mail-additional-info"
          trigger="How to update your allergies and reactions if you use Meds by Mail"
        >
          <p>
            If you have a new allergy or reaction, tell your provider. Or you
            can call us at{' '}
            <va-telephone
              className="help-phone-number-link"
              contact="8662297389"
            />{' '}
            or{' '}
            <va-telephone
              className="help-phone-number-link"
              contact="8883850235"
            />{' '}
            (<va-telephone contact={CONTACTS[711]} tty />) and ask us to update
            your records. We’re here Monday through Friday, 8:00 a.m. to 7:30
            p.m. ET.
          </p>
        </va-additional-info>
      </div>
    </>
  );
};

MedsByMailContent.propTypes = {
  headingLevel: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
};

export default MedsByMailContent;
