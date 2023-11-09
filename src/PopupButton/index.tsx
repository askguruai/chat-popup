import { Configuration } from "../_interfaces"
import AskguruApi from "../_lib/api"
import styles from "./styles.module.css"
import Chevron from "/src/_images/popup/chevron.svg?react"
import DefaultIcon from "/src/_images/popup/icon-default.svg?react"
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

  return (
    <button
      className={styles.button}
      style={{
        backgroundColor: "#" + configuration.color,
        bottom: configuration.bottomIndent,
        right: configuration.rightIndent,
        zIndex: configuration.zIndex,
      }}
      onClick={() => handleClick()}
    >
      <div className={styles.imageContainer}>
        {configuration.popupIcon ? (
          <img
            className={`${styles.fadingImage} ${!isCollapsed && styles.hiddenImage}`}
            alt=""
            src={configuration.popupIcon}
            width={64}
            height={64}
          />
        ) : (
          <DefaultIcon
            className={`${styles.fadingImage} ${!isCollapsed && styles.hiddenImage}`}
            width={64}
            height={64}
          />
        )}
        <Chevron className={`${styles.fadingImage} ${isCollapsed && styles.hiddenImage}`} width={64} height={64} />
      </div>
      {configuration.addUnreadDot && !hasInteracted && <div className={styles.unreadDot} />}
      {configuration.popupMessage && !hasInteracted && (
        <p className={styles.popupWidget} dangerouslySetInnerHTML={{ __html: configuration.popupMessage }} />
      )}
    </button>
  )
}
