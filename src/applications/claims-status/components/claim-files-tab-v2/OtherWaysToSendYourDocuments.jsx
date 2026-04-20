import React from 'react';
import PropTypes from 'prop-types';
import {
  MailDescription,
  InPersonDescription,
  ConfirmationDescription,
} from './Descriptions';
import {
  MAILING_ADDRESS,
  CONTACT_INFO,
  LINKS,
  ANCHOR_LINKS,
} from '../../constants';

const renderAddress = lines => (
  <p className="va-address-block vads-u-margin-left--0">
    {lines.map((line, index) => (
      <React.Fragment key={`${line}-${index}`}>
        {line}
        {index < lines.length - 1 && <br />}
      </React.Fragment>
    ))}
  </p>
);

const OtherWaysToSendYourDocuments = ({ claim }) => {
  const filesMeta = claim?.attributes?.claimStatusMeta?.files;

  const sectionTitle =
    filesMeta?.sectionTitle || 'Other ways to send your documents';
  const showSectionHeader = !filesMeta?.simpleLayout;

  const introText =
    filesMeta?.introText ||
    'Print a copy of each document and write your Social Security number on the first page. Then resubmit by mail or in person.';
  const showIntroText = !filesMeta?.simpleLayout;

  const option1 =
    filesMeta?.options?.mail || filesMeta?.options?.option1 || null;
  const option2 =
    filesMeta?.options?.inPerson ||
    filesMeta?.options?.option2 ||
    filesMeta?.options?.fax ||
    null;
  const option3 = filesMeta?.options?.option3 || null;
  const confirmation = filesMeta?.confirmation || null;
  const hasCustomFilesMeta = !!filesMeta;
  const shouldShowCustomConfirmation = hasCustomFilesMeta
    ? confirmation?.description || confirmation?.descriptionPrefix
    : false;

  return (
    <div
      id="other-ways-to-send-documents"
      className="other-ways-to-send-your-documents scroll-anchor"
      data-testid="other-ways-to-send-documents"
    >
      {showSectionHeader && (
        <h2
          id={ANCHOR_LINKS.otherWaysToSendDocuments}
          className="vads-u-margin-top--0 vads-u-margin-bottom--3"
        >
          {sectionTitle}
        </h2>
      )}
      {(showIntroText || filesMeta?.noteText) && (
        <div>
          {showIntroText && <p>{introText}</p>}
          {filesMeta?.noteText && (
            <p>
              <strong>Note:</strong> {filesMeta.noteText}
            </p>
          )}
        </div>
      )}
      <div className="other-ways-mail-section">
        <h3>{option1?.title || 'Option 1: By mail'}</h3>
        {hasCustomFilesMeta ? (
          <>
            {option1?.description && (
              <p className="vads-u-font-size--lg">{option1.description}</p>
            )}
            {option1?.linkText &&
              option1?.linkUrl && (
                <va-link-action
                  href={option1.linkUrl}
                  text={option1.linkText}
                  type="primary"
                  {...(option1?.linkExternal
                    ? {
                        'message-aria-describedby': 'Opens in a new tab',
                        onClick: e => {
                          e.preventDefault();
                          window.open(
                            option1.linkUrl,
                            '_blank',
                            'noopener,noreferrer',
                          );
                        },
                      }
                    : {})}
                />
              )}
            {option1?.addressLines?.length > 0 &&
              renderAddress(option1.addressLines)}
          </>
        ) : (
          <MailDescription address={MAILING_ADDRESS} />
        )}
      </div>
      <div className="other-ways-in-person-section">
        <h3>{option2?.title || 'Option 2: In person'}</h3>
        {hasCustomFilesMeta ? (
          <>
            {option2?.description && (
              <p className="vads-u-font-size--lg">{option2.description}</p>
            )}
            {option2?.addressLines?.length > 0 &&
              renderAddress(option2.addressLines)}
          </>
        ) : (
          <InPersonDescription findVaLocations={LINKS.findVaLocations} />
        )}
      </div>
      {option3 && (
        <div className="other-ways-fax-section">
          <h3>{option3.title}</h3>
          {option3.description && (
            <p className="vads-u-font-size--lg">{option3.description}</p>
          )}
          {option3.noteText && (
            <p>
              <strong>Note:</strong> {option3.noteText}
            </p>
          )}
        </div>
      )}
      <div className="other-ways-confirmation-section">
        <h3>
          {confirmation?.title ||
            'How to confirm we’ve received your documents'}
        </h3>
        {shouldShowCustomConfirmation ? (
          <>
            {confirmation.descriptionPrefix ? (
              <p>
                {confirmation.descriptionPrefix}{' '}
                <va-telephone contact={confirmation.phone} /> (
                <va-telephone contact={confirmation.tty} tty="true" />
                ).
              </p>
            ) : (
              <p>{confirmation.description}</p>
            )}
            {confirmation.descriptionNote && (
              <p>{confirmation.descriptionNote}</p>
            )}
          </>
        ) : (
          <ConfirmationDescription contactInfo={CONTACT_INFO} />
        )}
      </div>
    </div>
  );
};

OtherWaysToSendYourDocuments.propTypes = {
  claim: PropTypes.object,
};

export default OtherWaysToSendYourDocuments;
