/**
 * Client for interacting with LangGraph backend.
 * @constructor
 * @param {string} url - url of the langgraph instance, defaults to env var VIRTUAL_AGENT_BACKEND_URL.
 */
export class LangGraphClient {
  constructor(url = process.env.VIRTUAL_AGENT_BACKEND_URL) {
    const normalizedUrl = url?.trim();

    if (!normalizedUrl) {
      throw new Error(
        'LangGraphClient requires a URL. Set VIRTUAL_AGENT_BACKEND_URL or pass one explicitly.',
      );
    }

    try {
      // Validate URL at construction time so fetch errors fail fast and clearly.
      new URL(normalizedUrl); // eslint-disable-line no-new
    } catch {
      throw new Error(`LangGraphClient URL is invalid: ${normalizedUrl}`);
    }

    this.url = normalizedUrl;
  }

  healthOkGet = async options => {
    const res = await fetch(`${this.url}/ok`, {
      ...(options || {}),
      method: 'GET',
    });

    const body = [204, 205, 304].includes(res.status) ? null : await res.text();

    const data = body ? JSON.parse(body) : {};
    return {
      data,
      status: res.status,
      headers: res.headers,
    };
  };

  /**
   *
   * @param {*} options - request options
   * @returns {response} - response
   */
  postCreateThread = async options => {
    const res = await fetch(`${this.url}/threads`, {
      ...(options || {}),
      method: 'POST',
    });

    const body = [204, 205, 304].includes(res.status) ? null : await res.text();

    const data = body ? JSON.parse(body) : {};
    return {
      data,
      status: res.status,
      headers: res.headers,
    };
  };

  /**
   *
   * @param {string} threadId - id of thread
   * @param {*} options - request options
   * @returns {response} - response
   */
  getThreadState = async (threadId, options) => {
    const res = await fetch(`${this.url}/threads/${threadId}/state`, {
      ...(options || {}),
      method: 'GET',
    });

    const body = [204, 205, 304].includes(res.status) ? null : await res.text();

    const data = body ? JSON.parse(body) : {};
    return {
      data,
      status: res.status,
      headers: res.headers,
    };
  };

  /**
   *
   * @param {string} threadId - thread id
   * @param {*} reqBody - request body
   * @param {*} options - request options
   * @returns {response}
   */
  postRunsStream = async (threadId, reqBody, options) => {
    const res = await fetch(`${this.url}/threads/${threadId}/runs/stream`, {
      ...(options || {}),
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: JSON.stringify(reqBody),
    });

    const body = [204, 205, 304].includes(res.status) ? null : await res.text();

    const data = body ? JSON.parse(body) : {};
    return {
      data,
      status: res.status,
      headers: res.headers,
    };
  };
}
