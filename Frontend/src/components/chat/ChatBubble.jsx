import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import StreamingText from './StreamingText';

export default function ChatBubble({ message, isStreaming = false }) {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '24px',
        width: '100%',
      }}
    >
      <div
        style={{
          position: 'relative',
          padding: '16px 20px',
          borderRadius: '16px',
          borderBottomRightRadius: isUser ? '4px' : '16px',
          borderBottomLeftRadius: isUser ? '16px' : '4px',
          background: isUser ? 'var(--color-chat-user)' : 'var(--color-chat-ai)',
          border: isUser ? '1px solid var(--border-subtle)' : '1px solid var(--color-chat-border)',
          borderLeft: !isUser ? '3px solid var(--color-amber)' : undefined,
          maxWidth: '80%',
          boxShadow: isUser ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
          overflow: 'hidden',
        }}
      >
        {/* Grain overlay for AI bubble */}
        {!isUser && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
              backgroundSize: '160px 160px',
              opacity: 0.05,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        <div
          className="font-sans text-sm chat-markdown prose prose-invert"
          style={{
            position: 'relative',
            zIndex: 1,
            color: 'var(--color-text-1)',
            lineHeight: 1.6,
          }}
        >
          {isUser ? (
            <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
          ) : isStreaming ? (
            <div className="flex gap-2">
              <StreamingText streamContent={message.content} />
              {!message.content && (
                <div className="dot-pulse" style={{ display: 'flex', alignItems: 'center', height: '22px' }}>
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          )}
        </div>
      </div>
      <span
        className="font-sans text-xs mt-2"
        style={{ color: 'var(--color-text-3)', padding: '0 4px' }}
      >
        {isUser ? 'You' : 'Pustakalaya AI'}
        {message.created_at && ` · ${new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
      </span>

      <style>{`
        .chat-markdown p { margin-bottom: 0.8em; }
        .chat-markdown p:last-child { margin-bottom: 0; }
        .chat-markdown code {
          background: var(--color-elevated);
          padding: 2px 4px;
          border-radius: 4px;
          font-family: var(--font-mono);
          color: var(--color-amber-bright);
        }
        .chat-markdown pre {
          background: var(--color-elevated);
          padding: 16px;
          border-radius: 12px;
          overflow-x: auto;
          margin: 1em 0;
          border: 1px solid var(--border-subtle);
        }
        .chat-markdown pre code {
          background: transparent;
          padding: 0;
          color: var(--color-text-1);
        }
        .chat-markdown a {
          color: var(--color-amber);
          text-decoration: underline;
        }
        .chat-markdown ul, .chat-markdown ol {
          padding-left: 1.5em;
          margin-bottom: 0.8em;
        }
      `}</style>
    </div>
  );
}
