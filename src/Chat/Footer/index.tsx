import styles from "./styles.module.css"
import AskguruLogoFull from "/src/_images/chat/footer/askguru-logo-full.svg?react"

export default function Footer() {
  return (
    <div className={styles.footer}>
      <a className={styles.footerContent} href="https://askguru.ai" target="_blank" rel="noopener noreferrer">
        Powered by
        <AskguruLogoFull style={{ objectFit: "contain", marginLeft: "7px" }} height={24} width={100} />
      </a>
    </div>
  )
}
