import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Briefcase,
  FileText,
  FileCheck2,
  Bot,
  BarChart3,
  Building2,
  Rss,
  Bell,
  MessageSquare,
  LogOut,
  ClipboardList,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useMessageStore from '../../store/messageStore';
import { companyName } from '../../utils/format';

const STUDENT_NAV = [
  { label: 'Inicio', icon: Home, to: '/dashboard', end: true },
  { label: 'Prácticas', icon: Briefcase, to: '/offers' },
  { label: 'Mis postulaciones', icon: FileCheck2, to: '/my-applications' },
  { label: 'Mi CV', icon: FileText, to: '/cv-builder' },
  { label: 'Simulador', icon: Bot, to: '/simulator', end: true },
  { label: 'Mi progreso', icon: BarChart3, to: '/simulator/history' },
  { label: 'Empresas que sigo', icon: Building2, to: '/followed-companies' },
  { label: 'Feed de empresas', icon: Rss, to: '/company-feed' },
  { label: 'Alertas', icon: Bell, to: '/alert-settings' },
  { label: 'Mensajes', icon: MessageSquare, to: '/inbox', badgeKey: 'messages' },
];

const COMPANY_NAV = [
  { label: 'Inicio', icon: Home, to: '/dashboard', end: true },
  { label: 'Ofertas y candidatos', icon: ClipboardList, to: '/company/offers' },
  { label: 'Métricas de seguidores', icon: BarChart3, to: '/company/metrics' },
  { label: 'Mensajes', icon: MessageSquare, to: '/inbox', badgeKey: 'messages' },
  { label: 'Perfil de empresa', icon: Building2, to: '/company/profile' },
];

const ADMIN_NAV = [
  { label: 'Panel', icon: Home, to: '/admin', end: true },
];

const NAV_BY_ROLE = {
  student: STUDENT_NAV,
  company: COMPANY_NAV,
  admin: ADMIN_NAV,
};

const Sidebar = ({ onNavigate, collapsed = false, onToggleCollapse }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const unreadMessages = useMessageStore((s) => s.unreadCount);

  const role = user?.role;
  const navItems = NAV_BY_ROLE[role] || [];

  const displayName =
    role === 'company'
      ? companyName(user?.companyProfile)
      : user?.studentProfile?.firstName
        ? `${user.studentProfile.firstName} ${user.studentProfile.lastName || ''}`.trim()
        : 'Mi cuenta';

  const handleLogout = async () => {
    await logout();
    onNavigate?.();
    navigate('/', { replace: true });
  };

  const homeRoute = role === 'admin' ? '/admin' : '/dashboard';

  return (
    <aside
      className={`flex h-full flex-col bg-emerald-950 text-emerald-50 transition-[width] duration-200 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo → vista principal + toggle colapsar */}
      <div
        className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-4`}
      >
        <button
          onClick={() => { navigate(homeRoute); onNavigate?.(); }}
          className={`flex items-center ${collapsed ? '' : 'gap-3'} rounded-xl px-2 py-1 text-left transition hover:bg-emerald-900/40`}
          title={collapsed ? 'PracHub' : undefined}
          aria-label="PracHub"
        >
          <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-lg font-black text-emerald-950">
            P
          </span>
          {!collapsed && (
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">PracHub</span>
          )}
        </button>
        {!collapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="rounded-lg p-1.5 text-emerald-300 transition hover:bg-emerald-900/60 hover:text-white"
            aria-label="Colapsar menú"
            title="Colapsar menú"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className={`flex-1 space-y-1 overflow-y-auto py-2 ${collapsed ? 'px-2' : 'px-3'}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const badge = item.badgeKey === 'messages' ? unreadMessages : 0;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              onClick={() => onNavigate?.()}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-xl text-sm font-medium transition ${
                  collapsed ? 'relative justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-emerald-700 text-white'
                    : 'text-emerald-100/80 hover:bg-emerald-900/60 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {badge > 0 && (
                <span
                  className={`inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white ${
                    collapsed ? 'absolute right-1 top-1 min-w-[16px] px-1' : ''
                  }`}
                >
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer: expandir (si colapsado) + usuario + logout */}
      <div className="border-t border-emerald-900/60 p-3">
        {collapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="mb-2 flex w-full items-center justify-center rounded-xl p-2 text-emerald-300 transition hover:bg-emerald-900/60 hover:text-white"
            aria-label="Expandir menú"
            title="Expandir menú"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        )}
        {!collapsed && (
          <div className="mb-2 px-2">
            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
            <p className="truncate text-xs text-emerald-300/70">{user?.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Cerrar sesión' : undefined}
          className={`flex w-full items-center rounded-xl text-sm font-medium text-emerald-100/80 transition hover:bg-emerald-900/60 hover:text-white ${
            collapsed ? 'justify-center px-2 py-2.5' : 'gap-2 px-3 py-2'
          }`}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
