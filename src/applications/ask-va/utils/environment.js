import environment from '@department-of-veterans-affairs/platform-utilities/environment';

// This is just a wrapper to allow us to stub this function in unit tests via sinon
export const isProduction = () => environment.isProduction();
