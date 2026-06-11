import { useState, useRef, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';

export default function ChatInput({ onSend, disabled = false }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const handleInput = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !disabled) {
        onSend(input.trim());
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel"
      style={{
        padding: '12px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px',
        position: 'relative',
        transition: 'opacity var(--t-fast)',
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about this book..."
        disabled={disabled}
        rows={1}
        className="font-sans text-sm w-full"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text-1)',
          resize: 'none',
          outline: 'none',
          padding: '8px 4px',
          maxHeight: '150px',
        }}
      />
      <button
        type="submit"
        disabled={!input.trim() || disabled}
        className="cursor-pointer flex items-center justify-center shrink-0 transition-all"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: input.trim() && !disabled ? 'var(--color-amber)' : 'var(--color-elevated)',
          color: input.trim() && !disabled ? 'var(--color-void)' : 'var(--color-text-3)',
          border: 'none',
        }}
        onMouseEnter={(e) => {
          if (input.trim() && !disabled) {
            e.currentTarget.style.background = 'var(--color-amber-bright)';
            e.currentTarget.style.boxShadow = '0 0 20px var(--color-amber-glow)';
          }
        }}
        onMouseLeave={(e) => {
          if (input.trim() && !disabled) {
            e.currentTarget.style.background = 'var(--color-amber)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
        aria-label="Send message"
      >
        <SendHorizontal size={18} />
      </button>
    </form>
  );
}
