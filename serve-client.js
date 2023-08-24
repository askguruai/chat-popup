import express from 'express';
import cors from 'cors';
import path from 'path';
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
      scriptElement.src = 'http://localhost:8088/remote-script';
  
      scriptElement.addEventListener('load', () => {
        document.getElementById(config.wrapper_id).style.opacity = '1';
        document.getElementById(config.button_id).style.opacity = '0';
      });
      document.head.appendChild(scriptElement);
    }
    async function loadReactClient() {
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = 'http://localhost:8088/remote-style';
  
      document.head.appendChild(linkElement);
    }
  
    function handleStaticButtonClick(event) {
      event.preventDefault();
  
      createReactWrapper();
      loadReactClient();
      loadReactStyles();
    }
  
    const createStaticButton = () => {
  
      localStorage.setItem('askguru-token', '${token}')
  
      const btn = document.createElement('button');
  
      btn.id = config.button_id;
  
      btn.innerHTML = '<svg width="27" height="25" viewBox="0 0 27 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2201_136)"><path d="M4.64062 24.4336C6.04688 24.4336 9.55078 22.8984 11.543 21.4688C11.7422 21.3281 11.9062 21.2695 12.0703 21.2695C12.2227 21.2812 12.375 21.293 12.5273 21.293C20.9766 21.293 26.5781 16.4883 26.5781 10.6523C26.5781 4.75781 20.6719 0 13.2891 0C5.90625 0 0 4.75781 0 10.6523C0 14.4023 2.30859 17.6953 6.07031 19.7109C6.24609 19.8047 6.30469 19.9805 6.21094 20.1562C5.55469 21.2344 4.38281 22.5234 3.9375 23.1094C3.48047 23.6953 3.73828 24.4336 4.64062 24.4336Z" fill="#${color}"/></g><defs><clipPath id="clip0_2201_136"><rect width="26.5781" height="24.4336" fill="white"/></clipPath></defs></svg>';
  
      btn.style.width = '44px';
      btn.style.height = '44px';
      btn.style.border = 'none';
      btn.style.borderRadius = '44px';
  
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
  
      btn.style.position = 'fixed';
      btn.style.bottom = '16px';
      btn.style.right = '16px';
  
      btn.style.transition = '0.25s ease-in-out';
      btn.style.opacity = '1';
  
      btn.style.backgroundColor = '#010F08';
  
      btn.onclick = handleStaticButtonClick;
  
      document.body.appendChild(btn);
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
    res.sendFile(path.join(__dirname, 'chat-application', 'build', 'static', 'css', 'main.12e3ecf4.css'));
  } catch (error) {
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
