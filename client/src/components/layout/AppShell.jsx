import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import useAuthStore from '../../store/authStore';
import useMessageStore from '../../store/messageStore';

/**
 * AppShell — layout persistente para vistas autenticadas.
 * Provee la barra lateral de funcionalidades (por rol), la barra superior con
 * el botón único de retroceso, el ícono de mensajes con badge, las
 * notificaciones y el acceso al perfil.
 */
const COLLAPSE_KEY = 'prachub.sidebar.collapsed';

const AppShell = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const fetchUnreadCount = useMessageStore((s) => s.fetchUnreadCount);

  // Mantener fresco el conteo de mensajes no leídos (badge).
  // Solo para estudiantes y empresas (no admin).
  useEffect(() => {
    if (!token || !user || user.role === 'admin') return undefined;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token, user, fetchUnreadCount]);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar fijo (escritorio) */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      </div>

      {/* Drawer (móvil) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-black/40"
            aria-label="Cerrar menú"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full shadow-2xl">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Columna principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
