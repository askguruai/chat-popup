export default class ChatHelper {
  static fallbackConfiguration = {
    token: '',
    color: '#333',
    hoverColor: 'red',
    zIndex: 10,
    lang: 'en-US',
    whitelabel: true,
    popupIcon: null,
    popupMessage: null,
    windowHeading: 'Hi from sereja',
    welcomeMessage: "That's me",
    addUnreadDot: true,
  };

  static initialState = (configuration) => {
    localStorage.removeItem('askguru-history');
    return [
      {
        role: 'assistant',
        content:
          configuration.welcomeMessage === null
            ? "Hi! I'm AskGuru AI Assistant. Nice to meet you! 👋 Search the docs or ask a question..."
            : configuration.welcomeMessage,
      },
    ];
  };

  static saveState = (currentHistory) => {
    localStorage.setItem('askguru-history', JSON.stringify(currentHistory));
  };

  static getState = (configuration) => {
    const chatHistoryRaw = localStorage.getItem('askguru-history');
    if (chatHistoryRaw !== null && chatHistoryRaw !== undefined) {
      return JSON.parse(chatHistoryRaw);
    } else {
      let initialState = this.initialState(configuration);
      return initialState;
    }
  };
}
