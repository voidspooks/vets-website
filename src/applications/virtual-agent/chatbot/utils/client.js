export const getHealthOkGetUrl = () => {
  return `/ok`;
};

export const healthOkGet = async options => {
  const res = await fetch(getHealthOkGetUrl(), {
    ...options,
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

export const getCreateThreadThreadsPostUrl = () => {
  return `/threads`;
};

export const createThreadThreadsPost = async options => {
  const res = await fetch(getCreateThreadThreadsPostUrl(), {
    ...options,
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

export const getThreadStateThreadsThreadIdStateGetUrl = threadId => {
  return `/threads/${threadId}/state`;
};

export const threadStateThreadsThreadIdStateGet = async (threadId, options) => {
  const res = await fetch(getThreadStateThreadsThreadIdStateGetUrl(threadId), {
    ...options,
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

export const getRunsStreamThreadsThreadIdRunsStreamPostUrl = threadId => {
  return `/threads/${threadId}/runs/stream`;
};

export const runsStreamThreadsThreadIdRunsStreamPost = async (
  threadId,
  runCreateStateful,
  options,
) => {
  const res = await fetch(
    getRunsStreamThreadsThreadIdRunsStreamPostUrl(threadId),
    {
      ...options,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: JSON.stringify(runCreateStateful),
    },
  );

  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data = body ? JSON.parse(body) : {};
  return {
    data,
    status: res.status,
    headers: res.headers,
  };
};
