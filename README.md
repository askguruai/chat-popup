# Chat Popup AskGuru Client

A popup that is intended to be embedded within a website to provide answers to questions with links to the sources based on provided documents. To see it in action, visit [askguru.ai](https://askguru.ai).

## Usage

To start using chat on the website, insert `<script>` with params in `<body>` at the root of the website. You can pass configuration parameters with query URL. List of available parameters and their default values available in `defaultConfiguration` variable in [configuration.ts](./src/configuration.ts). The only mandatory parameter is `token`.

Example insertion of the widget (the same script is used on [askguru.ai](https://askguru.ai) website):

```html
<script src="https://chat-popup.askguru.ai/serve.js?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZW5kb3IiOiJhc2tndXJ1cHVibGljIiwib3JnYW5pemF0aW9uIjoiYXNrZ3VydSIsInNlY3VyaXR5X2dyb3VwcyI6W119.bR2GxUtV3zeER-s95AsV3UBrssa_ufP7Q1EalkBO5Kw&whitelabel=False&windowHeading=Chat+with+us%21&popupMessage=Check+out+%3Cb%3EAI+chatbot%21%3C%2Fb%3E&welcomeMessage=%F0%9F%91%8B+Hi%21+I+am+AskGuru+AI+Assistant.+Ask+me+anything+about+current+website...&addUnreadDot=True&bottomIndent=24&rightIndent=24&zIndex=99999&buttonSize=64"></script>
```

## Development

```bash
npm run dev
```

## Deployment

Bundle project into single `.js` and `.css` using vite:

```bash
npm run build
```

It will result in `./dist/` folder which can be served via any webserver (we are using nginx).
