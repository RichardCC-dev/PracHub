import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Building2, Clock, FileText, Loader2, AlertCircle, CheckCircle, Clock3, XCircle } from 'lucide-react';
import { getMyApplications } from '../services/applicationApi';
import useAuthStore from '../store/authStore';

const statusConfig = {
  enviada: { label: 'Enviada', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  revision: { label: 'En Revisión', color: 'bg-yellow-100 text-yellow-700', icon: Clock3 },
  descartada: { label: 'Descartada', color: 'bg-red-100 text-red-700', icon: XCircle },
  aceptada: { label: 'Aceptada', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

const MyApplicationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await getMyApplications();
      setApplications(response.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar las postulaciones');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Cargando postulaciones...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Mis Postulaciones</h1>
              <p className="text-sm text-gray-500">
                {applications.length} {applications.length === 1 ? 'postulación' : 'postulaciones'} en total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {error ? (
          <div className="bg-red-50 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-medium">Error al cargar</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes postulaciones aún
            </h3>
            <p className="text-gray-500 mb-6">
              Explora las ofertas disponibles y postula a las que más te interesen.
            </p>
            <button
              onClick={() => navigate('/offers')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Ver Ofertas Disponibles
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const status = statusConfig[app.status] || statusConfig.enviada;
              const StatusIcon = status.icon;

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Offer Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {app.offer?.title || 'Oferta no disponible'}
                          </h3>
                          <p className="text-gray-600">
                            {app.offer?.company?.tradeName || app.offer?.company?.legalName || 'Empresa no disponible'}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {app.offer?.modality || 'N/A'}
                            </span>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {app.offer?.area || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Application Details */}
                      <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Postulado el:</span>
                          <p className="font-medium text-gray-900">{formatDate(app.appliedAt)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">CV utilizado:</span>
                          <p className="font-medium text-gray-900">
                            {app.resume ? `Completitud: ${app.resume.completionPercentage}%` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Estado:</span>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium mt-1 ${status.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {status.label}
                          </div>
                        </div>
                      </div>

                      {/* Cover Letter Preview */}
                      {app.coverLetter && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm font-medium">Carta de presentación:</span>
                          </div>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg line-clamp-3">
                            {app.coverLetter}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplicationsPage;
