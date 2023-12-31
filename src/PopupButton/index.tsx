import { Configuration } from "../_interfaces"
import AskguruApi from "../_lib/api"
import styles from "./styles.module.css"
import Chevron from "/src/_images/popup/chevron.svg?react"
import DefaultIcon from "/src/_images/popup/icon-default.svg?react"
import MessageCloseIcon from "/src/_images/popup/message-close.svg?react"
import { useEffect } from "react"

export default function PopupButton({
  configuration,
  askguruAPI,
  isCollapsed,
  setIsCollapsed,
  hasInteracted,
  setHasInteracted,
}: {
  configuration: Configuration
  askguruAPI: AskguruApi
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
  hasInteracted: boolean
  setHasInteracted: (value: boolean) => void
}) {
  useEffect(() => {
    askguruAPI.logEvent({ eventType: "POPUP_SEEN" })
  }, [])

  function handleClick(): void {
    setIsCollapsed(!isCollapsed)
    setHasInteracted(true)
    localStorage.setItem(`askguru-has-interacted-${configuration.token}`, "true")
    askguruAPI.logEvent({ eventType: "POPUP_CALLED" })
  }

  function handleMessageCloseClick(): void {
    setHasInteracted(true)
    localStorage.setItem(`askguru-has-interacted-${configuration.token}`, "true")
  }

  return (
    <>
      <button
        className={styles.button}
        style={{
          backgroundColor: "#" + configuration.color,
          bottom: configuration.bottomIndent,
          right: configuration.rightIndent,
          zIndex: configuration.zIndex,
          width: configuration.buttonSize,
          height: configuration.buttonSize,
          borderRadius: configuration.buttonSize,
          padding: configuration.buttonSize / 5,
        }}
        onClick={() => handleClick()}
      >
        <div className={styles.imageContainer}>
          {configuration.popupIcon ? (
            <img
              className={`${styles.fadingImage} ${!isCollapsed && styles.hiddenImage}`}
              alt=""
              src={configuration.popupIcon}
              width={configuration.buttonSize}
              height={configuration.buttonSize}
            />
          ) : (
            <DefaultIcon
              className={`${styles.fadingImage} ${!isCollapsed && styles.hiddenImage}`}
              width={configuration.buttonSize}
              height={configuration.buttonSize}
            />
          )}
          <Chevron
            className={`${styles.fadingImage} ${isCollapsed && styles.hiddenImage}`}
            width={configuration.buttonSize}
            height={configuration.buttonSize}
          />
        </div>
        {configuration.addUnreadDot && !hasInteracted && (
          <div
            className={styles.unreadDot}
            style={{
              width: configuration.buttonSize / 5.5,
              height: configuration.buttonSize / 5.5,
              borderRadius: configuration.buttonSize / 5.5,
              borderWidth: configuration.buttonSize / 22,
            }}
          />
        )}
      </button>
      {configuration.popupMessage && !hasInteracted && (
        <div
          className={styles.popupWidget}
          style={{
            bottom: configuration.bottomIndent + configuration.buttonSize / 3,
            right: configuration.rightIndent + configuration.buttonSize + configuration.buttonSize / 8,
            zIndex: configuration.zIndex,
          }}
        >
          <p
            style={{
              margin: 0,
            }}
            dangerouslySetInnerHTML={{ __html: configuration.popupMessage }}
          />
          <button className="askguru-small-btn" onClick={() => handleMessageCloseClick()}>
            <MessageCloseIcon width={16} height={16} />
          </button>
        </div>
      )}
    </>
  )
}
