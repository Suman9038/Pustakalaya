import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen } from 'lucide-react';

function CitationBadge({ page, rawText, onClick }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.(page);
      }}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 mx-1 rounded-md text-xs font-mono font-medium transition-all group cursor-pointer align-baseline hover:scale-105 active:scale-95"
      style={{
        background: 'rgba(245, 158, 11, 0.12)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        color: 'var(--color-amber-bright)',
        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)',
      }}
      title={`Click to open book and jump to Page ${page}`}
    >
      <BookOpen size={11} className="text-[color:var(--color-amber)] group-hover:rotate-6 transition-transform" />
      <span>{rawText || `Page ${page}`}</span>
    </button>
  );
}

export default function ChatBubble({ message, isStreaming = false, streamPhase = 'idle', onCitationClick }) {
  const isUser = message.role === 'user';

  // Process citations like [Page 15] or [Source: Page 42] into clickable markdown links
  const formattedContent = !isUser && message.content
    ? message.content.replace(/\[(?:Source:\s*)?Page\s*(\d+)(?:[^\]]*)\]/gi, (match, pageNum) => {
        return `[${match}](#cite-page-${pageNum})`;
      })
    : message.content;

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
          maxWidth: '85%',
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
          className="font-sans text-sm chat-markdown"
          style={{
            position: 'relative',
            zIndex: 1,
            color: 'var(--color-text-1)',
            lineHeight: 1.6,
          }}
        >
          {isUser ? (
            <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
          ) : (
            <div>
              {/* Show clean 3-dot thinking indicator if content is empty during stream */}
              {isStreaming && !message.content && (
                <div className="flex items-center py-2 px-1">
                  <div className="thinking-indicator" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <span className="thinking-dot" />
                    <span className="thinking-dot" />
                    <span className="thinking-dot" />
                  </div>
                </div>
              )}

              {/* Real-time formatted ReactMarkdown for both streaming & complete messages */}
              {message.content && (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ node, href, children, ...props }) => {
                      if (href && href.startsWith('#cite-page-')) {
                        const pageNum = parseInt(href.replace('#cite-page-', ''), 10);
                        return <CitationBadge page={pageNum} rawText={children} onClick={onCitationClick} />;
                      }
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-[color:var(--color-amber)] hover:text-[color:var(--color-amber-bright)] transition-colors"
                          {...props}
                        >
                          {children}
                        </a>
                      );
                    },
                    h1: ({ node, ...props }) => <h1 className="text-lg font-display font-bold text-[color:var(--color-amber)] mt-3 mb-2" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-base font-display font-semibold text-[color:var(--color-amber)] mt-3 mb-1.5" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-sm font-display font-semibold text-[color:var(--color-amber-bright)] mt-2 mb-1" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-2.5 leading-relaxed text-[color:var(--color-text-1)] last:mb-0" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2.5 space-y-1 text-[color:var(--color-text-1)]" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2.5 space-y-1 text-[color:var(--color-text-1)]" {...props} />,
                    li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-[color:var(--color-amber-bright)]" {...props} />,
                    em: ({ node, ...props }) => <em className="italic text-[color:var(--color-text-1)]" {...props} />,
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="border-l-2 border-[color:var(--color-amber)] pl-3 italic text-[color:var(--color-text-2)] my-2.5" {...props} />
                    ),
                    code: ({ node, inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline ? (
                        <div className="my-2.5 rounded-lg bg-[color:var(--color-void)] border border-[color:var(--border-subtle)] overflow-hidden">
                          {match && (
                            <div className="px-3 py-1 bg-[color:var(--color-elevated)] border-b border-[color:var(--border-subtle)] text-[11px] font-mono text-[color:var(--color-text-3)]">
                              {match[1]}
                            </div>
                          )}
                          <pre className="p-3 font-mono text-xs overflow-x-auto text-[color:var(--color-amber-bright)]">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      ) : (
                        <code className="px-1.5 py-0.5 rounded bg-[color:var(--color-elevated)] font-mono text-xs text-[color:var(--color-amber-bright)]" {...props}>
                          {children}
                        </code>
                      );
                    },
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-3">
                        <table className="min-w-full divide-y divide-[color:var(--border-subtle)] text-xs border border-[color:var(--border-subtle)]" {...props} />
                      </div>
                    ),
                    th: ({ node, ...props }) => <th className="px-3 py-2 bg-[color:var(--color-elevated)] font-medium text-left text-[color:var(--color-amber)]" {...props} />,
                    td: ({ node, ...props }) => <td className="px-3 py-2 border-t border-[color:var(--border-subtle)]" {...props} />,
                  }}
                >
                  {formattedContent}
                </ReactMarkdown>
              )}

              {/* Real-time typing cursor while streaming */}
              {isStreaming && message.content && (
                <span className="inline-block w-2 h-4 ml-1 bg-[color:var(--color-amber)] animate-pulse rounded-xs align-middle" />
              )}
            </div>
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
        .thinking-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-amber);
          animation: dot-pulse 1.4s ease-in-out infinite;
        }
        .thinking-dot:nth-child(2) { animation-delay: 0.16s; }
        .thinking-dot:nth-child(3) { animation-delay: 0.32s; }
      `}</style>
    </div>
  );
}
