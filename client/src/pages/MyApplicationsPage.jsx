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
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewingApplication, setViewingApplication] = useState(null); // Para ver detalle

  useEffect(() => {
    loadApplications();
  }, []);

  const filteredApplications = filterStatus === 'all'
    ? applications
    : applications.filter(app => app.status === filterStatus);

  const statusCounts = {
    all: applications.length,
    enviada: applications.filter(a => a.status === 'enviada').length,
    revision: applications.filter(a => a.status === 'revision').length,
    aceptada: applications.filter(a => a.status === 'aceptada').length,
    descartada: applications.filter(a => a.status === 'descartada').length,
  };

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
              onClick={() => navigate('/offers')}
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
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'Todas', count: statusCounts.all },
            { key: 'enviada', label: 'Enviadas', count: statusCounts.enviada },
            { key: 'revision', label: 'En Revisión', count: statusCounts.revision },
            { key: 'aceptada', label: 'Aceptadas', count: statusCounts.aceptada },
            { key: 'descartada', label: 'Descartadas', count: statusCounts.descartada },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

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
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500">
              No tienes postulaciones {filterStatus !== 'all' ? `con estado "${statusConfig[filterStatus]?.label || filterStatus}"` : ''}.
            </p>
            {filterStatus !== 'all' && (
              <button
                onClick={() => setFilterStatus('all')}
                className="mt-3 text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Ver todas las postulaciones
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => {
              const status = statusConfig[app.status] || statusConfig.enviada;
              const StatusIcon = status.icon;

              return (
                <div
                  key={app.id}
                  onClick={() => setViewingApplication(app)}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
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

                      {/* Company Response Message (when rejected) */}
                      {app.status === 'descartada' && app.companyNotes && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2 text-red-600 mb-2">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Mensaje de la empresa:</span>
                          </div>
                          <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">
                            {app.companyNotes}
                          </p>
                        </div>
                      )}

                      {/* Company Response Date */}
                      {app.companyResponseAt && (
                        <div className="mt-2 text-xs text-gray-500">
                          Respuesta recibida el: {formatDate(app.companyResponseAt)}
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

      {/* Application Detail Modal */}
      {viewingApplication && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingApplication(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {viewingApplication.offer?.title || 'Oferta no disponible'}
                    </h2>
                    <p className="text-gray-600">
                      {viewingApplication.offer?.company?.tradeName || viewingApplication.offer?.company?.legalName || 'Empresa no disponible'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                {(() => {
                  const status = statusConfig[viewingApplication.status] || statusConfig.enviada;
                  const StatusIcon = status.icon;
                  return (
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${status.color}`}>
                      <StatusIcon className="w-5 h-5" />
                      <span className="font-semibold">{status.label}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Postulado el</p>
                  <p className="font-medium text-gray-900">{formatDate(viewingApplication.appliedAt)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">CV utilizado</p>
                  <p className="font-medium text-gray-900">
                    {viewingApplication.resume ? `${viewingApplication.resume.completionPercentage}% completado` : 'N/A'}
                  </p>
                </div>
                {viewingApplication.offer?.modality && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Modalidad</p>
                    <p className="font-medium text-gray-900">{viewingApplication.offer.modality}</p>
                  </div>
                )}
                {viewingApplication.offer?.area && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Área</p>
                    <p className="font-medium text-gray-900">{viewingApplication.offer.area}</p>
                  </div>
                )}
              </div>

              {/* Company Notes (if rejected) */}
              {viewingApplication.status === 'descartada' && viewingApplication.companyNotes && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Mensaje de la empresa</span>
                  </div>
                  <p className="text-red-700">{viewingApplication.companyNotes}</p>
                  {viewingApplication.companyResponseAt && (
                    <p className="mt-2 text-xs text-red-500">
                      Respondido el {formatDate(viewingApplication.companyResponseAt)}
                    </p>
                  )}
                </div>
              )}

              {/* Cover Letter */}
              {viewingApplication.coverLetter && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Tu carta de presentación</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">{viewingApplication.coverLetter}</p>
                  </div>
                </div>
              )}

              {/* Offer Description */}
              {viewingApplication.offer?.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Descripción de la oferta</h3>
                  <p className="text-gray-600 whitespace-pre-line">{viewingApplication.offer.description}</p>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setViewingApplication(null)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPage;
