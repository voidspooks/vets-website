import { combineReducers } from 'redux';

import claimsV2 from './claimsV2';
import claimDetail from './claim-detail';
import claimAsk from './claim-ask';
import claimSync from './claim-sync';
import uploads from './uploads';
import failedUploads from './failed-uploads';
import intentsToFile from './intents-to-file';
import routing from './routing';
import notifications from './notifications';

export default {
  disability: combineReducers({
    status: combineReducers({
      claimsV2,
      claimDetail,
      claimAsk,
      claimSync,
      uploads,
      failedUploads,
      intentsToFile,
      routing,
      notifications,
    }),
  }),
};
