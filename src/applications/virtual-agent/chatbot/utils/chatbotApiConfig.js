import environment from 'platform/utilities/environment';

export const CHATBOT_API_URLS = Object.freeze({
  localhost: 'http://localhost:2024',
  dev: 'https://va-staging-root-bot.azurewebsites.us',
  staging: 'https://va-staging-root-bot.azurewebsites.us',
  production: 'https://va-staging-root-bot.azurewebsites.us',
});

const getEnvironmentKey = (env = environment) => {
  if (env.isProduction()) {
    return 'production';
  }

  if (env.isStaging()) {
    return 'staging';
  }

  if (env.isDev()) {
    return 'dev';
  }

  return 'localhost';
};

/**
 * Returns chatbot backend base URL independent from environment.API_URL.
 * Runtime override can be provided via window.__CHATBOT_API_URL__.
 * @returns {string}
 */
export const getChatbotApiBaseUrl = (env = environment) => {
  const runtimeOverride = globalThis?.__CHATBOT_API_URL__;

  if (runtimeOverride && typeof runtimeOverride === 'string') {
    return runtimeOverride;
  }

  return CHATBOT_API_URLS[getEnvironmentKey(env)] || CHATBOT_API_URLS.localhost;
};
