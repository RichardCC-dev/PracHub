import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Building2, 
  Briefcase,
  Loader2,
  Bookmark,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getAllOffers } from '../services/offerApi';
import { getMyApplications, canApply } from '../services/applicationApi';
import ApplyModal from '../components/ApplyModal';
import useAuthStore from '../store/authStore';

const StudentOffersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModality, setSelectedModality] = useState('');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState({});

  const modalities = ['remoto', 'presencial', 'híbrido'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar ofertas (público, no requiere auth)
      const offersResponse = await getAllOffers();
      setOffers(offersResponse.data?.offers || []);
      
      // Cargar aplicaciones del estudiante (requiere auth) - manejar error separadamente
      try {
        const applicationsResponse = await getMyApplications();
        setApplications(applicationsResponse.data || []);
      } catch (appError) {
        console.warn('No se pudieron cargar las aplicaciones:', appError.message);
        setApplications([]);
      }
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async (offerId) => {
    try {
      setCheckingStatus(prev => ({ ...prev, [offerId]: true }));
      const response = await canApply(offerId);
      return response.data;
    } catch (error) {
      return { canApply: false, reason: 'Error al verificar' };
    } finally {
      setCheckingStatus(prev => ({ ...prev, [offerId]: false }));
    }
  };

  const handleApplyClick = async (offer) => {
    setSelectedOffer(offer);
    setIsApplyModalOpen(true);
  };

  const handleApplySuccess = () => {
    loadData(); // Recargar para actualizar estados
  };

  const getApplicationStatusForOffer = (offerId) => {
    const application = applications.find(app => app.offerId === offerId);
    return application ? application.status : null;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      enviada: { color: 'bg-blue-100 text-blue-700', label: 'Enviada' },
      revision: { color: 'bg-yellow-100 text-yellow-700', label: 'En revisión' },
      descartada: { color: 'bg-red-100 text-red-700', label: 'Descartada' },
      aceptada: { color: 'bg-green-100 text-green-700', label: 'Aceptada' },
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-700', label: status };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = 
      offer.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.company?.tradeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.company?.legalName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesModality = !selectedModality || offer.modality === selectedModality;
    
    return matchesSearch && matchesModality && offer.status === 'approved';
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Cargando ofertas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bolsa de Prácticas
              </h1>
              <p className="text-gray-600 mt-1">
                Encuentra oportunidades de prácticas profesionales
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                Volver al Dashboard
              </button>
              <button
                onClick={() => navigate('/my-applications')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Mis Postulaciones
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título o empresa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedModality}
                onChange={(e) => setSelectedModality(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las modalidades</option>
                {modalities.map(mod => (
                  <option key={mod} value={mod}>
                    {mod.charAt(0).toUpperCase() + mod.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-4">
          {filteredOffers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron ofertas
              </h3>
              <p className="text-gray-600">
                Intenta ajustar tus filtros de búsqueda
              </p>
            </div>
          ) : (
            filteredOffers.map((offer) => {
              const applicationStatus = getApplicationStatusForOffer(offer.id);
              
              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {offer.company?.logoUrl ? (
                            <img
                              src={offer.company.logoUrl}
                              alt={offer.company.tradeName}
                              className="w-10 h-10 object-contain"
                            />
                          ) : (
                            <Building2 className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {offer.title}
                          </h3>
                          <p className="text-gray-600">
                            {offer.company?.tradeName || offer.company?.legalName}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                              <MapPin className="w-3 h-3" />
                              {offer.modality}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-sm">
                              <Clock className="w-3 h-3" />
                              {offer.duration}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded text-sm">
                              {offer.area}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {applicationStatus ? (
                          <>
                            {getStatusBadge(applicationStatus)}
                            <span className="text-xs text-gray-500">
                              Ya postulaste
                            </span>
                          </>
                        ) : (
                          <button
                            onClick={() => handleApplyClick(offer)}
                            disabled={checkingStatus[offer.id]}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {checkingStatus[offer.id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Postular Ahora'
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Tags de carrera */}
                    {offer.careerTags && offer.careerTags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {offer.careerTags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Descripción preview */}
                    <p className="mt-4 text-gray-600 text-sm line-clamp-2">
                      {offer.description}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        offerId={selectedOffer?.id}
        isOpen={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          setSelectedOffer(null);
        }}
        onSuccess={handleApplySuccess}
      />
    </div>
  );
};

export default StudentOffersPage;
