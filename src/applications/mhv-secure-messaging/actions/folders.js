import { Actions } from '../util/actionTypes';
import {
  getFolderList,
  getFolder,
  createFolder,
  deleteFolder,
  updateFolderName,
} from '../api/SmApi';
import { addAlert } from './alerts';
import * as Constants from '../util/constants';
import { getFirstError } from '../util/serverErrors';
import { sendDatadogError } from '../util/helpers';

const CUSTOM_FOLDER_RETRY_ATTEMPTS = 2;
const CUSTOM_FOLDER_RETRY_DELAY = 2000;

const systemFolderFallback = {
  [Constants.DefaultFolders.INBOX.id]: {
    folderId: Constants.DefaultFolders.INBOX.id,
    name: Constants.DefaultFolders.INBOX.header,
    count: 0,
    unreadCount: 0,
    systemFolder: true,
  },
  [Constants.DefaultFolders.SENT.id]: {
    folderId: Constants.DefaultFolders.SENT.id,
    name: Constants.DefaultFolders.SENT.header,
    count: 0,
    unreadCount: 0,
    systemFolder: true,
  },
  [Constants.DefaultFolders.DRAFTS.id]: {
    folderId: Constants.DefaultFolders.DRAFTS.id,
    name: Constants.DefaultFolders.DRAFTS.header,
    count: 0,
    unreadCount: 0,
    systemFolder: true,
  },
  [Constants.DefaultFolders.DELETED.id]: {
    folderId: Constants.DefaultFolders.DELETED.id,
    name: Constants.DefaultFolders.DELETED.header,
    count: 0,
    unreadCount: 0,
    systemFolder: true,
  },
};

const isSystemFolder = id => id !== undefined && id <= 0;

const handleErrors = err => async dispatch => {
  const newErr = getFirstError(err);
  dispatch({
    type: Actions.Alerts.ADD_ALERT,
    payload: {
      alertType: 'error',
      header: newErr.title,
      content: newErr.detail,
      response: newErr,
    },
  });
};

export const getFolders = () => async dispatch => {
  try {
    const response = await getFolderList();
    if (response.data) {
      dispatch({
        type: Actions.Folder.GET_LIST,
        response,
      });
    }
    if (response.errors) {
      dispatch(handleErrors(response));
    }
  } catch (error) {
    sendDatadogError(error, 'action_folders_getFolders');
    dispatch(handleErrors(error));
    dispatch({
      type: Actions.Folder.GET_LIST_ERROR,
    });
  }
};

export const retrieveFolder = folderId => async (dispatch, getState) => {
  if (folderId === undefined || folderId === null) return;

  const dispatchFolderResponse = response => {
    if (
      response.data.attributes.folderId === Constants.DefaultFolders.DELETED.id
    ) {
      response.data.attributes.name = Constants.DefaultFolders.DELETED.header;
    }
    dispatch({
      type: Actions.Folder.GET,
      response,
    });
  };

  const dispatchFallback = id => {
    const { folderList } = getState().sm.folders;
    const fromList = folderList?.find(f => Number(f.id) === Number(id));
    const fallback = fromList
      ? {
          folderId: fromList.id,
          name: fromList.name,
          count: fromList.count,
          unreadCount: fromList.unreadCount,
          systemFolder: fromList.systemFolder,
        }
      : systemFolderFallback[id];
    if (fallback) {
      dispatch({
        type: Actions.Folder.GET,
        response: { data: { attributes: { ...fallback } } },
      });
    }
  };

  const attemptFetch = () => getFolder({ folderId });

  try {
    const response = await attemptFetch();
    if (response.data) {
      dispatchFolderResponse(response);
      return;
    }
    if (response.errors) {
      throw response;
    }
  } catch (error) {
    sendDatadogError(error, 'action_folders_retrieveFolder');

    if (isSystemFolder(folderId)) {
      dispatchFallback(folderId);
      return;
    }

    // Retry logic for custom folders
    const retryFetch = async attemptsLeft => {
      if (attemptsLeft <= 0) return null;
      await new Promise(resolve =>
        setTimeout(resolve, CUSTOM_FOLDER_RETRY_DELAY),
      );
      try {
        const retryResponse = await attemptFetch();
        if (retryResponse.data) return retryResponse;
      } catch {
        // continue to next retry
      }
      return retryFetch(attemptsLeft - 1);
    };

    const retryResponse = await retryFetch(CUSTOM_FOLDER_RETRY_ATTEMPTS);
    if (retryResponse) {
      dispatchFolderResponse(retryResponse);
      return;
    }

    // Try folderList fallback before giving up
    const { folderList } = getState().sm.folders;
    const fromList = folderList?.find(f => Number(f.id) === Number(folderId));
    if (fromList) {
      dispatch({
        type: Actions.Folder.GET,
        response: {
          data: {
            attributes: {
              folderId: fromList.id,
              name: fromList.name,
              count: fromList.count,
              unreadCount: fromList.unreadCount,
              systemFolder: fromList.systemFolder,
            },
          },
        },
      });
      return;
    }

    dispatch({
      type: Actions.Folder.GET,
      response: null,
    });
    dispatch(handleErrors(error));
  }
};

export const clearFolder = () => async dispatch => {
  dispatch({ type: Actions.Folder.CLEAR });
};

export const newFolder = (
  folderName,
  suppressSuccessAlert = false,
) => async dispatch => {
  try {
    const response = await createFolder(folderName);

    dispatch({
      type: Actions.Folder.CREATE,
      response,
    });
    dispatch(getFolders());

    if (!suppressSuccessAlert) {
      dispatch(
        addAlert(
          Constants.ALERT_TYPE_SUCCESS,
          '',
          Constants.Alerts.Folder.CREATE_FOLDER_SUCCESS,
        ),
      );
    }
    return response.data.attributes;
  } catch (e) {
    sendDatadogError(e, 'action_folders_newFolder');
    if (e.errors && e.errors.length > 0 && e.errors[0].code === 'SM126') {
      dispatch(
        addAlert(
          Constants.ALERT_TYPE_ERROR,
          '',
          Constants.Alerts.Folder.FOLDER_NAME_TAKEN,
        ),
      );
    } else {
      dispatch(
        addAlert(
          Constants.ALERT_TYPE_ERROR,
          '',
          Constants.Alerts.Folder.CREATE_FOLDER_ERROR,
        ),
      );
    }
    throw e;
  }
};

export const delFolder = folderId => async dispatch => {
  try {
    await deleteFolder(folderId);
    dispatch({ type: Actions.Folder.DELETE });
    dispatch(
      addAlert(
        Constants.ALERT_TYPE_SUCCESS,
        '',
        Constants.Alerts.Folder.DELETE_FOLDER_SUCCESS,
      ),
    );
  } catch (error) {
    sendDatadogError(error, 'action_folders_delFolder');
    dispatch(
      addAlert(
        Constants.ALERT_TYPE_ERROR,
        '',
        Constants.Alerts.Folder.DELETE_FOLDER_ERROR,
      ),
    );
  }
};

export const renameFolder = (
  folderId,
  newName,
  suppressSuccessAlert = false,
) => async dispatch => {
  try {
    await updateFolderName(folderId, newName);
    await dispatch(getFolders());
    await dispatch(retrieveFolder(folderId));
    if (!suppressSuccessAlert) {
      dispatch(
        addAlert(
          Constants.ALERT_TYPE_SUCCESS,
          '',
          Constants.Alerts.Folder.RENAME_FOLDER_SUCCESS,
        ),
      );
    }
    return true; // Indicate success to caller
  } catch (e) {
    sendDatadogError(e, 'action_folders_renameFolder');
    if (e.errors && e.errors.length > 0 && e.errors[0].code === 'SM126') {
      dispatch(
        addAlert(
          Constants.ALERT_TYPE_ERROR,
          '',
          Constants.Alerts.Folder.FOLDER_NAME_TAKEN,
        ),
      );
    } else {
      dispatch(
        addAlert(
          Constants.ALERT_TYPE_ERROR,
          '',
          Constants.Alerts.Folder.RENAME_FOLDER_ERROR,
        ),
      );
    }
    throw e; // Re-throw so component can handle error state
  }
};
