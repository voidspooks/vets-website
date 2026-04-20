import React from 'react';
import PropTypes from 'prop-types';
import ActionLink from '../../../shared/components/web-component-wrappers/ActionLink';
import BasicLink from '../../../shared/components/web-component-wrappers/BasicLink';
import { content } from '../../content/evidence/summary';
import { evidence } from '../../../shared/props';
import {
  errorClassNames,
  listClassNames,
  removeButtonClass,
} from '../../utils/evidence-classnames';
import {
  ATTACHMENTS_OTHER,
  EVIDENCE_ADDITIONAL_URL,
  EVIDENCE_UPLOAD_URL,
} from '../../constants';

const EvidenceSummaryUploadDisplay = ({ handlers, list, testing }) => {
  const getList = () => {
    if (list?.length > 0) {
      return (
        <>
          {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
          <ul
            className="vads-u-margin-top--4 vads-u-margin-bottom--0 remove-bullets"
            role="list"
          >
            {list.map((upload, index) => {
              const errors = {
                attachmentId: upload.attachmentId
                  ? ''
                  : content.missing.attachmentId,
              };

              const hasErrors = Object.values(errors).join('');
              const noMarginForTopListItemClass =
                index > 0 ? 'vads-u-margin-top--2 ' : '';
              const lastListItemClass =
                index === list.length - 1 ? 'last-evidence-list-item ' : '';

              return (
                <li
                  key={upload.name + index}
                  className={
                    hasErrors
                      ? errorClassNames
                      : `${noMarginForTopListItemClass}${lastListItemClass}${listClassNames(
                          index > 0,
                        )}`
                  }
                >
                  <p
                    className="vads-u-color--base-darker dd-privacy-hidden overflow-wrap-word vads-u-margin-y--0 vads-u-font-weight--bold"
                    data-dd-action-name="Uploaded document file name"
                  >
                    {upload.name}
                  </p>
                  <p>
                    {errors.attachmentId ||
                      ATTACHMENTS_OTHER[upload.attachmentId] ||
                      ''}
                  </p>
                  <div className="upload-buttons-container vads-u-margin-top--1p5">
                    <BasicLink
                      disableAnalytics
                      id={`edit-upload-${index}`}
                      className="edit-item"
                      path={`/${EVIDENCE_UPLOAD_URL}#${index}`}
                      aria-label={`${content.editLinkAria} ${upload.name}`}
                      data-link={testing ? EVIDENCE_UPLOAD_URL : null}
                      text={content.edit}
                    />
                    <va-button
                      data-index={index}
                      data-type="upload"
                      onClick={handlers.showModal}
                      class={removeButtonClass}
                      label={`Remove ${upload.name}`}
                      text="Remove"
                      secondary
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      );
    }

    return null;
  };

  return (
    <>
      {getList()}
      <p className="vads-u-margin-top--3 vads-u-margin-bottom--4">
        <ActionLink
          data-testid="add-more-evidence-link"
          path={`/${EVIDENCE_ADDITIONAL_URL}`}
          primary
          text="Upload supporting evidence"
        />
      </p>
    </>
  );
};

EvidenceSummaryUploadDisplay.propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape(evidence)).isRequired,
  handlers: PropTypes.shape({
    showModal: PropTypes.func,
  }),
  testing: PropTypes.bool,
};

export default EvidenceSummaryUploadDisplay;
