import { marked } from 'marked';
import { useEffect, useRef } from 'react';
export default function Message({ data }) {
  const markdownRef = useRef(null);

  useEffect(() => {
    const tokenizer = new marked.Tokenizer();
    const renderer = new marked.Renderer();
    tokenizer.lheading = function () {
      return false;
    };
    renderer.link = function (href, title, text) {
      return `<a target="_blank" href="${href}">${text}` + '</a>';
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

  return (
    <div className={data.role === 'assistant' ? 'askguru-message-container' : 'askguru-message-container from-user'}>
      <div className="askguru-message" ref={markdownRef}>
        <div>{compileMarkdown(data.content)}</div>
        <div className="askguru-message-rating"></div>
      </div>
    </div>
  );
}
