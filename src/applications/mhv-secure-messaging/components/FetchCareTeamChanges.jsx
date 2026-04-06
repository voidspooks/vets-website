import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useFeatureToggles from '../hooks/useFeatureToggles';
import { getCareTeamChanges } from '../actions/careTeamChanges';

const FetchCareTeamChanges = () => {
  const dispatch = useDispatch();
  const { ehrCrosswalkEnabled } = useFeatureToggles();

  useEffect(
    () => {
      if (ehrCrosswalkEnabled) {
        dispatch(getCareTeamChanges());
      }
    },
    [dispatch, ehrCrosswalkEnabled],
  );

  return null;
};

export default FetchCareTeamChanges;
