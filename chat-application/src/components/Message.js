import { marked } from 'marked';
import { useEffect, useRef, useState } from 'react';
import { setAnswerRating } from '../AskGuru';
import Like from './Icons/Like';
import Dislike from './Icons/Dislike';
export default function Message({ data }) {
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
    <div className={data.role === 'assistant' ? 'askguru-message-container' : 'askguru-message-container from-user'}>
      <div className="askguru-message">
        <div ref={markdownRef}></div>
        {data.role === 'assistant' && (
          <div className="askguru-message-rating">
            <button
              onClick={() => handleReaction('like')}
              className={currentReaction === 'like' ? 'askguru-message-rating-btn selected' : 'askguru-message-rating-btn'}
            >
              <Like />
              Like
            </button>
            <button
              onClick={() => handleReaction('dislike')}
              className={currentReaction === 'dislike' ? 'askguru-message-rating-btn selected' : 'askguru-message-rating-btn'}
            >
              <Dislike />
              Dislike
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
