import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail,
  Building2,
  FileText,
  AlertCircle,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import { getOfferApplications, updateApplicationStatus } from '../services/applicationApi';
import { getMyOffers } from '../services/offerApi';
import useAuthStore from '../store/authStore';

const STATUS_CONFIG = {
  enviada: { 
    label: 'Enviada', 
    color: 'bg-blue-100 text-blue-700',
    icon: Mail,
    description: 'El estudiante ha postulado'
  },
  revision: { 
    label: 'En revisión', 
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
    description: 'Estás evaluando al candidato'
  },
  aceptada: { 
    label: 'Aceptada', 
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
    description: 'Candidato seleccionado'
  },
  descartada: { 
    label: 'Descartada', 
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
    description: 'No cumple con los requisitos'
  },
};

const OfferCandidatesPage = () => {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const backTo = searchParams.get('from') === 'offers' ? '/company/offers' : '/company/candidates';
  const { token } = useAuthStore();
  
  const [offer, setOffer] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal de gestión
  const [managingApplication, setManagingApplication] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Modal de CV
  const [viewingCV, setViewingCV] = useState(null);

  useEffect(() => {
    if (token && offerId) {
      loadData();
    }
  }, [token, offerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar ofertas para obtener info de la oferta actual
      const offersData = await getMyOffers(token);
      const currentOffer = offersData.offers?.find(o => o.id === parseInt(offerId));
      setOffer(currentOffer);
      
      // Cargar postulaciones
      const appsData = await getOfferApplications(offerId);
      setApplications(appsData.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!newStatus || !managingApplication) return;
    
    try {
      setUpdating(true);
      const payload = { status: newStatus };
      if (notes.trim()) payload.notes = notes.trim();
      if (internalNotes.trim()) payload.internalNotes = internalNotes.trim();
      await updateApplicationStatus(managingApplication.id, payload);
      
      // Actualizar lista local
      setApplications(prev => prev.map(app => 
        app.id === managingApplication.id 
          ? { ...app, status: newStatus, companyNotes: notes.trim() || null, companyResponseAt: new Date() }
          : app
      ));
      
      setManagingApplication(null);
      setNewStatus('');
      setNotes('');
      setInternalNotes('');
    } catch (err) {
      alert('Error al actualizar estado: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const student = app.student;
    const matchesSearch = !searchQuery || 
      `${student?.firstName} ${student?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student?.career?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student?.university?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-PE', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
              onClick={() => navigate(backTo)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">
                {offer?.title || 'Candidatos'}
              </h1>
              <p className="text-sm text-gray-500">
                {applications.length} {applications.length === 1 ? 'postulante' : 'postulantes'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            {error}
            <button onClick={loadData} className="ml-2 underline">Reintentar</button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, carrera o universidad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Candidates List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {applications.length === 0 ? 'No hay postulantes aún' : 'No se encontraron resultados'}
            </h3>
            <p className="text-gray-500">
              {applications.length === 0 
                ? 'Todavía nadie ha postulado a esta oferta.' 
                : 'Intenta con otros filtros de búsqueda.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => {
              const student = app.student;
              const resume = app.resume;
              const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.enviada;
              const StatusIcon = status.icon;

              return (
                <div key={app.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    {/* Student Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-blue-600">
                            {student?.firstName?.[0]}{student?.lastName?.[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {student?.firstName} {student?.lastName}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                              <StatusIcon className="w-4 h-4" />
                              {status.label}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-2">
                            {student?.career} • {student?.university}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              CV: {resume?.completionPercentage || 0}% completado
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              Postuló: {formatDate(app.appliedAt)}
                            </span>
                            {app.coverLetter && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Con carta de presentación
                              </span>
                            )}
                          </div>

                          {/* Company Notes (if rejected) */}
                          {app.status === 'descartada' && app.companyNotes && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-700">
                                <span className="font-semibold">Mensaje al candidato: </span>
                                {app.companyNotes}
                              </p>
                            </div>
                          )}

                          {/* Internal Notes (solo empresa) */}
                          {app.internalNotes && (
                            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <p className="text-sm text-amber-800">
                                <span className="font-semibold">🔒 Nota interna: </span>
                                {app.internalNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => setViewingCV(app)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Ver CV
                      </button>
                      <button
                        onClick={() => {
                          setManagingApplication(app);
                          setNewStatus(app.status);
                          setNotes(app.companyNotes || '');
                          setInternalNotes(app.internalNotes || '');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Gestionar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manage Status Modal */}
      {managingApplication && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setManagingApplication(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Gestionar postulación
              </h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Candidato:</p>
                <p className="font-semibold text-gray-900">
                  {managingApplication.student?.firstName} {managingApplication.student?.lastName}
                </p>
              </div>

              {/* Status Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo estado
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setNewStatus(key)}
                        className={`flex items-center gap-2 p-3 rounded-lg border text-left transition ${
                          newStatus === key 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${newStatus === key ? 'text-blue-600' : 'text-gray-500'}`} />
                        <div>
                          <p className={`font-medium text-sm ${newStatus === key ? 'text-blue-900' : 'text-gray-900'}`}>
                            {config.label}
                          </p>
                          <p className="text-xs text-gray-500">{config.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes (only for rejected) */}
              {newStatus === 'descartada' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Mensaje para el candidato (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Explica por qué no se seleccionó al candidato. Este mensaje será visible para el estudiante."
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500 mt-1">{notes.length}/1000 caracteres</p>
                </div>
              )}

              {/* Internal Notes (siempre visible, solo empresa) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas internas (solo visible para tu equipo)
                </label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Observaciones internas sobre el candidato (no se envían al estudiante)."
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] bg-amber-50 border-amber-200"
                  maxLength={2000}
                />
                <p className="text-xs text-amber-600 mt-1">🔒 Este campo es privado y no es visible para el candidato.</p>
              </div>

              {/* Cover Letter Preview */}
              {managingApplication.coverLetter && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Carta de presentación del candidato:
                  </p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {managingApplication.coverLetter}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setManagingApplication(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={updating}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={updating || !newStatus || newStatus === managingApplication.status}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Actualizando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CV Preview Modal */}
      {viewingCV && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingCV(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {viewingCV.student?.firstName} {viewingCV.student?.lastName}
                  </h2>
                  <p className="text-gray-600">{viewingCV.student?.career}</p>
                </div>
                <button
                  onClick={() => setViewingCV(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* CV Content */}
              {viewingCV.resume ? (() => {
                const cv = viewingCV.resume;
                const personal = cv.personal || {};
                const summary = cv.profile?.summary || '';
                const eduItems = cv.education?.items || [];
                const expItems = (cv.experience?.items || []).filter(e => e.role || e.company);
                const skillAreas = (cv.skills?.areas || []).filter(a => a.skills);
                const softSkills = cv.skills?.soft || '';
                const langList = cv.languages?.list || '';
                const projects = (cv.projects?.items || []).filter(p => p.title);
                const certifications = (cv.certifications?.items || []).filter(c => c.name);

                return (
                  <div className="space-y-5">
                    {/* Datos personales */}
                    <div className="bg-gray-50 rounded-lg p-4 flex flex-wrap gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Nombre</p>
                        <p className="font-medium text-gray-900">{personal.fullName || `${viewingCV.student?.firstName} ${viewingCV.student?.lastName}`}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Carrera</p>
                        <p className="font-medium text-gray-900">{viewingCV.student?.career}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Universidad</p>
                        <p className="font-medium text-gray-900">{viewingCV.student?.university}</p>
                      </div>
                      {(personal.email || viewingCV.student?.user?.email) && (
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{personal.email || viewingCV.student?.user?.email}</p>
                        </div>
                      )}
                      {(personal.phone || viewingCV.student?.phoneNumber) && (
                        <div>
                          <p className="text-xs text-gray-500">Teléfono</p>
                          <p className="font-medium text-gray-900">{personal.phone || viewingCV.student?.phoneNumber}</p>
                        </div>
                      )}
                      {personal.linkedin && (
                        <div>
                          <p className="text-xs text-gray-500">LinkedIn</p>
                          <p className="font-medium text-blue-600">{personal.linkedin}</p>
                        </div>
                      )}
                    </div>

                    {/* Resumen profesional */}
                    {summary && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Resumen profesional</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{summary}</p>
                      </div>
                    )}

                    {/* Educación */}
                    {eduItems.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Educación</h3>
                        <div className="space-y-2">
                          {eduItems.map((edu, i) => (
                            <div key={i} className="border-l-2 border-blue-400 pl-3">
                              <p className="font-medium text-gray-900 text-sm">{edu.degree}</p>
                              <p className="text-gray-600 text-sm">{edu.institution}</p>
                              {(edu.startDate || edu.endDate) && (
                                <p className="text-xs text-gray-400">{edu.startDate} — {edu.endDate || 'Actualidad'}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experiencia */}
                    {expItems.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Experiencia</h3>
                        <div className="space-y-2">
                          {expItems.map((exp, i) => (
                            <div key={i} className="border-l-2 border-green-400 pl-3">
                              <p className="font-medium text-gray-900 text-sm">{exp.role}</p>
                              <p className="text-gray-600 text-sm">{exp.company}</p>
                              {exp.description && (
                                <p className="text-gray-500 text-sm mt-1">{exp.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Habilidades técnicas */}
                    {skillAreas.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Habilidades técnicas</h3>
                        <div className="space-y-2">
                          {skillAreas.map((area, i) => (
                            <div key={i}>
                              {area.area && <p className="text-xs font-semibold text-gray-500 mb-1">{area.area}</p>}
                              <div className="flex flex-wrap gap-1.5">
                                {area.skills.split(',').map(s => s.trim()).filter(Boolean).map((s, j) => (
                                  <span key={j} className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Habilidades blandas */}
                    {softSkills && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Habilidades blandas</h3>
                        <p className="text-gray-600 text-sm">{softSkills}</p>
                      </div>
                    )}

                    {/* Idiomas */}
                    {langList && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Idiomas</h3>
                        <p className="text-gray-600 text-sm">{langList}</p>
                      </div>
                    )}

                    {/* Proyectos */}
                    {projects.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Proyectos</h3>
                        <div className="space-y-2">
                          {projects.map((proj, i) => (
                            <div key={i} className="border-l-2 border-purple-400 pl-3">
                              <p className="font-medium text-gray-900 text-sm">{proj.title}</p>
                              {proj.description && <p className="text-gray-500 text-sm">{proj.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certificaciones */}
                    {certifications.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Certificaciones</h3>
                        <div className="space-y-1">
                          {certifications.map((cert, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></span>
                              <p className="text-gray-600 text-sm">{cert.name}{cert.issuer ? ` — ${cert.issuer}` : ''}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })() : (
                <p className="text-gray-500 text-center py-8">El candidato no tiene CV registrado.</p>
              )}

              {/* Close Button */}
              <button
                onClick={() => setViewingCV(null)}
                className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

export default OfferCandidatesPage;
