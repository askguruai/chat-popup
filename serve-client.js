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

const getButtonInitFile = (token, color) => {
  return `(function () {
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
      wrapper.style.bottom = '16px';
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
        document.getElementById(config.button_id).style.opacity = '0';
        document.getElementById(config.button_id).style.display = 'none';
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
          'Authorization': 'Bearer ' + '${token}',
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
        existingWrapper.style.opacity = '1';
        existingWrapper.style.display = 'block'
        document.getElementById(config.button_id).style.opacity = '0';
        document.getElementById(config.button_id).style.display = 'none';
      }
    }
  
    const createStaticButton = () => {
      
      localStorage.setItem('askguru-token', '${token}')
      localStorage.setItem('askguru-color', '#${color}');
  
      const btn = document.createElement('button');
  
      btn.id = config.button_id;
  
      btn.innerHTML = '<svg stroke="#FFFFFF" fill="#FFFFFF" stroke-width="0" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M87.48 380c1.2-4.38-1.43-10.47-3.94-14.86a42.63 42.63 0 00-2.54-3.8 199.81 199.81 0 01-33-110C47.64 139.09 140.72 48 255.82 48 356.2 48 440 117.54 459.57 209.85a199 199 0 014.43 41.64c0 112.41-89.49 204.93-204.59 204.93-18.31 0-43-4.6-56.47-8.37s-26.92-8.77-30.39-10.11a31.14 31.14 0 00-11.13-2.07 30.7 30.7 0 00-12.08 2.43L81.5 462.78a15.92 15.92 0 01-4.66 1.22 9.61 9.61 0 01-9.58-9.74 15.85 15.85 0 01.6-3.29z"></path><circle cx="160" cy="256" r="32"></circle><circle cx="256" cy="256" r="32"></circle><circle cx="352" cy="256" r="32"></circle></svg>'

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
      btn.style.backgroundColor = '#${color}';
  
      btn.onclick = handleStaticButtonClick;
  
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

    const { token, color } = req.query;

    if (token === null || token === undefined) {
      throw new Error('No token received');
    }

    if (color === null || color === undefined) {
      color = '#FFFFFF';
    }

    const clientScript = getButtonInitFile(token, color);

    res.setHeader('Content-Type', 'application/javascript');
    res.send(clientScript);
  } catch (error) {
    res.json({ error });
  }
});

app.listen(port);
