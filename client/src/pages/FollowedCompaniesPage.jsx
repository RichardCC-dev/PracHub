import { useEffect, useState } from 'react';
import { ArrowLeft, Building2, Bell, History, Star, BellOff, MapPin, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useSavedCompanyStore from '../store/savedCompanyStore';
import FollowCompanyButton from '../components/FollowCompanyButton';

const FollowedCompaniesPage = () => {
  const navigate = useNavigate();
  const { followedCompanies, isLoading, fetchFollowedCompanies, updateNotifications } = useSavedCompanyStore();
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchFollowedCompanies(true);
  }, [fetchFollowedCompanies]);

  const handleToggleNotifications = async (companyId, currentValue) => {
    setUpdatingId(companyId);
    try {
      await updateNotifications(companyId, !currentValue);
    } finally {
      setUpdatingId(null);
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
              <h1 className="text-xl font-semibold text-gray-900">Empresas que sigo</h1>
              <p className="text-sm text-gray-500">Gestiona las empresas que sigues y sus notificaciones</p>
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
              className="flex items-center gap-2 px-1 py-3 border-b-2 border-emerald-500 text-emerald-700 font-medium"
            >
              <Building2 className="w-4 h-4" />
              Empresas que sigo
            </button>
            <button
              onClick={() => navigate('/alert-history')}
              className="flex items-center gap-2 px-1 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700"
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
        ) : followedCompanies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sigues ninguna empresa</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Sigue empresas para recibir notificaciones prioritarias cuando publiquen nuevas ofertas de prácticas.
            </p>
            <button
              onClick={() => navigate('/offers')}
              className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Explorar empresas
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {followedCompanies.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.company.legalName || item.company.tradeName}
                      </h3>
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                      {item.company.industry && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {item.company.industry}
                        </span>
                      )}
                      {item.company.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {item.company.location}
                        </span>
                      )}
                    </div>

                    {item.company.offers && item.company.offers.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Ofertas activas: {item.company.offers.length}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.company.offers.slice(0, 3).map((offer) => (
                            <span
                              key={offer.id}
                              className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-full"
                            >
                              {offer.title}
                            </span>
                          ))}
                          {item.company.offers.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                              +{item.company.offers.length - 3} más
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleToggleNotifications(item.companyId, item.notificationsEnabled)}
                      disabled={updatingId === item.companyId}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        item.notificationsEnabled
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {updatingId === item.companyId ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : item.notificationsEnabled ? (
                        <Bell className="w-4 h-4" />
                      ) : (
                        <BellOff className="w-4 h-4" />
                      )}
                      {item.notificationsEnabled ? 'Notificaciones on' : 'Notificaciones off'}
                    </button>

                    <FollowCompanyButton companyId={item.companyId} />
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

export default FollowedCompaniesPage;
