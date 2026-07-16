import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, X, ArrowLeft, Briefcase, Building2, FileText, Clock, MapPin } from 'lucide-react';
import {
  getMyNotifications,
  getNotificationById,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationApi';
import useAuthStore from '../store/authStore';

const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatFullDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const MODALITY_LABELS = { remote: 'Remoto', in_person: 'Presencial', hybrid: 'Híbrido' };

const NotificationBell = () => {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (token && user?.role === 'student') {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [token, user?.role]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setSelectedNotif(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user || user.role !== 'student') return null;

  const loadUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch { void 0; }
  };

  const handleOpen = async () => {
    setOpen((prev) => !prev);
    if (!open) {
      setSelectedNotif(null);
      setLoading(true);
      try {
        const data = await getMyNotifications();
        setNotifications(data.data || []);
      } catch { void 0; }
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch { void 0; }
  };

  const handleNotificationClick = async (n) => {
    if (!n.isRead) await handleMarkAsRead(n.id);
    // Cargar detalle enriquecido
    setDetailLoading(true);
    setSelectedNotif({ ...n, extra: null });
    try {
      const data = await getNotificationById(n.id);
      setSelectedNotif(data.data || n);
    } catch {
      // Si falla, mostrar la notificación básica
    }
    setDetailLoading(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { void 0; }
  };

  const handleNavigateToOffer = (offerId) => {
    setOpen(false);
    setSelectedNotif(null);
    navigate('/offers', { state: { openOfferId: offerId } });
  };

  const handleNavigateToApplications = () => {
    setOpen(false);
    setSelectedNotif(null);
    navigate('/my-applications');
  };

  // ── Render del detalle ──
  const renderDetail = () => {
    if (detailLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    const n = selectedNotif;
    const extra = n?.extra;
    const isOffer = extra?.kind === 'offer';
    const isApplication = extra?.kind === 'application' || extra?.kind === 'application_received';

    return (
      <div className="flex flex-col h-full">
        {/* Header con botón volver */}
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
          <button
            onClick={() => setSelectedNotif(null)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <h3 className="font-semibold text-gray-900 text-sm">Detalle de notificación</h3>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-4">
          {/* Info básica de la notificación */}
          <div>
            <p className="font-bold text-gray-900 text-base mb-1">{n?.title}</p>
            <p className="text-gray-600 text-sm leading-relaxed">{n?.message}</p>
            <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatFullDate(n?.created_at)}
            </p>
          </div>

          <div className="border-t border-gray-100" />

          {/* Información enriquecida de la oferta */}
          {isOffer && extra.offer && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Oferta relacionada</h4>
              <div className="rounded-lg border border-gray-200 p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{extra.offer.title}</p>
                    <p className="text-gray-500 text-xs">{extra.offer.area}</p>
                  </div>
                </div>

                {extra.offer.company && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    {extra.offer.company.tradeName || extra.offer.company.legalName}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 text-xs">
                  {extra.offer.modality && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {MODALITY_LABELS[extra.offer.modality] || extra.offer.modality}
                    </span>
                  )}
                  {extra.offer.duration && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {extra.offer.duration}
                    </span>
                  )}
                  {extra.offer.compensation && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                      {extra.offer.compensation}
                    </span>
                  )}
                </div>

                {extra.offer.status && (
                  <p className="text-xs text-gray-400">
                    Estado: <span className="font-medium">{extra.offer.status === 'approved' ? 'Activa' : extra.offer.status}</span>
                  </p>
                )}
              </div>

              <button
                onClick={() => handleNavigateToOffer(extra.offer.id)}
                className="w-full bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-800 transition-colors"
              >
                Ver oferta completa
              </button>
            </div>
          )}

          {/* Información enriquecida de postulación */}
          {isApplication && extra.application && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Postulación relacionada</h4>
              <div className="rounded-lg border border-gray-200 p-3 space-y-2">
                {extra.application.offer && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{extra.application.offer.title}</p>
                      {extra.application.offer.area && (
                        <p className="text-gray-500 text-xs">{extra.application.offer.area}</p>
                      )}
                    </div>
                  </div>
                )}

                {extra.application.company && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    {extra.application.company.tradeName || extra.application.company.legalName}
                  </div>
                )}

                {extra.application.student && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-gray-400">Postulante:</span>
                    {extra.application.student.firstName} {extra.application.student.lastName}
                    {extra.application.student.career && (
                      <span className="text-gray-400">· {extra.application.student.career}</span>
                    )}
                  </div>
                )}

                {extra.application.status && (
                  <p className="text-xs text-gray-400">
                    Estado: <span className="font-medium capitalize">{extra.application.status}</span>
                  </p>
                )}

                <p className="text-xs text-gray-400">
                  Postulado el {formatFullDate(extra.application.createdAt)}
                </p>
              </div>

              <button
                onClick={handleNavigateToApplications}
                className="w-full bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-800 transition-colors"
              >
                Ver mis postulaciones
              </button>
            </div>
          )}

          {/* Si no hay info extra */}
          {!isOffer && !isApplication && (
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-xs text-gray-400">No hay información adicional disponible.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Render de la lista ──
  const renderList = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-900">Notificaciones</h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
              title="Marcar todas como leídas"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todo
            </button>
          )}
          <button
            onClick={() => setOpen(false)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="max-h-[420px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No tienes notificaciones</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`px-4 py-3 border-b last:border-0 cursor-pointer transition-colors ${
                n.isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
              }`}
              onClick={() => handleNotificationClick(n)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    )}
                    <p className="font-semibold text-gray-900 text-sm truncate">{n.title}</p>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">{n.message}</p>
                  <p className="text-gray-400 text-xs mt-1">{formatDate(n.created_at)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón campana */}
      <button
        onClick={handleOpen}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notificaciones"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {selectedNotif ? renderDetail() : renderList()}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
