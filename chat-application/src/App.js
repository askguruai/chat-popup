import './App.css';
import { useState, useRef, useEffect } from 'react';
import Message from './components/Message';
import { getAnswer, reportAnalyticsEvent } from './AskGuru.js';
function App() {
  useEffect(() => {
    applyChatHistory();
  }, []);

  const chatInitialState = [
    {
      role: 'assistant',
      content: "Hi! I'm AskGuru AI Assistant. Nice to meet you! 👋 Search the docs or ask a question...",
    },
  ];

  const [isLoading, setLoading] = useState(false);
  const [messages, setMessages] = useState(chatInitialState);
  const [composeValue, setComposeValue] = useState('');
  const messagesRef = useRef(chatInitialState);

  const regexPattern = new RegExp('{ *doc_idx *: *([^}]*)}');

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
      console.log({ value: wrapper.style.maxWidth });
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

    const newMessage = createNewMessage('user', composeValue);

    const newMessages = [...messages, newMessage];

    const requestData = {
      chat: JSON.stringify(newMessages),
    };

    setComposeValue('');
    setMessages(newMessages);
    messagesRef.current = newMessages;
    setLoading(true);
    const answerStream = getAnswer(requestData);

    let initialAnswer = '';
    let generated_sources = [];
    let message_id = null;

    answerStream.addEventListener('open', (event) => {
      try {
        const newAssistantMessage = createNewMessage('assistant', initialAnswer);
        const updatedMessagesV = [...messagesRef.current, newAssistantMessage];
        setMessages(updatedMessagesV);
        messagesRef.current = updatedMessagesV;
        console.log({ updatedMessagesV });
      } catch (e) {
        console.log({ open: e });
      }
    });
    answerStream.addEventListener('message', (event) => {
      console.log('MESSAGE');
      try {
        const messageData = JSON.parse(event.data);
        if (messageData.answer) {
          const { request_id, sources, answer } = messageData;
          console.log({ sources });
          if (sources.length === 0) {
            reportAnalyticsEvent('POPUP_ERROR');
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
              generated_sources.findIndex((existingSource) => existingSource.id === source.id && existingSource.collection === source.collection) + 1;
            if (idx === 0) {
              generated_sources.push(source);
              idx = generated_sources.length;
            }

            initialAnswer = initialAnswer.replace(regexPattern, `[[${idx}]](${link})`);
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
      console.log('EVENT CLOSED');
      setLoading(false);
      answerStream.close();
      saveChatHistory();
    });
  };

  return (
    <div className="askguru-container">
      <div className="askguru-header">
        <div className="askguru-ai-heading">
          <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M307.111 372.809V334.812C307.111 310.038 286.756 290.831 260.16 290.831H47.0992C20.5038 290.831 0 271.623 0 246.849V139.26C0 114.207 20.5038 95 47.0992 95H260.16C286.756 95 307.111 114.207 307.111 139.26V246.71C307.111 271.484 327.615 290.691 354.21 290.691H464.901C491.496 290.691 512 309.899 512 334.673V372.67C512 397.723 491.496 416.93 464.901 416.93H354.21C327.615 416.93 307.111 397.723 307.111 372.67V372.809Z"
              fill="url(#paint0_linear_616_1922)"
            />
            <defs>
              <linearGradient id="paint0_linear_616_1922" x1="256" y1="95" x2="254.979" y2="771.681" gradientUnits="userSpaceOnUse">
                <stop stop-color="#19EA85" />
                <stop offset="1" />
              </linearGradient>
            </defs>
          </svg>
          Chat with AI Assistant
        </div>
        <div className="askguru-header-buttons">
          <button className="askguru-small-btn askguru-ai-clear" onClick={clearConversation}>
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
              <path
                d="M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z"
                fill="#FFF"
              />
            </svg>
            <div className="askguru-tooltip">Clear</div>
          </button>
          <button className="askguru-small-btn askguru-ai-close" onClick={handleClose}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M14.1836 20.4805C14.4766 20.4805 14.7695 20.3633 14.9688 20.1406L24.0391 10.8477C24.2383 10.6484 24.3555 10.3906 24.3555 10.0977C24.3555 9.48828 23.8984 9.01953 23.2891 9.01953C22.9961 9.01953 22.7266 9.13672 22.5273 9.32422L13.5508 18.5H14.8047L5.82812 9.32422C5.64062 9.13672 5.37109 9.01953 5.06641 9.01953C4.45703 9.01953 4 9.48828 4 10.0977C4 10.3906 4.11719 10.6484 4.31641 10.8594L13.3867 20.1406C13.6094 20.3633 13.8789 20.4805 14.1836 20.4805Z"
                fill="white"
              />
            </svg>

            <div className="askguru-tooltip">Collapse</div>
          </button>
        </div>
      </div>
      <div className="askguru-content">
        {messages.map((message, index) => {
          return <Message data={message} />;
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
        <form style={{ display: 'flex', gap: '8px', width: '100%' }} onSubmit={handleUserMessage}>
          <input
            type="text"
            value={composeValue}
            onChange={(e) => setComposeValue(e.target.value)}
            disabled={isLoading}
            placeholder="What's your question?"
          ></input>
          <button type="submit" disabled={isLoading} className="askguru-submit-btn">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_2124_88365)">
                <path
                  d="M16.6719 26.9102C17.5156 26.9102 18.1133 26.1836 18.5469 25.0586L26.2227 5.00781C26.4336 4.46875 26.5508 3.98827 26.5508 3.58983C26.5508 2.82811 26.082 2.35938 25.3203 2.35938C24.9219 2.35938 24.4414 2.47655 23.9023 2.68749L3.74609 10.4102C2.76172 10.7852 2 11.3828 2 12.2383C2 13.3164 2.82031 13.6797 3.94531 14.0195L12.4062 16.5039L14.8672 24.8594C15.2188 26.043 15.582 26.9102 16.6719 26.9102ZM12.9336 14.7227L4.84766 12.25C4.66016 12.1914 4.60156 12.1445 4.60156 12.0625C4.60156 11.9805 4.64844 11.9219 4.82422 11.8516L20.668 5.85156C21.6055 5.5 22.5078 5.03125 23.375 4.63281C22.6016 5.26561 21.6406 6.01562 20.9961 6.66016L12.9336 14.7227ZM16.8594 24.332C16.7656 24.332 16.7188 24.25 16.6602 24.0625L14.1875 15.9766L22.25 7.91405C22.8828 7.28124 23.668 6.29688 24.2891 5.49999C23.8906 6.39061 23.4102 7.29296 23.0586 8.24218L17.0586 24.0859C16.9883 24.2617 16.9414 24.332 16.8594 24.332Z"
                  fill="#838383"
                  fill-opacity="0.85"
                />
              </g>
              <defs>
                <clipPath id="clip0_2124_88365">
                  <rect width="24.5508" height="25.9102" fill="white" transform="translate(2 1)" />
                </clipPath>
              </defs>
            </svg>
          </button>
        </form>
      </div>
      <div className="ask-guru-footer">
        <div className="ask-guru-footer-content" onClick={openAskGuru}>
          Powered by{' '}
          <svg width="182" height="24" viewBox="0 0 182 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M46.8633 23.7978H42.8594L51.6748 0.202246H56.2844L65.0662 23.7978H60.9277L58.707 17.9663H49.0504L46.8633 23.7978ZM53.8619 4.38202L50.1271 14.6629H57.6303L53.8619 4.38202Z"
              fill="#333"
            />
            <path
              d="M65.8782 18.1011H69.4448C69.5794 19.8876 71.1271 21.1685 73.7516 21.1685C76.0059 21.1685 77.4863 20.2921 77.4863 18.9101C77.4863 17.0562 75.9049 16.9213 73.2469 16.5843C69.3102 16.1124 66.2147 15.2697 66.2147 11.6966C66.2147 8.42697 69.142 6.30337 73.2805 6.33708C77.52 6.33708 80.5146 8.29213 80.7501 11.8315H77.1835C76.9816 10.2472 75.5012 9.13483 73.3478 9.13483C71.1944 9.13483 69.7812 10.0112 69.7812 11.3933C69.7812 13.0112 71.4299 13.2135 73.9198 13.4831C77.8565 13.9551 81.0529 14.764 81.0529 18.6067C81.0529 21.9101 77.9238 24 73.7516 24C69.142 24 65.9792 21.8427 65.8782 18.1011Z"
              fill="#333"
            />
            <path
              d="M83.869 23.7978V0.202246H87.5028V14.8989L95.3089 6.53933H99.582L93.0882 13.5169L99.9858 23.7978H95.679L90.5983 16.1798L87.5028 19.4157V23.7978H83.869Z"
              fill="#333"
            />
            <path
              d="M112.343 24C105.748 24 101.205 19.1798 101.205 12C101.205 4.82023 105.647 0 112.645 0C118.096 0 122.066 3.23596 122.773 8.22472H118.769C118.062 5.22472 115.808 3.40449 112.544 3.40449C108.069 3.40449 105.176 6.94382 105.176 12C105.176 17.0562 108.002 20.5955 112.511 20.5955C116.145 20.5955 119.072 18.5393 119.274 14.7303V14.1573H112.746V10.8876H122.975V23.7978H119.98L119.644 20.6292C118.5 22.3146 116.077 24 112.343 24Z"
              fill="#333"
            />
            <path
              d="M138.723 15.1685V6.53933H142.357V23.7978H139.161L138.757 21.6067C137.68 22.9213 136.099 24 133.441 24C129.773 24 126.644 22.0449 126.644 16.1461V6.53933H130.278V15.7416C130.278 19.1124 131.624 20.8315 134.282 20.8315C137.041 20.8315 138.723 18.7416 138.723 15.1685Z"
              fill="#333"
            />
            <path
              d="M154.653 6.53933H155.46V9.94382H153.845C150.615 9.94382 149.572 12.4719 149.572 15.1348V23.7978H145.938V6.53933H149.168L149.572 9.13483C150.447 7.68539 151.826 6.53933 154.653 6.53933Z"
              fill="#333"
            />
            <path
              d="M169.511 15.1685V6.53933H173.145V23.7978H169.949L169.545 21.6067C168.468 22.9213 166.887 24 164.229 24C160.561 24 157.432 22.0449 157.432 16.1461V6.53933H161.066V15.7416C161.066 19.1124 162.412 20.8315 165.07 20.8315C167.829 20.8315 169.511 18.7416 169.511 15.1685Z"
              fill="#333"
            />
            <path
              d="M175.715 3.02857C175.715 1.31429 177.026 0 178.701 0C180.389 0 181.715 1.31429 181.715 3.01429C181.715 4.71429 180.389 6 178.701 6C177.026 6 175.715 4.71429 175.715 3.02857ZM181.003 3.01429C181.003 1.65714 180.026 0.642857 178.701 0.642857C177.389 0.642857 176.413 1.65714 176.413 3.02857C176.413 4.37143 177.389 5.37143 178.701 5.37143C180.026 5.37143 181.003 4.35714 181.003 3.01429ZM177.571 4.64286V1.38571H178.826C179.58 1.38571 180.068 1.8 180.068 2.44286C180.068 2.88571 179.817 3.22857 179.399 3.38571L180.096 4.64286H179.329L178.715 3.52857H178.268V4.64286H177.571ZM178.785 1.97143H178.268V2.94286H178.785C179.119 2.94286 179.343 2.75714 179.343 2.44286C179.343 2.12857 179.119 1.97143 178.785 1.97143Z"
              fill="#333"
            />
            <path
              d="M21.0796 20.7108V17.8781C21.0796 16.0311 19.6824 14.5992 17.857 14.5992H3.23282C1.40735 14.5992 0 13.1673 0 11.3204V3.29961C0 1.43191 1.40735 0 3.23282 0H17.857C19.6824 0 21.0796 1.43191 21.0796 3.29961V11.31C21.0796 13.1569 22.4869 14.5888 24.3124 14.5888H31.91C33.7355 14.5888 35.1429 16.0208 35.1429 17.8677V20.7004C35.1429 22.5681 33.7355 24 31.91 24H24.3124C22.4869 24 21.0796 22.5681 21.0796 20.7004V20.7108Z"
              fill="url(#paint0_linear_629_566)"
            />
            <defs>
              <linearGradient id="paint0_linear_629_566" x1="17.5714" y1="1.80348e-09" x2="17.4888" y2="50.4467" gradientUnits="userSpaceOnUse">
                <stop stop-color="#19EA85" />
                <stop offset="1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default App;
