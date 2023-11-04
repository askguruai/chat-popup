import { AskguruConfiguration, Configuration } from "./_interfaces"

export const defaultConfiguration: Configuration = {
  token: "",
  color: "15BE6C",
  popupIcon: "", // if empty, /images/popup/icon-default.svg will be used
  popupMessage: "Try <b>AI-powered</b> search!",
  addUnreadDot: true,
  whitelabel: false,
  lang: "en-US",
  windowHeading: "Chat with AI Assistant",
  welcomeMessage: "👋 Hi! Ask me anything...",
  bottomIndent: 24,
  rightIndent: 24,
}

export const defaultAskguruConfiguration: AskguruConfiguration = {
  token: "",
  apiUrl: "https://api.askguru.ai/",
  apiVersion: "v2",
  streamGetAnswer: true,
  sourcePattern: "{ *doc_idx *: *([^}]*)}",
}
