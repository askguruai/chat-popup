import { Configuration } from "../_interfaces"
import AskguruApi from "../_lib/api"
import styles from "./styles.module.css"
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
    localStorage.setItem("askguru-has-interacted", "true")
    askguruAPI.logEvent({ eventType: "POPUP_CALLED" })
  }

  return (
    <button
      className={styles.button}
      style={{
        backgroundColor: "#" + configuration.color,
        bottom: configuration.bottomIndent,
        right: configuration.rightIndent,
      }}
      onClick={() => handleClick()}
    >
      <div className={styles.imageContainer}>
        <img
          className={`${styles.fadingImage} ${!isCollapsed && styles.hiddenImage}`}
          alt=""
          src={configuration.popupIcon}
          width={64}
          height={64}
        />
        <img
          className={`${styles.fadingImage} ${isCollapsed && styles.hiddenImage}`}
          alt=""
          src={"/images/popup/chevron.svg"}
          width={64}
          height={64}
        />
      </div>
      {configuration.addUnreadDot && !hasInteracted && <div className={styles.unreadDot} />}
      {configuration.popupMessage && !hasInteracted && (
        <p className={styles.popupWidget} dangerouslySetInnerHTML={{ __html: configuration.popupMessage }} />
      )}
    </button>
  )
}
