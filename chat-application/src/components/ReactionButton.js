import { useState } from 'react';
import Like from './Icons/Like';
import Dislike from './Icons/Dislike';

export const ReactionType = {
  LIKE: 'like',
  DISLIKE: 'dislike',
};

export default function ReactionButton({ type, hoverColor, onButtonClick }) {
  const [hoverReactionButton, setHoverReactionButton] = useState(false);
  return (
    <button
      className="askguru-message-rating-btn"
      style={{
        backgroundColor: hoverReactionButton ? hoverColor : '',
      }}
      onMouseEnter={() => setHoverReactionButton(true)}
      onMouseLeave={() => setHoverReactionButton(false)}
      onClick={() => onButtonClick(type)}
    >
      {type === ReactionType.LIKE ? <Like /> : <Dislike />}
      {type === ReactionType.LIKE ? 'Like' : 'Dislike'}
    </button>
  );
}
