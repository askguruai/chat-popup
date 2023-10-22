import './App.css';
import { useState, useRef, useEffect } from 'react';
import Message from './components/Message';
import { getAnswer, reportAnalyticsEvent } from './AskGuru.js';
import PoweredByBlock from './components/PoweredByBlock';
import AskGuruIcon from './components/Icons/AskGuruIcon';
import ChatHelper from './ChatHelper';
import { localized } from './localization/Localization';

function App() {
  useEffect(() => {
    applyConfiguration();
  }, []);

  const [isLoading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [widgetConfiguration, setWidgetConfiguration] = useState(null);
  const [composeValue, setComposeValue] = useState('');
  const messagesRef = useRef([]);

  const regexPattern = new RegExp('{ *doc_idx *: *([^}]*)}');

  const clearConversation = () => {
    let state = ChatHelper.initialState(widgetConfiguration);
    setMessages(state);
    messagesRef.current = state;
  };

  useEffect(() => {
    updateScroll();
  }, [messages]);

  const applyChatHistory = (configuration) => {
    const state = ChatHelper.getState(configuration);
    setMessages(state);
    messagesRef.current = state;
  };

  const applyConfiguration = () => {
    const configurationRaw = localStorage.getItem('askguru-config');
    if (configurationRaw === null || configurationRaw === undefined) {
      setWidgetConfiguration(ChatHelper.fallbackConfiguration);
      applyChatHistory(ChatHelper.fallbackConfiguration);
      return;
    }
    try {
      const decodedConfiguration = JSON.parse(
        decodeURIComponent(escape(atob(configurationRaw))),
      );
      const configuration = decodedConfiguration;
      console.log({ configuration });
      setWidgetConfiguration(configuration);
      applyChatHistory(configuration);
    } catch (decodingError) { 
      console.error("Decoding Error", decodingError)
    }
  };

  const updateScroll = (behavior = 'smooth') => {
    const anchor = document.getElementById('askguru-scroll-anchor');
    try {
      anchor.scrollIntoView({ behavior: behavior });
    } catch (scrollError) {}
  };

  const resizeContainer = () => {
    try {
      const wrapper = document.getElementById('ask-guru-wrapper');
      if (wrapper.style.maxWidth === 'calc(100vw - 32px)') {
        wrapper.style.maxHeight = 'calc(100vh - 104px)';
        wrapper.style.maxWidth = 'calc(100vw - 32px)';
        wrapper.style.width = '450px';
        wrapper.style.height = '650px';
      } else {
        wrapper.style.maxWidth = 'calc(100vw - 32px)';
        wrapper.style.minWidth = 'calc(100vw - 32px)';
        wrapper.style.maxHeight = 'calc(100vh - 104px)';
        wrapper.style.minHeight = 'calc(100vh - 104px)';
      }
    } catch (e) {
      console.log(e);
    }
  };
  const createNewMessage = (role, content) => {
    return {
      role: role,
      content: content,
      id: null,
    };
  };

  const checkForHumanHelp = (request) => {
    if (request.includes('live') && request.includes('agent')) {
      return true;
    }
    return false;
  };

  const handleUserMessage = async (event) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    if (composeValue === undefined || composeValue === null) {
      return;
    }

    if (composeValue.length === 0) {
      return;
    }

    if (checkForHumanHelp(composeValue)) {
      reportAnalyticsEvent({
        eventType: 'POPUP_NO_ANSWER_CLIENT',
        eventContext: messagesRef.current,
      });
    }

    const newMessage = createNewMessage('user', composeValue);

    const newMessages = [...messages, newMessage];

    const requestData = {
      chat: JSON.stringify(newMessages),
      token: widgetConfiguration.token,
      projectToEn: widgetConfiguration.lang === 'en-US',
    };

    setComposeValue('');
    setMessages(newMessages);
    messagesRef.current = newMessages;
    setLoading(true);

    const newAssistantMessage = createNewMessage('assistant', '');
    const updatedMessagesV = [...messagesRef.current, newAssistantMessage];
    setMessages(updatedMessagesV);
    messagesRef.current = updatedMessagesV;

    const answerStream = getAnswer(requestData);

    let initialAnswer = '';
    let generated_sources = [];
    let message_id = null;

    answerStream.addEventListener('open', (event) => {
      try {
        // non used opening
      } catch (e) {
        console.log({ open: e });
      }
    });
    answerStream.addEventListener('message', (event) => {
      try {
        const messageData = JSON.parse(event.data);
        if (messageData.answer) {
          const { request_id, sources, answer } = messageData;
          if (sources.length === 0) {
            reportAnalyticsEvent({
              eventType: 'POPUP_NO_ANSWER_SERVER',
              eventContext: messagesRef.current,
            });
          }
          message_id = request_id;

          initialAnswer += answer;

          const match = initialAnswer.match(regexPattern);
          if (match) {
            const docIdx = match[1];
            const source = sources[docIdx];

            const link = source.id;
            source.link = link;

            var idx =
              generated_sources.findIndex(
                (existingSource) =>
                  existingSource.id === source.id &&
                  existingSource.collection === source.collection,
              ) + 1;
            if (idx === 0) {
              generated_sources.push(source);
              idx = generated_sources.length;
            }

            initialAnswer = initialAnswer.replace(
              regexPattern,
              `[[${idx}]](${link})`,
            );
          }

          const refIndex = messagesRef.current.length - 1;
          let tempArray = messagesRef.current;
          tempArray[refIndex].content = initialAnswer;
          if (message_id) {
            tempArray[refIndex].id = message_id;
          }
          setMessages([...tempArray]);
          messagesRef.current = tempArray;
        }
      } catch (e) {
        console.log(e);
      }
    });
    answerStream.addEventListener('error', (event) => {
      setLoading(false);
      answerStream.close();
      ChatHelper.saveState(messagesRef.current);
      setTimeout(() => {
        updateScroll();
      }, 25);
    });
  };

  if (widgetConfiguration === null) {
    return <></>;
  }

  return (
    <div className="askguru-container">
      <div className="askguru-header">
        <div className="askguru-ai-heading">
          {widgetConfiguration.whitelabel === false &&
            widgetConfiguration.popupIcon === null && <AskGuruIcon />}
          
          {widgetConfiguration.windowHeading === null ? (
            <>Chat with AI Assistant</>
          ) : (
            widgetConfiguration.windowHeading
          )}
        </div>
        <div className="askguru-header-buttons">
          <button
            className="askguru-small-btn askguru-ai-clear"
            aria-label={localized(widgetConfiguration.lang, "clear")}
            onClick={clearConversation}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="1em"
              viewBox="0 0 512 512"
            >
              <path
                d="M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z"
                fill="#333"
              />
            </svg>
            <div className="askguru-tooltip">{ localized(widgetConfiguration.lang, "clear")}</div>
          </button>
        </div>
      </div>
      <div className="askguru-content">
        {messages.map((message, index) => {
          return (
            <Message
              isLoading={isLoading}
              isFirst={index === 0}
              selectedColor={'#' + widgetConfiguration.color}
              isLast={messages.length - 1 === index}
              data={message}
            />
          );
        })}
        <div id="askguru-scroll-anchor"></div>
      </div>
      <div className="askguru-compose">
        <button
          aria-label={localized(widgetConfiguration.lang, "resize")}
          className="askguru-resize" onClick={resizeContainer}>
          <svg
            className="askguru-scale-btn"
            stroke="currentColor"
            fill="#838383"
            stroke-width="0"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path fill="none" d="M0 0h24v24H0z"></path>
              <path d="M16 3h6v6h-2V5h-4V3zM2 3h6v2H4v4H2V3zm18 16v-4h2v6h-6v-2h4zM4 19h4v2H2v-6h2v4z"></path>
            </g>
          </svg>
          <div className="askguru-tooltip-top">{ localized(widgetConfiguration.lang, "resize")}</div>
        </button>
        <form
          style={{ display: 'flex', gap: '8px', width: '100%' }}
          onSubmit={handleUserMessage}
        >
          <input
            type="text"
            value={composeValue}
            onChange={(e) => setComposeValue(e.target.value)}
            placeholder={localized(widgetConfiguration.lang, "inputPlaceholder")}
          ></input>
          <button
            aria-label={localized(widgetConfiguration.lang, "send")}
            type="submit"
            disabled={isLoading}
            className="askguru-submit-btn"
          >

          <div className="askguru-tooltip-top">{ localized(widgetConfiguration.lang, "send")}</div>
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_2124_88365)">
                <path
                  d="M16.6719 26.9102C17.5156 26.9102 18.1133 26.1836 18.5469 25.0586L26.2227 5.00781C26.4336 4.46875 26.5508 3.98827 26.5508 3.58983C26.5508 2.82811 26.082 2.35938 25.3203 2.35938C24.9219 2.35938 24.4414 2.47655 23.9023 2.68749L3.74609 10.4102C2.76172 10.7852 2 11.3828 2 12.2383C2 13.3164 2.82031 13.6797 3.94531 14.0195L12.4062 16.5039L14.8672 24.8594C15.2188 26.043 15.582 26.9102 16.6719 26.9102ZM12.9336 14.7227L4.84766 12.25C4.66016 12.1914 4.60156 12.1445 4.60156 12.0625C4.60156 11.9805 4.64844 11.9219 4.82422 11.8516L20.668 5.85156C21.6055 5.5 22.5078 5.03125 23.375 4.63281C22.6016 5.26561 21.6406 6.01562 20.9961 6.66016L12.9336 14.7227ZM16.8594 24.332C16.7656 24.332 16.7188 24.25 16.6602 24.0625L14.1875 15.9766L22.25 7.91405C22.8828 7.28124 23.668 6.29688 24.2891 5.49999C23.8906 6.39061 23.4102 7.29296 23.0586 8.24218L17.0586 24.0859C16.9883 24.2617 16.9414 24.332 16.8594 24.332Z"
                  fill="#838383"
                  fill-opacity="0.85"
                />
              </g>
              <defs>
                <clipPath id="clip0_2124_88365">
                  <rect
                    width="24.5508"
                    height="25.9102"
                    fill="white"
                    transform="translate(2 1)"
                  />
                </clipPath>
              </defs>
            </svg>
          </button>
        </form>
      </div>
      {widgetConfiguration.whitelabel === false && <PoweredByBlock />}
    </div>
  );
}

export default App;
