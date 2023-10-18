import axios from 'axios';
import { EventSourcePolyfill } from 'event-source-polyfill';
import qs from 'qs';

const CLIENT_TOKEN = JSON.parse(
  decodeURIComponent(escape(atob(localStorage.getItem('askguru-config')))),
).token;

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

const createApiRequestStream = ({
  url,
  version,
  route,
  accessToken,
  params = {},
}) => {
  try {
    const queryString = qs.stringify(params, { arrayFormat: 'repeat' });
    const eventSourceUrl = `${url}/${version}${route}?${queryString}`;
    const eventSource = new EventSourcePolyfill(eventSourceUrl, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });
    return eventSource;
  } catch (apiRequestStreamError) {
    console.error({ apiRequestStreamError });
  }
};

const getAnswer = ({ chat, token, projectToEn }) => {
  return createApiRequestStream({
    url: config.askguruAPI,
    version: config.askguruApiVersion,
    route: `/collections/answer`,
    accessToken: token,
    params: {
      collections: config.collections,
      chat: chat,
      stream: true,
      project_to_en: projectToEn,
    },
  });
};

const setAnswerRating = async ({ request_id, like_status }) => {
  const route = '/reactions';
  const REQUEST_URL = `${config.askguruAPI}/${config.askguruApiVersion}${route}`;
  const REQUEST_BODY = {
    request_id,
    like_status,
  };

  const REQUEST_CONFIG = {
    headers: {
      Authorization: 'Bearer ' + CLIENT_TOKEN,
    },
  };

  await axios.post(REQUEST_URL, REQUEST_BODY, REQUEST_CONFIG);
};

const reportAnalyticsEvent = async ({ eventType, eventContext = [] }) => {
  try {
    const route = '/events';
    const REQUEST_URL = `${config.askguruAPI}/${config.askguruApiVersion}${route}`;
    const REQUEST_BODY = {
      type: eventType,
      context: { chat: eventContext },
    };
    const REQUEST_CONFIG = {
      headers: {
        Authorization: 'Bearer ' + CLIENT_TOKEN,
      },
    };
    await axios.post(REQUEST_URL, REQUEST_BODY, REQUEST_CONFIG);
  } catch (reportError) {
    console.error(reportError);
  }
};

export { getAnswer, setAnswerRating, reportAnalyticsEvent };
