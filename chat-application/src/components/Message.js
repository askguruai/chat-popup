import { marked } from 'marked';
import { useEffect, useRef } from 'react';
export default function Message({ data }) {
  const markdownRef = useRef(null);

  const compileMarkdown = (messageMarkdown) => {
    return marked(messageMarkdown);
  };

  useEffect(() => {
    markdownRef.current.innerHTML = compileMarkdown(data.content);
  }, [data.content]);

  return (
    <div className={data.role === 'assistant' ? 'askguru-message-container' : 'askguru-message-container from-user'}>
      <div className="askguru-message" ref={markdownRef}>
        <div>{compileMarkdown(data.content)}</div>
        <div className="askguru-message-rating"></div>
      </div>
    </div>
  );
}
