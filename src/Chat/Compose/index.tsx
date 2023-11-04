import { Configuration } from "../../_interfaces"
import localizations from "../../_lib/localization"
import styles from "./styles.module.css"
import RecizeIcon from "/src/_images/chat/message/compose-resize.svg?react"
import SendIcon from "/src/_images/chat/message/compose-send.svg?react"
import { FormEvent } from "react"

export default function Compose({
  configuration,
  composeValue,
  setComposeValue,
  isLoading,
  onResizeClick,
  onSubmitUserMessage,
  isMobile,
}: {
  configuration: Configuration
  composeValue: string
  setComposeValue: (value: string) => void
  isLoading: boolean
  onResizeClick: () => void
  onSubmitUserMessage: (event: FormEvent<HTMLFormElement>) => void
  isMobile: boolean
}) {
  return (
    <div className={styles.compose}>
      {!isMobile && (
        <button
          aria-label={localizations[configuration.lang].resize}
          className="small-btn"
          onClick={() => onResizeClick()}
        >
          <RecizeIcon width={24} height={24} />
          {!isMobile && (
            <div className="tooltip" style={{ bottom: 25 }}>
              {localizations[configuration.lang].resize}
            </div>
          )}
        </button>
      )}
      <form style={{ display: "flex", gap: "8px", width: "100%" }} onSubmit={(event) => onSubmitUserMessage(event)}>
        <input
          type="text"
          name="Query Field"
          autoComplete="off"
          value={composeValue}
          onChange={(e) => setComposeValue(e.target.value)}
          placeholder={localizations[configuration.lang].inputPlaceholder}
          className={styles.input}
        />
        <button
          aria-label={localizations[configuration.lang].send}
          type="submit"
          disabled={isLoading || !composeValue}
          className="small-btn"
        >
          <SendIcon width={28} height={28} />
          {!isMobile && (
            <div className="tooltip" style={{ bottom: 40 }}>
              {localizations[configuration.lang].send}
            </div>
          )}
        </button>
      </form>
    </div>
  )
}
