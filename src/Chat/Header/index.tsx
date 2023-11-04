import { Configuration } from "../../_interfaces"
import localizations from "../../_lib/localization"
import styles from "./styles.module.css"
import AskguruLogo from "/src/_images/chat/header/askguru-logo.svg?react"
import RefreshIcon from "/src/_images/chat/header/refresh-icon.svg?react"

export default function Header({
  configuration,
  onClearButtonClick,
  isMobile,
  onCollapseButtonClick,
}: {
  configuration: Configuration
  onClearButtonClick: () => void
  isMobile: boolean
  onCollapseButtonClick: () => void
}) {
  return (
    <div className={styles.header}>
      <div className={styles.heading}>
        {!configuration.whitelabel && <AskguruLogo height={36} width={36} style={{ objectFit: "contain" }} />}
        {configuration.windowHeading}
      </div>
      <div className={styles.buttons}>
        <button
          className={`small-btn`}
          onClick={() => onClearButtonClick()}
          aria-label={localizations[configuration.lang].clear}
        >
          <RefreshIcon height={18} width={18} />
          {!isMobile && <div className="tooltip">{localizations[configuration.lang].clear}</div>}
        </button>
        {isMobile && (
          <button
            className={`small-btn`}
            onClick={() => onCollapseButtonClick()}
            aria-label={localizations[configuration.lang].collapse}
          >
            <img alt="" src="/images/chat/header/close-icon.svg" height={18} width={18} />
            {/* <div className="tooltip">{localizations[configuration.lang].collapse}</div> */}
          </button>
        )}
      </div>
    </div>
  )
}
