import { useEffect, useState } from 'react';
import { ArrowLeft, Bell, Building2, History, CheckCircle, Star, Percent, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAlertStore from '../store/alertStore';

const TYPE_ICONS = {
  offer_match: <Percent className="w-5 h-5" />,
  followed_company_offer: <Star className="w-5 h-5" />,
};

const TYPE_LABELS = {
  offer_match: 'Oferta compatible',
  followed_company_offer: 'Empresa que sigues',
};

const AlertHistoryPage = () => {
  const navigate = useNavigate();
  const { history, isLoading, fetchHistory } = useAlertStore();
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    fetchHistory({ limit: 50 });
  }, [fetchHistory]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Hoy, ${date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">Historial de Alertas</h1>
              <p className="text-sm text-gray-500">Ofertas compatibles que te hemos notificado</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación secundaria */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex gap-6">
            <button
              onClick={() => navigate('/alert-settings')}
              className="flex items-center gap-2 px-1 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            >
              <Bell className="w-4 h-4" />
              Configuración
            </button>
            <button
              onClick={() => navigate('/followed-companies')}
              className="flex items-center gap-2 px-1 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            >
              <Building2 className="w-4 h-4" />
              Empresas que sigo
            </button>
            <button
              onClick={() => navigate('/alert-history')}
              className="flex items-center gap-2 px-1 py-3 border-b-2 border-emerald-500 text-emerald-700 font-medium"
            >
              <History className="w-4 h-4" />
              Historial de alertas
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes alertas aún</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Cuando se publiquen ofertas compatibles con tu perfil, aparecerán aquí.
            </p>
            <button
              onClick={() => navigate('/offers')}
              className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Explorar ofertas
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-lg shadow-sm border p-6 cursor-pointer transition-all ${
                  selectedAlert === alert.id
                    ? 'border-emerald-500 ring-1 ring-emerald-500'
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
                onClick={() => setSelectedAlert(selectedAlert === alert.id ? null : alert.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    alert.isFromFollowedCompany
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {alert.isFromFollowedCompany ? (
                      <Star className="w-5 h-5" />
                    ) : (
                      <Percent className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            alert.isFromFollowedCompany
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {alert.isFromFollowedCompany ? 'Empresa que sigues' : 'Oferta compatible'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(alert.sentAt)}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900">
                          {alert.offer?.title || 'Oferta de prácticas'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {alert.offer?.company?.legalName || 'Empresa'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-sm font-bold text-emerald-700">
                              {alert.compatibilityScore}%
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">match</span>
                        </div>

                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      </div>
                    </div>

                    {selectedAlert === alert.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 mb-4">
                          {alert.offer?.description?.substring(0, 200)}...
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/offers', {
                              state: {
                                openOfferId: alert.offerId
                              }
                            });
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          Ver oferta
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default AlertHistoryPage;
