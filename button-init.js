(function () {
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
    scriptElement.src = 'https://data.askguru.ai/remote-script';

    scriptElement.addEventListener('load', () => {
      document.getElementById(config.wrapper_id).style.opacity = '1';
      document.getElementById(config.button_id).style.opacity = '0';
    });
    document.head.appendChild(scriptElement);
  }
  async function loadReactClient() {
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://data.askguru.ai/remote-style';

    document.head.appendChild(linkElement);
  }

  function handleStaticButtonClick(event) {
    event.preventDefault();

    createReactWrapper();
    loadReactClient();
    loadReactStyles();
  }

  const createStaticButton = () => {
    const btn = document.createElement('button');

    btn.id = config.button_id;

    btn.innerHTML = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_2201_1286)">
    <path d="M5.64062 26.4336C7.04688 26.4336 10.5508 24.8984 12.543 23.4688C12.7422 23.3281 12.9062 23.2695 13.0703 23.2695C13.2227 23.2812 13.375 23.293 13.5273 23.293C21.9766 23.293 27.5781 18.4883 27.5781 12.6523C27.5781 6.75781 21.6719 2 14.2891 2C6.90625 2 1 6.75781 1 12.6523C1 16.4023 3.30859 19.6953 7.07031 21.7109C7.24609 21.8047 7.30469 21.9805 7.21094 22.1562C6.55469 23.2344 5.38281 24.5234 4.9375 25.1094C4.48047 25.6953 4.73828 26.4336 5.64062 26.4336Z" fill="url(#paint0_linear_2201_1286)"/>
    </g>
    <defs>
    <linearGradient id="paint0_linear_2201_1286" x1="14.2891" y1="2" x2="14.2891" y2="26.4336" gradientUnits="userSpaceOnUse">
    <stop stop-color="#19EA85"/>
    <stop offset="1" stop-color="#15BE6C"/>
    </linearGradient>
    <clipPath id="clip0_2201_1286">
    <rect width="26.5781" height="24.4336" fill="white" transform="translate(1 2)"/>
    </clipPath>
    </defs>
    </svg>
    `;

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
