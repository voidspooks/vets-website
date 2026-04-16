/**
 * Function to add an action to DataDog RUM.
 *
 * This should not be used directly; instead, use datadogRumTracking#trackAction for centralized tracking. This is
 * extracted purely to make mocking easier.
 *
 * @param {string} actionName - Name of the action to track
 * @param {object} properties - Properties to attach to the action
 */
export const datadogRumAddAction = (actionName, properties) => {
  try {
    // Use window.DD_RUM (CDN async pattern) instead of module import
    // to avoid "Cannot read properties of undefined" errors in Cypress tests.
    // See: src/platform/monitoring/Datadog/utilities.js for pattern documentation.
    window.DD_RUM?.addAction(actionName, properties);
  } catch (error) {
    // Silent fail - tracking should never break the form
  }
};
