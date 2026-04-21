import React from 'react';
import PropTypes from 'prop-types';

import RoutedSavableApp from 'platform/forms/save-in-progress/RoutedSavableApp';
import {
  DowntimeNotification,
  externalServices,
} from '@department-of-veterans-affairs/platform-monitoring/DowntimeNotification';
import formConfig from '../config/form';

export default function App({ location, children }) {
  return (
    <RoutedSavableApp formConfig={formConfig} currentLocation={location}>
      <DowntimeNotification
        appTitle="Specially Adapted Housing or Special Home Adaptation Grant system"
        // Form 26-4555 uses SAHSHA (LGY Service) for submission, not Lighthouse Benefits Intake.
        // See: vets-api/modules/simple_forms_api/app/controllers/simple_forms_api/v1/uploads_controller.rb#L137-L161
        dependencies={[externalServices.sahsha]}
      >
        {children}
      </DowntimeNotification>
    </RoutedSavableApp>
  );
}

App.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object.isRequired,
};
