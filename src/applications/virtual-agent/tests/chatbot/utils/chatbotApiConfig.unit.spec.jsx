import { expect } from 'chai';
import {
  CHATBOT_API_URLS,
  getChatbotApiBaseUrl,
} from '../../../chatbot/utils/chatbotApiConfig';

describe('chatbotApiConfig', () => {
  afterEach(() => {
    delete global.__CHATBOT_API_URL__;
  });

  it('uses runtime override when provided', () => {
    global.__CHATBOT_API_URL__ = 'http://localhost:9999';

    expect(getChatbotApiBaseUrl()).to.equal('http://localhost:9999');
  });

  it('uses localhost URL for localhost builds', () => {
    const env = {
      isDev: () => false,
      isProduction: () => false,
      isStaging: () => false,
    };

    expect(getChatbotApiBaseUrl(env)).to.equal(CHATBOT_API_URLS.localhost);
  });

  it('uses dev URL for dev builds', () => {
    const env = {
      isDev: () => true,
      isProduction: () => false,
      isStaging: () => false,
    };

    expect(getChatbotApiBaseUrl(env)).to.equal(CHATBOT_API_URLS.dev);
  });

  it('uses staging URL for staging builds', () => {
    const env = {
      isDev: () => false,
      isProduction: () => false,
      isStaging: () => true,
    };

    expect(getChatbotApiBaseUrl(env)).to.equal(CHATBOT_API_URLS.staging);
  });

  it('uses production URL for production builds', () => {
    const env = {
      isDev: () => false,
      isProduction: () => true,
      isStaging: () => false,
    };

    expect(getChatbotApiBaseUrl(env)).to.equal(CHATBOT_API_URLS.production);
  });
});
