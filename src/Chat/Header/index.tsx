import { Configuration } from "../../_interfaces"
import localizations from "../../_lib/localization"
import styles from "./styles.module.css"

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
        {!configuration.whitelabel && (
          <img
            alt=""
            src="/images/chat/header/askguru-logo.svg"
            height={36}
            width={36}
            style={{ objectFit: "contain" }}
          />
        )}
        {configuration.windowHeading}
      </div>
      <div className={styles.buttons}>
        <button
          className={`small-btn`}
          onClick={() => onClearButtonClick()}
          aria-label={localizations[configuration.lang].clear}
        >
          <img alt="" src="/images/chat/header/refresh-icon.svg" height={18} width={18} />
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
