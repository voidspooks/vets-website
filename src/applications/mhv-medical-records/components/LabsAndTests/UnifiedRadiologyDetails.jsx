import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';

import { focusElement } from '@department-of-veterans-affairs/platform-utilities/ui';
import {
  usePrintTitle,
  makePdf,
} from '@department-of-veterans-affairs/mhv/exports';
import FEATURE_FLAG_NAMES from '@department-of-veterans-affairs/platform-utilities/featureFlagNames';
import {
  addDays,
  subDays,
  format as dateFnsFormat,
  parseISO,
  isValid,
} from 'date-fns';
import PrintHeader from '../shared/PrintHeader';
import DateSubheading from '../shared/DateSubheading';
import HeaderSection from '../shared/HeaderSection';
import LabelValue from '../shared/LabelValue';
import ItemList from '../shared/ItemList';
import PrintDownload from '../shared/PrintDownload';
import DownloadSuccessAlert from '../shared/DownloadSuccessAlert';
import DownloadingRecordsInfo from '../shared/DownloadingRecordsInfo';
import TrackedSpinner from '../shared/TrackedSpinner';
import { generateTextFile, sendDataDogAction } from '../../util/helpers';
import {
  pageTitles,
  LABS_AND_TESTS_DISPLAY_LABELS,
} from '../../util/constants';
import { pdfPrinter, txtPrinter } from '../../util/printHelper';
import { fetchBbmiNotificationStatus } from '../../actions/images';
import {
  getAcceleratedImagingStudiesList,
  mergeImagingStudies,
} from '../../actions/labsAndTests';
import useThumbnailPolling from '../../hooks/useThumbnailPolling';

const UnifiedRadiologyDetails = props => {
  const { record, user, runningUnitTest = false } = props;
  const dispatch = useDispatch();
  const { labId } = useParams();

  const scdfImageThumbnails = useSelector(
    state => state.mr.labsAndTests.scdfImageThumbnails,
  );
  const { notificationStatus } = useSelector(state => state.mr.images);
  const scdfImagingStudies = useSelector(
    state => state.mr.labsAndTests.scdfImagingStudies,
  );
  const scdfImagingStudiesMerged = useSelector(
    state => state.mr.labsAndTests.scdfImagingStudiesMerged,
  );

  const isAcceleratingImagingStudies = useSelector(
    state =>
      state.featureToggles?.[
        FEATURE_FLAG_NAMES.mhvMedicalRecordsFetchScdfImagingStudies
      ],
  );

  const isCernerUser = useSelector(
    state => state.user?.profile?.isCernerPatient,
  );

  const {
    hasLoadedThumbnails,
    hasLoadedDicom,
    hasImageError,
  } = useThumbnailPolling(record?.imagingStudyId, record?.imageCount);

  const emptyField = 'None noted';

  useEffect(
    () => {
      focusElement(document.querySelector('h1'));
    },
    [record],
  );

  useEffect(
    () => {
      dispatch(fetchBbmiNotificationStatus());
    },
    [dispatch],
  );

  // If the user navigated here before imaging studies were merged into the
  // labs list, kick off the fetch (if needed) and/or merge so the images
  // section can render.
  useEffect(
    () => {
      if (
        !record ||
        record.imageCount !== undefined ||
        scdfImagingStudiesMerged ||
        !isAcceleratingImagingStudies
      )
        return;
      if (!scdfImagingStudies) {
        const parsed = record.sortDate ? parseISO(record.sortDate) : null;
        const studyDate = parsed && isValid(parsed) ? parsed : new Date();
        dispatch(
          getAcceleratedImagingStudiesList({
            startDate: dateFnsFormat(subDays(studyDate, 2), 'yyyy-MM-dd'),
            endDate: dateFnsFormat(addDays(studyDate, 2), 'yyyy-MM-dd'),
          }),
        );
      } else {
        dispatch(mergeImagingStudies());
      }
    },
    [
      record,
      scdfImagingStudies,
      scdfImagingStudiesMerged,
      isAcceleratingImagingStudies,
      dispatch,
    ],
  );

  usePrintTitle(
    pageTitles.LAB_AND_TEST_RESULTS_PAGE_TITLE,
    user.userFullName,
    user.dob,
  );

  const [downloadStarted, setDownloadStarted] = useState(false);

  const generatePdf = async () => {
    setDownloadStarted(true);
    const data = pdfPrinter({ record, user });
    try {
      await makePdf(
        data.title,
        data.body,
        'medicalRecords',
        'Medical Records - Unified Radiology details - PDF generation error',
        runningUnitTest,
      );
    } catch {
      // makePdf handles error logging to Datadog/Sentry
    }
  };

  const generateTxt = async () => {
    setDownloadStarted(true);
    const data = txtPrinter({ record, user });
    generateTextFile(data.body, data.title);
  };

  const renderImagesError = () => (
    <va-alert status="error" visible data-testid="image-request-error-alert">
      <h3 slot="headline">We couldn’t access your images</h3>
      <p>Try again later.</p>
      <p>
        If it still doesn’t work, call us at{' '}
        <va-telephone contact="8773270022" /> (
        <va-telephone tty contact="711" />
        ). We’re here Monday through Friday, 8:00 a.m. to 8:00 p.m. ET.
      </p>
    </va-alert>
  );

  const renderImagesLink = () => {
    const thumbCount = scdfImageThumbnails?.length || 0;
    if (hasLoadedThumbnails) {
      const linkText =
        thumbCount > 0 ? (
          <>
            View
            {thumbCount > 1 ? ' all' : ''} {thumbCount}{' '}
            {thumbCount === 1 ? 'image' : 'images'}
          </>
        ) : (
          'View images'
        );
      const actionName = thumbCount > 0 ? 'View all images' : 'View images';
      return (
        <p className="vads-u-margin-bottom--0">
          <Link
            to={`/labs-and-tests/${labId}/images`}
            data-testid="radiology-view-all-images"
            onClick={() => sendDataDogAction(actionName)}
          >
            <strong>{linkText}</strong>
          </Link>
        </p>
      );
    }
    return (
      <div id="loading-images-spinner">
        <TrackedSpinner
          id="loading-images-spinner"
          message="Loading images..."
          data-testid="radiology-images-loading"
        />
      </div>
    );
  };

  return (
    <div className="vads-l-grid-container vads-u-padding-x--0 vads-u-margin-bottom--5">
      <PrintHeader />
      <HeaderSection
        header={record.name}
        className="vads-u-margin-bottom--0"
        aria-describedby="test-result-date"
        data-testid="radiology-name"
        data-dd-privacy="mask"
        data-dd-action-name="[radiology - name]"
      >
        <DateSubheading
          date={record.date}
          id="test-result-date"
          label={LABS_AND_TESTS_DISPLAY_LABELS.DATE}
          labelClass="vads-font-weight-regular"
        />

        {downloadStarted && <DownloadSuccessAlert />}

        {/*                   TEST DETAILS                          */}
        <div className="test-details-container max-80">
          <HeaderSection header="Details about this test">
            <LabelValue
              ifEmpty={emptyField}
              label={LABS_AND_TESTS_DISPLAY_LABELS.TEST_CODE}
              value={record.testCodeDisplay}
              testId="radiology-test-code"
              data-dd-action-name="[radiology - test code]"
            />
            {record.bodySite && (
              <LabelValue
                label={LABS_AND_TESTS_DISPLAY_LABELS.BODY_SITE}
                value={record.bodySite}
                testId="radiology-body-site"
                data-dd-action-name="[radiology - body site]"
              />
            )}
            <LabelValue
              ifEmpty={emptyField}
              label={
                record.bodySite
                  ? LABS_AND_TESTS_DISPLAY_LABELS.SAMPLE_TESTED
                  : LABS_AND_TESTS_DISPLAY_LABELS.SITE_OR_SAMPLE_TESTED
              }
              value={record.sampleTested}
              testId="radiology-sample-tested"
              data-dd-action-name="[radiology - sample tested]"
            />
            <LabelValue
              ifEmpty={emptyField}
              label={LABS_AND_TESTS_DISPLAY_LABELS.ORDERED_BY}
              value={record.orderedBy}
              testId="radiology-ordered-by"
              data-dd-action-name="[radiology - ordered by]"
            />
            <LabelValue
              ifEmpty={emptyField}
              label={LABS_AND_TESTS_DISPLAY_LABELS.LOCATION}
              value={record.location}
              testId="radiology-collecting-location"
              data-dd-action-name="[radiology - location]"
            />
            <LabelValue
              label={LABS_AND_TESTS_DISPLAY_LABELS.COMMENTS}
              element="div"
              testId="radiology-comments"
            >
              <ItemList list={record.comments} />
            </LabelValue>
            <LabelValue
              ifEmpty={emptyField}
              label={LABS_AND_TESTS_DISPLAY_LABELS.RESULTS}
              value={record.result}
              testId="radiology-results"
            />
          </HeaderSection>
        </div>

        {(record.imageCount > 0 || hasLoadedDicom) && (
          <>
            <div className="test-results-container">
              <HeaderSection header="Images" className="test-results-header">
                {hasImageError && !hasLoadedThumbnails
                  ? renderImagesError()
                  : renderImagesLink()}
                {!isCernerUser && (
                  <>
                    {notificationStatus ? (
                      <p>
                        <strong>Note: </strong> If you do not want us to notify
                        you about images, change your settings in your profile.
                      </p>
                    ) : (
                      <>
                        <h3>Get email notifications for images</h3>
                        <p>
                          If you want us to email you when your images are
                          ready, change your notification settings in your
                          profile.
                        </p>
                      </>
                    )}
                    <va-link
                      className="vads-u-margin-top--1"
                      href="/profile/notifications"
                      text="Go to notification settings"
                    />
                  </>
                )}
              </HeaderSection>
            </div>
            <div className="vads-u-margin-y--4 vads-u-border-top--1px vads-u-border-color--gray-light" />
          </>
        )}
      </HeaderSection>
      <div className="vads-u-margin-top--3">
        <DownloadingRecordsInfo description="L&TR Detail" />
      </div>
      <PrintDownload
        description="L&TR Detail"
        downloadPdf={generatePdf}
        downloadTxt={generateTxt}
      />
      <div className="vads-u-margin-y--5 vads-u-border-top--1px vads-u-border-color--white" />
    </div>
  );
};

export default UnifiedRadiologyDetails;

UnifiedRadiologyDetails.propTypes = {
  record: PropTypes.shape({
    name: PropTypes.string,
    date: PropTypes.string,
    testCode: PropTypes.string,
    testCodeDisplay: PropTypes.string,
    sampleTested: PropTypes.string,
    bodySite: PropTypes.string,
    orderedBy: PropTypes.string,
    location: PropTypes.string,
    comments: PropTypes.arrayOf(PropTypes.string),
    result: PropTypes.string,
    sortDate: PropTypes.string,
    source: PropTypes.string,
    imageCount: PropTypes.number,
    imagingStudyId: PropTypes.string,
  }).isRequired,
  runningUnitTest: PropTypes.bool,
  user: PropTypes.object,
};
