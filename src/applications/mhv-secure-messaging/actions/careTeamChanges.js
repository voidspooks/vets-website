import { Actions } from '../util/actionTypes';
import { getCareTeamCrosswalk } from '../api/SmApi';

export const getCareTeamChanges = () => async dispatch => {
  try {
    dispatch({ type: Actions.CareTeamChanges.GET });
    const response = await getCareTeamCrosswalk();
    const changes = (response?.data || []).map(entry => entry.attributes);
    dispatch({ type: Actions.CareTeamChanges.GET_SUCCESS, response: changes });
    return changes;
  } catch (error) {
    dispatch({ type: Actions.CareTeamChanges.GET_ERROR, error });
    return undefined;
  }
};
