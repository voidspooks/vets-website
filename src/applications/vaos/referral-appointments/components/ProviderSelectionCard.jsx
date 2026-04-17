import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { format, parseISO } from 'date-fns';
import { recordEvent } from '@department-of-veterans-affairs/platform-monitoring/exports';
import { routeToNextReferralPage } from '../flow';
import {
  getReferralProviderKey,
  buildProviderSlotsQueryParams,
} from '../utils/referrals';
import { setProviderSlotsParams } from '../redux/actions';
import { selectCurrentPage } from '../redux/selectors';
import ListItem from '../../components/ListItem';
import AppointmentRow from '../../components/AppointmentRow';
import AppointmentColumn from '../../components/AppointmentColumn';
import { GA_PREFIX, DATE_FORMATS } from '../../utils/constants';

export default function ProviderSelectionCard({ provider, index, referralId }) {
  const first = index === 0;
  const currentPage = useSelector(selectCurrentPage);
  const dispatch = useDispatch();
  const history = useHistory();

  const goToNextPage = e => {
    e.preventDefault();
    recordEvent({
      event: `${GA_PREFIX}-provider-selection-pressed`,
    });
    const slotsParams = buildProviderSlotsQueryParams(provider);
    if (slotsParams) {
      dispatch(setProviderSlotsParams(slotsParams));
    }
    sessionStorage.setItem(
      getReferralProviderKey(referralId),
      String(provider.id),
    );
    routeToNextReferralPage(
      history,
      currentPage,
      referralId,
      null,
      provider?.id,
    );
  };

  if (!provider) {
    return null;
  }

  // API value is snake_case; local binding avoids a non-camelCase object literal key under eslint.
  const communityCareProviderType = 'community_care';
  const careTypeMap = {
    va: 'VA care',
    [communityCareProviderType]: 'Community care',
    CC: 'Community care',
    'COMMUNITY CARE': 'Community care',
    VA: 'VA care',
  };
  const careType =
    careTypeMap[provider.providerType] ||
    careTypeMap[provider.careType] ||
    provider.careType ||
    '';

  const formattedDate = provider.nextAvailableDate
    ? format(
        parseISO(provider.nextAvailableDate),
        DATE_FORMATS.friendlyWeekdayDate,
      )
    : '';

  const driveTimeDisplay =
    provider.distanceInMiles != null
      ? `${provider.driveTime} (${provider.distanceInMiles} miles)`
      : provider.driveTime;

  return (
    <ListItem borderTop={first} borderBottom>
      <AppointmentRow className="vads-u-padding-y--1 mobile:vads-u-flex-direction--row">
        <AppointmentColumn className="vads-u-padding-y--1" size="1">
          <div data-testid="provider-selection-card">
            <h2
              className="vads-u-font-size--h3 vads-u-margin--0"
              data-testid="provider-name"
            >
              {provider.name}
            </h2>
            <p
              className="vads-u-font-size--h3 vads-u-margin--0 vads-u-padding-bottom--1"
              data-testid="provider-care-type"
            >
              {careType}
            </p>
            <p className="vads-u-margin--0" data-testid="facility-name">
              {provider.facilityName}
            </p>
            <p
              className="vads-u-margin--0  vads-u-padding-bottom--1"
              data-testid="drive-time"
            >
              {driveTimeDisplay}
            </p>
            <p className="vads-u-margin--0" data-testid="next-available-label">
              Next available:
            </p>
            <p
              className="vads-u-margin--0 vads-u-padding-bottom--1 vads-u-font-weight--bold"
              data-testid="next-available-date"
            >
              {formattedDate}
            </p>
            <va-link
              class="vads-u-margin-top--2"
              active
              href={`date-time?id=${referralId}&providerId=${provider.id}`}
              text="Review available appointments"
              onClick={goToNextPage}
            />
          </div>
        </AppointmentColumn>
      </AppointmentRow>
    </ListItem>
  );
}

ProviderSelectionCard.propTypes = {
  index: PropTypes.number.isRequired,
  provider: PropTypes.object.isRequired,
  referralId: PropTypes.string.isRequired,
};
