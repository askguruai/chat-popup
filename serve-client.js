import express from 'express';
import cors from 'cors';
import path from 'path';

import { readdir } from 'fs/promises';
import { fileURLToPath } from 'url';

const app = express();
const port = 8088;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.options('*', cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'remote-app', 'build')));
app.use(express.static(__dirname));

const getBooleanFromString = (booleanString) => {
  if (booleanString === undefined) {
    return false;
  }
  if (booleanString === undefined) {
    return false;
  }
  if (booleanString.toLowerCase() === 'true') {
    return true;
  }
  return false;
};

const makeClientConfiguration = ({
  token, // [STRING]
  color, // [STRING] (HEX) without #
  hoverColor, // [STRING] (HEX) without #
  zIndex, // [INT] Optional zIndex change
  lang, // [STRING] ISO language code
  whitelabel, // [BOOL] Should display powered by
  popupIcon, // [STRING-URL]? Custom icon for popUp
  popupMessage, // [STRING]?
  windowHeading, // [STRING]? Displayed on top of chat
  welcomeMessage, // [STRING]?
  addUnreadDot, // [BOOL] Default: False. Should display round dot on top of popup on first enter
}) => {
  return {
    token,
    color,
    hoverColor,
    zIndex,
    lang,
    whitelabel,
    popupIcon,
    popupMessage,
    windowHeading,
    welcomeMessage,
    addUnreadDot,
  };
};

const getButtonInitFile = ({ configuration }) => {
  const stringConfiguration = JSON.stringify(configuration);
  const encodedStringConfiguration = btoa(unescape(encodeURIComponent(stringConfiguration)));

  return `(function () {

    const originalChevron = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.1836 20.4805C14.4766 20.4805 14.7695 20.3633 14.9688 20.1406L24.0391 10.8477C24.2383 10.6484 24.3555 10.3906 24.3555 10.0977C24.3555 9.48828 23.8984 9.01953 23.2891 9.01953C22.9961 9.01953 22.7266 9.13672 22.5273 9.32422L13.5508 18.5H14.8047L5.82812 9.32422C5.64062 9.13672 5.37109 9.01953 5.06641 9.01953C4.45703 9.01953 4 9.48828 4 10.0977C4 10.3906 4.11719 10.6484 4.31641 10.8594L13.3867 20.1406C13.6094 20.3633 13.8789 20.4805 14.1836 20.4805Z" fill="#fff"/></svg>'
    const originalChatIcon = '<svg stroke="#FFFFFF" fill="#FFFFFF" stroke-width="0" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M87.48 380c1.2-4.38-1.43-10.47-3.94-14.86a42.63 42.63 0 00-2.54-3.8 199.81 199.81 0 01-33-110C47.64 139.09 140.72 48 255.82 48 356.2 48 440 117.54 459.57 209.85a199 199 0 014.43 41.64c0 112.41-89.49 204.93-204.59 204.93-18.31 0-43-4.6-56.47-8.37s-26.92-8.77-30.39-10.11a31.14 31.14 0 00-11.13-2.07 30.7 30.7 0 00-12.08 2.43L81.5 462.78a15.92 15.92 0 01-4.66 1.22 9.61 9.61 0 01-9.58-9.74 15.85 15.85 0 01.6-3.29z"></path><circle cx="160" cy="256" r="32"></circle><circle cx="256" cy="256" r="32"></circle><circle cx="352" cy="256" r="32"></circle></svg>'
    let isCollapsed = true;

    const config = {
      button_id: 'ask-guru-static-btn',
      wrapper_id: 'ask-guru-wrapper',
    };
  
    const animationsClasses = {
      fadeIn: 'ask-guru-fade-in',
      fadeOut: 'ask-guru-fade-out',
    };
  
    function createReactWrapper() {
      const wrapper = document.createElement('div');
  
      wrapper.id = config.wrapper_id;
  
      wrapper.style.position = 'fixed';
      wrapper.style.bottom = '88px';
      wrapper.style.right = '16px';

      wrapper.style.boxShadow = 'rgba(0, 0, 0, 0.3) 0px 4px 12px';
  
      wrapper.style.maxHeight = '650px';
      wrapper.style.maxWidth = '450px';
  
      wrapper.style.height = '100%';
      wrapper.style.width = '100%';
      wrapper.style.opacity = '0';
      wrapper.style.transition = '0.25s ease-in-out';
  
      wrapper.style.borderRadius = '16px';
      wrapper.style.overflow = 'hidden';

      document.body.appendChild(wrapper);
    }
  
    async function loadReactStyles() {
      const scriptElement = document.createElement('script');

      scriptElement.src = 'https://data.askguru.ai/remote-script';
  
      scriptElement.addEventListener('load', () => {
        document.getElementById(config.wrapper_id).style.opacity = '1';
        document.getElementById(config.wrapper_id).style.display = 'block'
        document.getElementById(config.button_id).innerHTML = originalChevron
        isCollapsed = false
      });
      document.head.appendChild(scriptElement);
    }
    async function loadReactClient() {
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = 'https://data.askguru.ai/remote-style';
      document.head.appendChild(linkElement);
    }

    async function reportEvent(eventType){
      const requestData = { type: eventType, context: {} };
      const apiUrl = 'https://api.askguru.ai/v2/events'
      const requestOptions = {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + '${configuration.token}',
        },
        body: JSON.stringify(requestData),
      }; 
      fetch(apiUrl, requestOptions)      
    }
  
    function handleStaticButtonClick(event) {
      event.preventDefault();
  
      const existingWrapper = document.getElementById(config.wrapper_id)

      reportEvent("POPUP_CALLED")

      if(existingWrapper === null || existingWrapper === undefined){
        createReactWrapper();
        loadReactClient();
        loadReactStyles();  
      }else{
        if (isCollapsed) {
          existingWrapper.style.opacity = '1';
          existingWrapper.style.display = 'block'
          document.getElementById(config.button_id).innerHTML = originalChevron
          isCollapsed = false  
        } else {
          existingWrapper.style.opacity = '0'
          existingWrapper.style.display = 'none'

          if (${configuration.popupIcon !== null}){
            
            document.getElementById(config.button_id).innerHTML = ''
            document.getElementById(config.button_id).appendChild(makePopupIcon())
          } else {
            document.getElementById(config.button_id).innerHTML = originalChatIcon
          }
          isCollapsed = true  
        }
      }

      try{
        document.getElementById("askguru-unread-dot").style.opacity = 0;
      }catch(e){}
    }
  
    const makePopupIcon = () => {
      const popupImageIcon = document.createElement('img')
      popupImageIcon.src = '${configuration.popupIcon}'
      popupImageIcon.style.width = '40px'
      popupImageIcon.style.height = '40px'
      popupImageIcon.style.objectFit = 'contain'
      return popupImageIcon
    }

    const createStaticButton = () => {
      
      localStorage.setItem('askguru-token', '${configuration.token}')
      localStorage.setItem('askguru-color', '#${configuration.color}');
      localStorage.setItem('askguru-config', '${encodedStringConfiguration}')

      const btn = document.createElement('button');
  
      btn.id = config.button_id;
  
      btn.innerHTML = originalChatIcon

      if (${configuration.popupIcon !== null}){

        btn.innerHTML = ''
        btn.appendChild(makePopupIcon())
      } else {
        btn.innerHTML = originalChatIcon
      }


      btn.style.width = '64px';
      btn.style.height = '64px';
      btn.style.border = 'none';
      btn.style.borderRadius = '64px';

      btn.style.padding = '12px';
      btn.style.boxSizing = 'border-box'
  
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
  
      btn.style.position = 'fixed';
      btn.style.bottom = '16px';
      btn.style.right = '16px';
  
      btn.style.transition = '0.25s ease-in-out';
      btn.style.opacity = '1';
  
      btn.style.cursor = 'pointer';
      btn.style.backgroundColor = '${configuration.color}';
  
      btn.onclick = handleStaticButtonClick;
  
      if(${configuration.addUnreadDot}){
        const unreadDot = document.createElement('div');
        unreadDot.id = 'askguru-unread-dot'
        unreadDot.style.width = '8px'
        unreadDot.style.height = '8px'
        unreadDot.style.borderRadius = '8px'
        unreadDot.style.backgroundColor = 'orange'
        unreadDot.style.border = '2px solid white'

        unreadDot.style.position = 'fixed'
        unreadDot.style.right = '20px';
        unreadDot.style.bottom = '64px';
        unreadDot.style.zIndex = '50';  

        document.body.appendChild(unreadDot);
      }

      if(${configuration.popupMessage != null}){
        const popupWidget = document.createElement('div')
        popupWidget.id = 'askguru-popup-widget'
        popupWidget.style.display = 'flex'
        popupWidget.style.flexDirection = 'row'
        popupWidget.style.gap = '2px'
        popupWidget.style.padding = '6px 12px'

        popupWidget.style.borderRadius = '8px'
        popupWidget.innerHTML = "${
          configuration.popupMessage
        }" + '<svg id="askguru-popup-close" style="cursor: pointer;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">     <g >         <path id="x" d="M18.717 6.697l-1.414-1.414-5.303 5.303-5.303-5.303-1.414 1.414 5.303 5.303-5.303 5.303 1.414 1.414 5.303-5.303 5.303 5.303 1.414-1.414-5.303-5.303z"/>     </g> </svg>'
        popupWidget.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
        popupWidget.style.fontSize = '12px'
        popupWidget.style.position = 'fixed'
        popupWidget.style.right = '90px';
        popupWidget.style.bottom = '34px';
        popupWidget.style.zIndex = '50';  
        popupWidget.style.backgroundColor = 'white'

        document.body.appendChild(popupWidget);

        document.getElementById('askguru-popup-close').addEventListener('click', () => {
          document.getElementById('askguru-popup-widget').style.display = 'none'
        })
      }

      document.body.appendChild(btn);
      reportEvent("POPUP_SEEN")
    };
  
    createStaticButton();
    
  })();
  `;
};

app.get('/remote-script', async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'chat-application', 'build', 'static', 'js', 'bundle.js'));
  } catch (error) {
    res.json({ error });
  }
});

app.get('/remote-style', async (req, res) => {
  try {
    const files = await readdir(path.join(__dirname, 'chat-application', 'build', 'static', 'css'));
    const requestedFile = files.find((file) => /^main\..+\.css$/.test(file));

    if (requestedFile) {
      const filePath = path.join(__dirname, 'chat-application', 'build', 'static', 'css', requestedFile);
      res.sendFile(filePath);
    } else {
      console.log('not found');
      res.status(404).json({ error: 'Main CSS file not found' });
    }
  } catch (error) {
    console.log({ error });
    res.json({ error });
  }
});

app.get('/i', async (req, res) => {
  try {
    // color required to be HEX without #
    // token is token

    let { token, color, hoverColor, zIndex, lang, whitelabel, popupIcon, popupMessage, windowHeading, welcomeMessage, addUnreadDot } = req.query;

    if (token === null || token === undefined) {
      throw new Error('No token received');
    }

    if (color === null || color === undefined) {
      color = '#18b569';
    }

    if (hoverColor === null || hoverColor === undefined) {
      hoverColor = '#0d6e3f';
    }

    if (zIndex === null || zIndex === undefined) {
      zIndex = 10;
    }

    if (lang === null || lang === undefined) {
      lang = 'en-US';
    }

    let whitelabelBoolean = getBooleanFromString(whitelabel);
    let addUnreadDotBoolean = getBooleanFromString(addUnreadDot);

    // handle all optional and bool checks and casts here here

    if (welcomeMessage === null || welcomeMessage === undefined) {
      welcomeMessage = `Hi! I'm AskGuru AI Assistant. Nice to meet you! 👋 Search the docs or ask a question...`;
    }

    if (windowHeading === undefined) {
      windowHeading = null;
    }

    if (popupIcon === undefined || popupIcon === null) {
      popupIcon = null;
    }

    if (popupMessage === undefined || popupMessage === null) {
      popupMessage = null;
    }

    const clientConfiguration = makeClientConfiguration({
      token: token,
      color: color,
      hoverColor: hoverColor,
      zIndex: zIndex,
      lang: lang,
      whitelabel: whitelabelBoolean,
      popupIcon: popupIcon,
      popupMessage: popupMessage,
      windowHeading: windowHeading,
      welcomeMessage: welcomeMessage,
      addUnreadDot: addUnreadDotBoolean,
    });

    const clientScript = getButtonInitFile({ configuration: clientConfiguration });

    res.setHeader('Content-Type', 'application/javascript');
    res.send(clientScript);
  } catch (error) {
    res.json({ error });
  }
});

app.listen(port);
