import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConversationSidebar from '../components/chat/ConversationSidebar';
import ChatBubble from '../components/chat/ChatBubble';
import ChatInput from '../components/chat/ChatInput';
import api, { BASE_URL } from '../lib/api';
import { useToast } from '../components/ui/Toast';
import { useAuthStore } from '../store/authStore';

export default function Chat() {
  const { conversationId, bookId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { accessToken } = useAuthStore();

  const [bookTitle, setBookTitle] = useState('');
  const [actualBookId, setActualBookId] = useState(bookId || null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamPhase, setStreamPhase] = useState('idle');
  const [isMobileOpen, setMobileOpen] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (bookId && !conversationId) {
      (async () => {
        try {
          const res = await api.get(`/chat/book/${bookId}`);
          const list = res.data;
          if (list && list.length > 0) {
            navigate(`/chat/${list[0].id}`, { replace: true });
          } else {
            startNewChat(bookId);
          }
        } catch {
          startNewChat(bookId);
        }
      })();
    }
  }, [bookId, conversationId]);

  useEffect(() => {
    if (conversationId) {
      fetchHistory(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const startNewChat = async (id) => {
    try {
      setLoading(true);
      const res = await api.post(`/chat/book/${id}`);
      navigate(`/chat/${res.data.id}`);
    } catch (err) {
      toast.error('Failed to start chat');
      navigate('/dashboard');
    }
  };

  const fetchHistory = async (id) => {
    try {
      setLoading(true);
      const [historyRes, convoRes] = await Promise.allSettled([
        api.get(`/chat/history/${id}`),
        api.get(`/chat/conversation/${id}`),
      ]);

      if (historyRes.status === 'fulfilled') {
        const sorted = historyRes.value.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        setMessages(sorted);
      }
      if (convoRes.status === 'fulfilled' && convoRes.value.data) {
        setActualBookId(convoRes.value.data.book_id);
        if (convoRes.value.data.book_title) {
          setBookTitle(convoRes.value.data.book_title);
        }
      }
    } catch (err) {
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (content) => {
    if (!content.trim() || isStreaming) return;

    const newMessage = { id: Date.now(), role: 'user', content, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, newMessage]);
    setIsStreaming(true);
    setStreamingContent('');
    setStreamPhase('connecting');

    try {
      const response = await fetch(`${BASE_URL}/chat/ask/stream/${conversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ question: content }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let finalContent = '';
      let firstTokenReceived = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  if (!firstTokenReceived) {
                    firstTokenReceived = true;
                    setStreamPhase('thinking');
                  }
                  setStreamPhase('streaming');
                  finalContent += parsed.content;
                  setStreamingContent(finalContent);
                }
              } catch {
                if (!firstTokenReceived) {
                  firstTokenReceived = true;
                  setStreamPhase('thinking');
                }
                setStreamPhase('streaming');
                finalContent += data.replace(/\\n/g, '\n');
                setStreamingContent(finalContent);
              }
            }
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', content: finalContent, created_at: new Date().toISOString() },
      ]);
      setStreamPhase('done');
    } catch (err) {
      toast.error('Failed to get response');
      setStreamPhase('error');
    } finally {
      setTimeout(() => {
        setIsStreaming(false);
        setStreamingContent('');
        setStreamPhase('idle');
      }, 500);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-base)' }}>
      <ConversationSidebar
        bookId={actualBookId}
        bookTitle={bookTitle || 'Book Chat'}
        currentConvId={conversationId}
        isMobileOpen={isMobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="flex-1 flex flex-col relative min-w-0">
        <header className="lg:hidden p-4 border-b border-[color:var(--border-subtle)] flex items-center bg-[color:var(--color-raised)] shrink-0">
          <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 mr-2 rounded-lg text-[color:var(--color-text-3)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <h1 className="font-display text-lg text-[color:var(--color-text-1)] truncate">Chat</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto flex flex-col min-h-full">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[color:var(--border-subtle)] border-t-[color:var(--color-amber)] rounded-full" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-50">
                <div className="w-16 h-16 rounded-full bg-[color:var(--color-elevated)] flex items-center justify-center mb-4 text-[color:var(--color-amber)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <h3 className="font-display text-xl text-[color:var(--color-text-1)] mb-2">Ask Anything</h3>
                <p className="font-sans text-sm text-[color:var(--color-text-3)] max-w-sm">
                  The AI has read this book. Ask for summaries, specific concepts, or explanations.
                </p>
              </div>
            ) : (
              <div className="flex flex-col flex-1">
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}
                {isStreaming && (
                  <ChatBubble
                    message={{ role: 'assistant', content: streamingContent }}
                    isStreaming={true}
                    streamPhase={streamPhase}
                  />
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-4 md:p-6 bg-[color:var(--color-base)] shrink-0">
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-[color:var(--color-base)] to-transparent pointer-events-none" />
            <ChatInput onSend={handleSend} disabled={isStreaming} />
          </div>
        </div>
      </main>
    </div>
  );
}