import { ReactionType } from "../../../_interfaces"
import styles from "./styles.module.css"
import LikeIcon from "/src/_images/chat/message/feedback-like.svg?react"
import DislikeIcon from "/src/_images/chat/message/feedback-like.svg?react"
import { useState } from "react"

export default function ReactionButton({
  reaction,
  hoverColor,
  onButtonClick,
}: {
  reaction: ReactionType
  hoverColor: string
  onButtonClick: (reaction: ReactionType) => void
}) {
  const [hoverReactionButton, setHoverReactionButton] = useState(false)
  return (
    <button
      className={styles.messageRatingButton}
      style={{
        backgroundColor: hoverReactionButton ? hoverColor : "",
      }}
      onMouseEnter={() => setHoverReactionButton(true)}
      onMouseLeave={() => setHoverReactionButton(false)}
      onClick={() => onButtonClick(reaction)}
    >
      {reaction === "LIKE" ? (
        <>
          <LikeIcon height={18} width={18} />
          Like
        </>
      ) : (
        <>
          <DislikeIcon height={18} width={18} />
          Dislike
        </>
      )}
    </button>
  )
}
