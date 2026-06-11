import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Trash2, ChevronLeft, Menu } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../ui/Toast';
import ConfirmModal from '../ui/ConfirmModal';

export default function ConversationSidebar({
  bookId,
  bookTitle,
  currentConvId,
  isMobileOpen,
  setMobileOpen,
}) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [convToDelete, setConvToDelete] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
  }, [bookId]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/chat/book/${bookId}`);
      setConversations(res.data);
    } catch (err) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const res = await api.post(`/chat/book/${bookId}`);
      toast.success('New conversation started');
      fetchConversations();
      navigate(`/chat/${res.data.id}`);
      setMobileOpen(false);
    } catch (err) {
      toast.error('Failed to create conversation');
    }
  };

  const handleDelete = async () => {
    if (!convToDelete) return;
    try {
      await api.delete(`/chat/${convToDelete}`);
      toast.success('Conversation deleted');
      setDeleteModalOpen(false);
      setConvToDelete(null);
      fetchConversations();
      if (currentConvId === convToDelete) {
        navigate(`/books/${bookId}/chat`);
      }
    } catch (err) {
      toast.error('Failed to delete conversation');
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-50 lg:z-0 top-0 left-0 h-full w-72 transition-transform duration-300 flex flex-col`}
        style={{
          background: 'var(--color-raised)',
          borderRight: '1px solid var(--border-subtle)',
          transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <style>{`
          @media (min-width: 1024px) {
            aside { transform: translateX(0) !important; }
          }
        `}</style>

        {/* Header */}
        <div className="p-4 border-b border-[color:var(--border-subtle)] flex items-center justify-between shrink-0">
          <Link to="/dashboard" className="font-display text-lg text-amber-glow" style={{ color: 'var(--color-amber)' }}>
            Pustakalaya
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to={`/books/${bookId}`}
              className="p-2 rounded-lg text-[color:var(--color-text-3)] hover:text-[color:var(--color-text-1)] hover:bg-[color:var(--color-hover)] transition-colors"
              title="Back to Book"
            >
              <ChevronLeft size={18} />
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg text-[color:var(--color-text-3)]"
              onClick={() => setMobileOpen(false)}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Book Title */}
        <div className="p-4 shrink-0">
          <h2 className="font-display text-lg mb-4 truncate" style={{ color: 'var(--color-amber)' }} title={bookTitle}>
            {bookTitle || 'Loading...'}
          </h2>
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-sans text-sm font-medium transition-all cursor-pointer"
            style={{
              background: 'var(--color-amber-ghost)',
              color: 'var(--color-amber)',
              border: '1px solid var(--border-hover)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-amber-glow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-amber-ghost)';
            }}
          >
            <Plus size={16} /> New Chat
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading ? (
            <div className="p-4 text-center font-sans text-sm" style={{ color: 'var(--color-text-3)' }}>
              Loading...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center font-sans text-sm" style={{ color: 'var(--color-text-3)' }}>
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === currentConvId;
              return (
                <div
                  key={conv.id}
                  className="group relative flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors"
                  style={{
                    background: isActive ? 'var(--color-amber-ghost)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--color-amber)' : '3px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--color-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                  onClick={() => {
                    navigate(`/chat/${conv.id}`);
                    setMobileOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare size={14} style={{ color: isActive ? 'var(--color-amber)' : 'var(--color-text-3)' }} />
                    <span
                      className="font-sans text-sm truncate"
                      style={{ color: isActive ? 'var(--color-text-1)' : 'var(--color-text-2)', fontWeight: isActive ? 500 : 400 }}
                    >
                      {new Date(conv.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConvToDelete(conv.id);
                      setDeleteModalOpen(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md transition-all hover:bg-red-500/10 hover:text-red-400"
                    style={{ color: 'var(--color-text-3)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Conversation"
        message="Are you sure you want to delete this chat? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setConvToDelete(null);
        }}
      />
    </>
  );
}
