import { subMonths } from 'date-fns';
import { Actions } from '../util/actionTypes';
import { getCareTeamCrosswalk, searchFolderAdvanced } from '../api/SmApi';
import { DefaultFolders } from '../util/constants';

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

export const findCareTeamChangeMessage = () => async dispatch => {
  try {
    const toDateTime = new Date().toISOString();
    const fromDateTime = subMonths(new Date(), 6).toISOString();
    const response = await searchFolderAdvanced(DefaultFolders.INBOX.id, {
      fromDate: fromDateTime,
      toDate: toDateTime,
    });
    const match = (response?.data || []).find(msg =>
      msg.attributes?.subject?.toLowerCase().includes('your new care team'),
    );
    const messageId = match?.attributes?.messageId ?? null;
    dispatch({
      type: Actions.CareTeamChanges.SET_MESSAGE_ID,
      payload: messageId,
    });
    return messageId;
  } catch {
    return null;
  }
};
