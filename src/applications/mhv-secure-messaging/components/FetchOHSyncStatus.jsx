import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectProfile } from '@department-of-veterans-affairs/platform-user/selectors';
import { fetchOHSyncStatus } from '../actions/ohSyncStatus';

const FetchOHSyncStatus = () => {
  const dispatch = useDispatch();
  const isAtPretransitionedOhFacility = useSelector(
    state => selectProfile(state)?.userAtPretransitionedOhFacility,
  );

  useEffect(
    () => {
      if (isAtPretransitionedOhFacility) {
        dispatch(fetchOHSyncStatus());
      }
    },
    [dispatch, isAtPretransitionedOhFacility],
  );

  return null;
};

export default FetchOHSyncStatus;
