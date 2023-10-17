import { marked } from 'marked';
import { useEffect, useRef, useState } from 'react';
import { setAnswerRating } from '../AskGuru';
import CirclePositive from './Icons/CirclePositive';
import TripleDots from './TripleDots';
import ReactionButton, { ReactionType } from './ReactionButton';

export default function Message({
  data,
  isLast,
  selectedColor,
  isLoading,
  isFirst,
}) {
  const markdownRef = useRef(null);

  const [currentReaction, setReaction] = useState(null);

  useEffect(() => {
    const tokenizer = new marked.Tokenizer();
    const renderer = new marked.Renderer();
    tokenizer.lheading = function () {
      return false;
    };
    renderer.link = function (href, title, text) {
      return `<a target="_blank" href="${href}">${text}</a>`;
    };
    marked.setOptions({
      tokenizer: tokenizer,
      renderer: renderer,
      headerIds: false,
      mangle: false,
    });
  }, []);

  const compileMarkdown = (messageMarkdown) => {
    return marked(messageMarkdown);
  };

  useEffect(() => {
    markdownRef.current.innerHTML = compileMarkdown(data.content);
  }, [data.content]);

  const handleReaction = (reaction) => {
    const { id } = data;
    setReaction(reaction);
    setAnswerRating({
      request_id: id,
      like_status: reaction === 'like' ? 'good_answer' : 'wrong_answer',
    });
  };

  return (
    <div
      className={
        data.role === 'assistant'
          ? 'askguru-message-container'
          : 'askguru-message-container from-user'
      }
    >
      <div
        className="askguru-message"
        style={
          data.role !== 'assistant' ? { backgroundColor: selectedColor, cursor: 'default' } : {}
        }
      >
        <div ref={markdownRef}></div>
        {data.role === 'assistant' && isLoading && isLast && <TripleDots />}
        {data.role === 'assistant' && isLast && !isLoading && !isFirst && (
          <>
            {currentReaction === null ? (
              <div className="askguru-message-rating">
                <ReactionButton
                  type={ReactionType.LIKE}
                  hoverColor={selectedColor}
                  onButtonClick={handleReaction}
                />
                <ReactionButton
                  type={ReactionType.DISLIKE}
                  hoverColor={selectedColor}
                  onButtonClick={handleReaction}
                />
              </div>
            ) : (
              <div className="askguru-feedback-thanks">
                <CirclePositive />
                Thanks for submitting your feedback!
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
