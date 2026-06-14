import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Building2,
  CheckCheck,
  Clock,
  RefreshCw,
} from 'lucide-react';
import useMessageStore from '../store/messageStore';
import useAuthStore from '../store/authStore';

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays} d`;
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
};

const Avatar = ({ user, size = 'md' }) => {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.displayName}
        className={`${sz} rounded-full object-cover border border-gray-200 flex-shrink-0`}
      />
    );
  }

  const isCompany = user?.role === 'company';
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center flex-shrink-0 ${
        isCompany ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
      }`}
    >
      {isCompany
        ? <Building2 className="w-4 h-4" />
        : <span className="font-semibold">{initials}</span>
      }
    </div>
  );
};

// ── ConversationList ──────────────────────────────────────────────────────────

const ConversationList = ({ conversations, selectedUserId, onSelect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
        <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-600 mb-1">Sin mensajes aún</p>
        <p className="text-xs text-gray-400">
          Los reclutadores podrán escribirte aquí cuando revisen tu perfil.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
      {conversations.map((conv) => {
        const { otherUser, lastMessage, unreadCount } = conv;
        const isSelected = selectedUserId === otherUser?.id;

        return (
          <button
            key={otherUser?.id}
            onClick={() => onSelect(otherUser?.id)}
            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
              isSelected ? 'bg-emerald-50 border-r-2 border-emerald-500' : ''
            }`}
          >
            <Avatar user={otherUser} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span
                  className={`text-sm truncate ${
                    unreadCount > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                  }`}
                >
                  {otherUser?.displayName || 'Usuario'}
                </span>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {formatDate(lastMessage?.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p
                  className={`text-xs truncate ${
                    unreadCount > 0 ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {lastMessage?.content || ''}
                </p>
                {unreadCount > 0 && (
                  <span className="ml-2 min-w-[18px] h-[18px] bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-bold flex-shrink-0">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// ── MessageThread ─────────────────────────────────────────────────────────────

const MessageThread = ({
  messages,
  currentUserId,
  otherUser,
  isLoading,
  isSending,
  onSend,
  onBack,
}) => {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || isSending) return;
    const toSend = text.trim();
    setText('');
    await onSend(toSend);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!otherUser) {
    return (
      <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center px-8 bg-gray-50">
        <MessageSquare className="w-16 h-16 text-gray-200 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Selecciona una conversación
        </h3>
        <p className="text-sm text-gray-400 max-w-xs">
          Elige un hilo de la bandeja para leer y responder mensajes de reclutadores.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header de la conversación */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
        {/* Botón volver (solo móvil) */}
        <button
          onClick={onBack}
          className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          aria-label="Volver a conversaciones"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <Avatar user={otherUser} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{otherUser.displayName}</p>
          <p className="text-xs text-gray-400 capitalize">
            {otherUser.role === 'company' ? 'Empresa reclutadora' : 'Estudiante'}
          </p>
        </div>
      </div>

      {/* Lista de mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">Inicia la conversación respondiendo abajo.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs sm:max-w-sm lg:max-w-md rounded-2xl px-4 py-2.5 shadow-sm ${
                    isMine
                      ? 'bg-emerald-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                  <div
                    className={`flex items-center gap-1 mt-1 ${
                      isMine ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <Clock className="w-3 h-3 opacity-50" />
                    <span className="text-xs opacity-50">
                      {formatDate(msg.createdAt || msg.created_at)}
                    </span>
                    {isMine && msg.isRead && (
                      <CheckCheck className="w-3 h-3 opacity-50" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input de respuesta */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 px-4 py-3 border-t border-gray-200 bg-white"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu respuesta… (Enter para enviar)"
          rows={1}
          maxLength={2000}
          className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all max-h-32 overflow-y-auto"
          style={{ minHeight: '42px' }}
        />
        <button
          type="submit"
          disabled={!text.trim() || isSending}
          className="flex-shrink-0 w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Enviar mensaje"
        >
          {isSending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
};

// ── InboxPage ─────────────────────────────────────────────────────────────────

const InboxPage = () => {
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams();
  const { user } = useAuthStore();

  const {
    conversations,
    currentMessages,
    currentOtherUser,
    unreadCount,
    isLoading,
    isSending,
    error,
    fetchInbox,
    fetchUnreadCount,
    fetchConversation,
    sendMessage,
    clearCurrentConversation,
  } = useMessageStore();

  const [selectedUserId, setSelectedUserId] = useState(
    paramUserId ? parseInt(paramUserId) : null
  );
  // En móvil: mostrar lista o conversación
  const [mobileView, setMobileView] = useState(paramUserId ? 'thread' : 'list');

  // Cargar bandeja al montar + polling cada 30 segundos
  useEffect(() => {
    fetchInbox();
    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchInbox();
      fetchUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchInbox, fetchUnreadCount]);

  // Reaccionar a cambios del userId en la URL
  useEffect(() => {
    if (paramUserId) {
      const id = parseInt(paramUserId);
      setSelectedUserId(id);
      setMobileView('thread');
      fetchConversation(id);
    } else {
      clearCurrentConversation();
      setSelectedUserId(null);
      setMobileView('list');
    }
  }, [paramUserId, fetchConversation, clearCurrentConversation]);

  const handleSelectConversation = (userId) => {
    setSelectedUserId(userId);
    setMobileView('thread');
    navigate(`/inbox/${userId}`, { replace: true });
  };

  const handleBackToList = () => {
    setMobileView('list');
    navigate('/inbox', { replace: true });
  };

  const handleSend = async (content) => {
    if (!selectedUserId) return;
    await sendMessage(selectedUserId, content);
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header global */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Volver al inicio"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h1 className="text-lg font-semibold text-gray-900">Mensajes</h1>
            {totalUnread > 0 && (
              <span className="min-w-[20px] h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>
          {/* Botón de refrescar manual */}
          <button
            onClick={() => { fetchInbox(); fetchUnreadCount(); }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
            aria-label="Actualizar mensajes"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => useMessageStore.getState().clearError()}
            className="ml-2 text-red-500 hover:text-red-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Layout principal */}
      <div className="flex flex-1 min-h-0 max-w-5xl mx-auto w-full">

        {/* Panel izquierdo: lista de conversaciones */}
        {/* En desktop: siempre visible. En móvil: solo si mobileView === 'list' */}
        <div
          className={`w-full md:w-72 md:flex flex-shrink-0 border-r border-gray-200 flex-col ${
            mobileView === 'list' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Conversaciones
            </p>
            {conversations.length > 0 && (
              <span className="text-xs text-gray-400">{conversations.length}</span>
            )}
          </div>
          <ConversationList
            conversations={conversations}
            selectedUserId={selectedUserId}
            onSelect={handleSelectConversation}
            isLoading={isLoading && conversations.length === 0}
          />
        </div>

        {/* Panel derecho: hilo de mensajes */}
        {/* En desktop: siempre visible. En móvil: solo si mobileView === 'thread' */}
        <div
          className={`flex-1 min-w-0 flex flex-col ${
            mobileView === 'thread' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <MessageThread
            messages={currentMessages}
            currentUserId={user?.id}
            otherUser={currentOtherUser}
            isLoading={isLoading && selectedUserId !== null && currentMessages.length === 0}
            isSending={isSending}
            onSend={handleSend}
            onBack={handleBackToList}
          />
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
