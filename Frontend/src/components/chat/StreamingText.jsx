import { useEffect, useRef, useState } from 'react';

export default function StreamingText({ streamContent }) {
  const textRef = useRef(null);
  const [renderedContent, setRenderedContent] = useState('');

  // When streamContent changes, append the new characters/tokens with a fade-in effect
  // For simplicity and to avoid complex DOM manipulation with markdown,
  // we just render the raw text as it comes in. A more complex implementation
  // would tokenize and animate spans.
  
  useEffect(() => {
    setRenderedContent(streamContent);
  }, [streamContent]);

  return <span ref={textRef}>{renderedContent}</span>;
}
