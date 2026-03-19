/**
 * Use this module in a validation function to determine if validation
 * was triggered by user attempting to navigate form page
 */
const navigationState = {
  // Ephemeral: resets to false via setTimeout after the current execution context
  _navigationEvent: false,
  // Persistent: remains true until resetNavigation() is called (e.g., on page change)
  _navigationAttempted: false,
  _currentPath: null,

  handleNavigation() {
    this.setNavigationEvent();
    this.setNavigationAttempted();
  },

  setNavigationEvent() {
    this._navigationEvent = true;
    this._currentPath = window.location.href;
    setTimeout(() => {
      this._navigationEvent = false;
      this._currentPath = null;
    }, 0);
  },

  setNavigationAttempted() {
    this._navigationAttempted = true;
  },

  resetNavigation() {
    this._navigationAttempted = false;
  },

  getNavigationEventStatus() {
    // only return true if the navigation happened on the current page
    return this._navigationEvent && this._currentPath === window.location.href;
  },

  getNavigationAttemptStatus() {
    return this._navigationAttempted;
  },
};

export default navigationState;
