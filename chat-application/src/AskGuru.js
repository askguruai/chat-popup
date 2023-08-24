import { EventSourcePolyfill } from 'event-source-polyfill';
import qs from 'qs';

const CLIENT_TOKEN = localStorage.getItem('askguru-token');

const config = {
  askguruAPI: 'https://api.askguru.ai',
  askguruApiVersion: 'v2',
  askguruSourcePattern: '{ *doc_idx *: *([^}]*)}',
  streamGetAnswer: true,
  vendor: 'askgurupublic',
  collections: ['website'],
  password: 'qy3vKVDVUtzCYDIZbYFozXlBp',
  queryPlaceholder: 'Your question here...',
};

const createApiRequestStream = ({ url, version, route, accessToken, params = {} }) => {
  try {
    const queryString = qs.stringify(params, { arrayFormat: 'repeat' });
    const eventSourceUrl = `${url}/${version}${route}?${queryString}`;

    console.log({ url, version, route, accessToken, params });
    console.log(eventSourceUrl);
    const eventSource = new EventSourcePolyfill(eventSourceUrl, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });

    console.log({ eventSource });
    return eventSource;
  } catch (apiRequestStreamError) {
    console.error({ apiRequestStreamError });
  }
};

const getAnswer = ({ chat, query, document = '', documentCollection = '' }) => {
  return createApiRequestStream({
    url: config.askguruAPI,
    version: config.askguruApiVersion,
    route: `/collections/answer`,
    accessToken: CLIENT_TOKEN,
    params: {
      collections: config.collections,
      chat: chat,
      stream: true,
    },
  });
};

export { getAnswer };
