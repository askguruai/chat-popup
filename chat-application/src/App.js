import './App.css';
import { useState, useRef, useEffect } from 'react';
import Message from './components/Message';
import { getAnswer, reportAnalyticsEvent } from './AskGuru.js';
import PoweredByBlock from './components/PoweredByBlock';

function App() {
  useEffect(() => {
    applyConfiguration();
    applyChatHistory();
    getApplicationColor();
  }, []);

  const chatInitialState = [
    {
      role: 'assistant',
      content:
        "Hi! I'm AskGuru AI Assistant. Nice to meet you! 👋 Search the docs or ask a question...",
    },
  ];

  const [isLoading, setLoading] = useState(false);
  const [messages, setMessages] = useState(chatInitialState);
  const [widgetConfiguration, setWidgetConfiguration] = useState(null);
  const [composeValue, setComposeValue] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const messagesRef = useRef(chatInitialState);

  const regexPattern = new RegExp('{ *doc_idx *: *([^}]*)}');

  const getApplicationColor = () => {
    const currentColor = localStorage.getItem('askguru-color');
    if (currentColor === null) {
      setSelectedColor('#18b569');
    } else {
      if (currentColor.startsWith('#')) {
        setSelectedColor(currentColor);
      } else {
        setSelectedColor('#18b569');
      }
    }
  };

  const saveChatHistory = () => {
    const currentHistory = JSON.stringify(messagesRef.current);
    localStorage.setItem('askguru-history', currentHistory);
  };

  const clearConversation = () => {
    setMessages(chatInitialState);
    messagesRef.current = chatInitialState;
    localStorage.removeItem('askguru-history');
  };

  useEffect(() => {
    updateScroll();
  }, [messages]);

  const applyChatHistory = () => {
    const chatHistoryRaw = localStorage.getItem('askguru-history');

    if (chatHistoryRaw !== null && chatHistoryRaw !== undefined) {
      const savedHistory = JSON.parse(chatHistoryRaw);
      messagesRef.current = savedHistory;
      setMessages(savedHistory);
    }
  };

  const applyConfiguration = () => {
    const configurationRaw = localStorage.getItem('askguru-config');
    if (configurationRaw === null) { 
      return;
    }
    const configuration = JSON.parse(configurationRaw)
    console.log({configuration})
    setWidgetConfiguration(configuration)
  }

  const updateScroll = (behavior = 'smooth') => {
    const anchor = document.getElementById('askguru-scroll-anchor');
    anchor.scrollIntoView({ behavior: behavior });
  };

  const openAskGuru = () => {
    try {
      window.open('https://www.askguru.ai/', '_blank').focus();
    } catch (error) {
      console.error({ error });
    }
  };

  const resizeContainer = () => {
    try {
      const wrapper = document.getElementById('ask-guru-wrapper');
      if (wrapper.style.maxWidth === 'calc(100vw - 32px)') {
        wrapper.style.maxWidth = '450px';
        wrapper.style.maxHeight = '650px';
      } else {
        wrapper.style.maxWidth = 'calc(100vw - 32px)';
        wrapper.style.maxHeight = 'calc(100vh - 32px)';
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleClose = (event) => {
    event.preventDefault();
    try {
      const wrapper = document.getElementById('ask-guru-wrapper');
      const askGuruBtn = document.getElementById('ask-guru-static-btn');
      wrapper.style.opacity = 0;
      wrapper.style.display = 'none';
      wrapper.style.zIndex = 10;
      askGuruBtn.style.opacity = 1;
      askGuruBtn.style.display = 'flex';
    } catch (e) {
      console.error(e);
    }
  };

  const createNewMessage = (role, content) => {
    const newMessage = {
      role: role,
      content: content,
      id: null,
    };
    return newMessage;
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
      saveChatHistory();
    });
  };

  return (
    <div className="askguru-container">
      <div className="askguru-header">
        <div className="askguru-ai-heading">
          <svg
            width="512"
            height="512"
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M307.111 372.809V334.812C307.111 310.038 286.756 290.831 260.16 290.831H47.0992C20.5038 290.831 0 271.623 0 246.849V139.26C0 114.207 20.5038 95 47.0992 95H260.16C286.756 95 307.111 114.207 307.111 139.26V246.71C307.111 271.484 327.615 290.691 354.21 290.691H464.901C491.496 290.691 512 309.899 512 334.673V372.67C512 397.723 491.496 416.93 464.901 416.93H354.21C327.615 416.93 307.111 397.723 307.111 372.67V372.809Z"
              fill="url(#paint0_linear_616_1922)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_616_1922"
                x1="256"
                y1="95"
                x2="254.979"
                y2="771.681"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#19EA85" />
                <stop offset="1" />
              </linearGradient>
            </defs>
          </svg>
          Chat with AI Assistant
        </div>
        <div className="askguru-header-buttons">
          <button
            className="askguru-small-btn askguru-ai-clear"
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
            <div className="askguru-tooltip">Clear</div>
          </button>
          <button
            className="askguru-small-btn askguru-ai-close"
            onClick={handleClose}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.1836 20.4805C14.4766 20.4805 14.7695 20.3633 14.9688 20.1406L24.0391 10.8477C24.2383 10.6484 24.3555 10.3906 24.3555 10.0977C24.3555 9.48828 23.8984 9.01953 23.2891 9.01953C22.9961 9.01953 22.7266 9.13672 22.5273 9.32422L13.5508 18.5H14.8047L5.82812 9.32422C5.64062 9.13672 5.37109 9.01953 5.06641 9.01953C4.45703 9.01953 4 9.48828 4 10.0977C4 10.3906 4.11719 10.6484 4.31641 10.8594L13.3867 20.1406C13.6094 20.3633 13.8789 20.4805 14.1836 20.4805Z"
                fill="#333"
              />
            </svg>
            <div className="askguru-tooltip">Collapse</div>
          </button>
        </div>
      </div>
      <div className="askguru-content">
        {messages.map((message, index) => {
          return (
            <Message
              isLoading={isLoading}
              isFirst={index === 0}
              selectedColor={selectedColor}
              isLast={messages.length - 1 === index}
              data={message}
            />
          );
        })}
        <div id="askguru-scroll-anchor"></div>
      </div>
      <div className="askguru-compose">
        <button className="askguru-resize" onClick={resizeContainer}>
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
        </button>
        <form
          style={{ display: 'flex', gap: '8px', width: '100%' }}
          onSubmit={handleUserMessage}
        >
          <input
            type="text"
            value={composeValue}
            onChange={(e) => setComposeValue(e.target.value)}
            disabled={isLoading}
            placeholder="What's your question?"
          ></input>
          <button
            type="submit"
            disabled={isLoading}
            className="askguru-submit-btn"
          >
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
      { widgetConfiguration.whitelabel === true && <PoweredByBlock openAskGuru={openAskGuru}/> }
    </div>
  );
}

export default App;
