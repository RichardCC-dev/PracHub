import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Menu, MessageSquare, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useMessageStore from '../../store/messageStore';
import NotificationBell from '../NotificationBell';

const HOME_ROUTES = ['/dashboard', '/admin'];

const TopBar = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const unreadMessages = useMessageStore((s) => s.unreadCount);

  const isHome = HOME_ROUTES.includes(location.pathname);
  const showMessaging = user?.role === 'student' || user?.role === 'company';

  const profileRoute =
    user?.role === 'company' ? '/company/profile'
    : user?.role === 'student' ? '/student/profile'
    : null;

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4">
      {/* Hamburguesa (móvil) */}
      <button
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Botón único de retroceso */}
      {!isHome && (
        <button
          onClick={goBack}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Atrás</span>
        </button>
      )}

      <div className="flex-1" />

      {/* Mensajes con badge */}
      {showMessaging && (
      <button
        onClick={() => navigate('/inbox')}
        className="relative rounded-lg p-2 text-gray-600 transition hover:bg-gray-100"
        aria-label="Mensajes"
        title="Mensajes"
      >
        <MessageSquare className="h-5 w-5" />
        {unreadMessages > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 py-0.5 text-[11px] font-bold text-white">
            {unreadMessages > 9 ? '9+' : unreadMessages}
          </span>
        )}
      </button>

      )}

      {/* Notificaciones (solo estudiante) */}
      <NotificationBell />

      {/* Avatar → perfil */}
      <button
        onClick={() => profileRoute && navigate(profileRoute)}
        disabled={!profileRoute}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition hover:bg-emerald-200 disabled:cursor-default disabled:opacity-70"
        title="Mi perfil"
        aria-label="Mi perfil"
      >
        <User className="h-5 w-5" />
      </button>
    </header>
  );
};

export default TopBar;
