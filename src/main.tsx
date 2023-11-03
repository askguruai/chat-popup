import App from "./App.tsx"
import "./index.css"
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

ReactDOM.createRoot(document.getElementById("askguru-chat-popup-container")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
