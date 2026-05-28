import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { getPendingOffers, getOfferStats, approveOffer, rejectOffer, getModerationHistory, getCompanies, enableCompanyPublishing, disableCompanyPublishing, getOffersByStatus } from '../services/adminApi';

const AdminDashboardPage = () => {
  const { token, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  const [pendingOffers, setPendingOffers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('offers');
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companyFilter, setCompanyFilter] = useState('all');
  const [offerFilter, setOfferFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const CAREER_TAGS = [
    'Ingeniería de Software', 'Sistemas de Información', 'Ingeniería Industrial',
    'Administración', 'Marketing', 'Contabilidad', 'Economía', 'Derecho',
    'Psicología', 'Comunicaciones', 'Diseño Gráfico', 'Arquitectura',
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [offersData, statsData, companiesData] = await Promise.all([
        getPendingOffers(token),
        getOfferStats(token),
        getCompanies(token),
      ]);
      
      setPendingOffers(offersData.offers || []);
      setStats(statsData.stats || null);
      setCompanies(companiesData.companies || []);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (offerId) => {
    try {
      setProcessingId(offerId);
      await approveOffer(token, offerId);
      
      // Actualizar lista
      setPendingOffers(prev => prev.filter(o => o.id !== offerId));
      if (stats) {
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          approved: prev.approved + 1,
        }));
      }
    } catch (err) {
      alert('Error al aprobar: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim() || rejectionReason.length < 10) {
      alert('El motivo debe tener al menos 10 caracteres');
      return;
    }

    try {
      setProcessingId(selectedOffer.id);
      await rejectOffer(token, selectedOffer.id, rejectionReason);
      
      // Actualizar lista
      setPendingOffers(prev => prev.filter(o => o.id !== selectedOffer.id));
      if (stats) {
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          rejected: prev.rejected + 1,
        }));
      }
      
      // Cerrar modal
      setSelectedOffer(null);
      setRejectionReason('');
      setIsRejecting(false);
    } catch (err) {
      alert('Error al rechazar: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (offer) => {
    setSelectedOffer(offer);
    setIsRejecting(true);
  };

  const closeRejectModal = () => {
    setSelectedOffer(null);
    setRejectionReason('');
    setIsRejecting(false);
  };

  const handleEnablePublishing = async (companyId) => {
    try {
      setProcessingId(companyId);
      await enableCompanyPublishing(token, companyId);
      setCompanies(prev => prev.map(c => 
        c.id === companyId ? { ...c, canPublishOffers: true } : c
      ));
    } catch (err) {
      alert('Error al habilitar: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDisablePublishing = async (companyId) => {
    try {
      setProcessingId(companyId);
      await disableCompanyPublishing(token, companyId);
      setCompanies(prev => prev.map(c => 
        c.id === companyId ? { ...c, canPublishOffers: false } : c
      ));
    } catch (err) {
      alert('Error al deshabilitar: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredCompanies = companies.filter(company => {
    if (companyFilter === 'all') return true;
    if (companyFilter === 'canPublish') return company.canPublishOffers;
    if (companyFilter === 'cannotPublish') return !company.canPublishOffers;
    if (companyFilter === 'verified') return company.verificationStatus === 'verified';
    if (companyFilter === 'pending') return company.verificationStatus === 'pending';
    return true;
  });

  const handleOfferFilterChange = (filter) => {
    setOfferFilter(filter);
    setPagination(prev => ({ ...prev, page: 1 }));
    // Recargar datos según el filtro
    if (filter === 'pending') {
      loadPendingOffers(1);
    } else if (filter === 'approved') {
      loadApprovedOffers(1);
    } else if (filter === 'rejected') {
      loadRejectedOffers(1);
    } else if (filter === 'closed') {
      loadClosedOffers(1);
    } else if (filter === 'all') {
      loadAllOffers(1);
    }
  };

  const buildFilters = (page = 1) => ({
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    search: searchQuery || undefined,
    page,
    limit: 10,
  });

  // Efecto para recargar cuando cambian los filtros de tags o búsqueda
  useEffect(() => {
    if (activeTab === 'offers') {
      const timer = setTimeout(() => {
        handleOfferFilterChange(offerFilter);
      }, 500); // Debounce para no hacer muchas requests
      return () => clearTimeout(timer);
    }
  }, [selectedTags, searchQuery, activeTab, offerFilter]);

  const loadPendingOffers = async (page = 1) => {
    try {
      setLoading(true);
      const data = await getOffersByStatus(token, 'pending', buildFilters(page));
      setPendingOffers(data.offers || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0, hasNextPage: false, hasPrevPage: false });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadApprovedOffers = async (page = 1) => {
    try {
      setLoading(true);
      const data = await getOffersByStatus(token, 'approved', buildFilters(page));
      setPendingOffers(data.offers || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0, hasNextPage: false, hasPrevPage: false });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRejectedOffers = async (page = 1) => {
    try {
      setLoading(true);
      const data = await getOffersByStatus(token, 'rejected', buildFilters(page));
      setPendingOffers(data.offers || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0, hasNextPage: false, hasPrevPage: false });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadClosedOffers = async (page = 1) => {
    try {
      setLoading(true);
      const data = await getOffersByStatus(token, 'closed', buildFilters(page));
      setPendingOffers(data.offers || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0, hasNextPage: false, hasPrevPage: false });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAllOffers = async (page = 1) => {
    try {
      setLoading(true);
      // Para "todas", cargamos pending sin paginación y el resto paginado
      const [pendingData, otherData] = await Promise.all([
        getPendingOffers(token),
        getOffersByStatus(token, 'approved', { ...buildFilters(page), limit: 5 }),
      ]);
      const allOffers = [
        ...(pendingData.offers || []),
        ...(otherData.offers || []),
      ];
      setPendingOffers(allOffers);
      setPagination(otherData.pagination || { page: 1, totalPages: 1, total: 0, hasNextPage: false, hasPrevPage: false });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (offerFilter === 'pending') loadPendingOffers(newPage);
    else if (offerFilter === 'approved') loadApprovedOffers(newPage);
    else if (offerFilter === 'rejected') loadRejectedOffers(newPage);
    else if (offerFilter === 'closed') loadClosedOffers(newPage);
    else loadAllOffers(newPage);
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    handleOfferFilterChange(offerFilter);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag];
      return newTags;
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setPagination(prev => ({ ...prev, page: 1 }));
    handleOfferFilterChange(offerFilter);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-sm text-gray-500">Moderación de ofertas de prácticas</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">{user?.email}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Administrador
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'offers'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Ofertas ({pendingOffers.length})
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'companies'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Empresas ({companies.length})
          </button>
        </div>

        {activeTab === 'offers' && (
          <>
            {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <button
              onClick={() => handleOfferFilterChange('all')}
              className={`text-left rounded-xl shadow-sm p-4 transition ${
                offerFilter === 'all'
                  ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-200'
                  : 'bg-white border-2 border-transparent hover:bg-gray-50'
              }`}
            >
              <p className={`text-sm ${offerFilter === 'all' ? 'text-emerald-700 font-semibold' : 'text-gray-500'}`}>Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </button>
            <button
              onClick={() => handleOfferFilterChange('pending')}
              className={`text-left rounded-xl shadow-sm p-4 transition ${
                offerFilter === 'pending'
                  ? 'bg-yellow-100 border-2 border-yellow-500 ring-2 ring-yellow-200'
                  : 'bg-yellow-50 border border-yellow-200 hover:bg-yellow-100'
              }`}
            >
              <p className={`text-sm ${offerFilter === 'pending' ? 'text-yellow-800 font-semibold' : 'text-yellow-700'}`}>Pendientes</p>
              <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
              {stats.overdue > 0 && (
                <p className="text-xs text-red-600 mt-1">{stats.overdue} &gt;48h</p>
              )}
            </button>
            <button
              onClick={() => handleOfferFilterChange('approved')}
              className={`text-left rounded-xl shadow-sm p-4 transition ${
                offerFilter === 'approved'
                  ? 'bg-green-100 border-2 border-green-500 ring-2 ring-green-200'
                  : 'bg-green-50 border border-green-200 hover:bg-green-100'
              }`}
            >
              <p className={`text-sm ${offerFilter === 'approved' ? 'text-green-800 font-semibold' : 'text-green-700'}`}>Aprobadas</p>
              <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
            </button>
            <button
              onClick={() => handleOfferFilterChange('rejected')}
              className={`text-left rounded-xl shadow-sm p-4 transition ${
                offerFilter === 'rejected'
                  ? 'bg-red-100 border-2 border-red-500 ring-2 ring-red-200'
                  : 'bg-red-50 border border-red-200 hover:bg-red-100'
              }`}
            >
              <p className={`text-sm ${offerFilter === 'rejected' ? 'text-red-800 font-semibold' : 'text-red-700'}`}>Rechazadas</p>
              <p className="text-2xl font-bold text-red-800">{stats.rejected}</p>
            </button>
            <button
              onClick={() => handleOfferFilterChange('closed')}
              className={`text-left rounded-xl shadow-sm p-4 transition ${
                offerFilter === 'closed'
                  ? 'bg-gray-200 border-2 border-gray-500 ring-2 ring-gray-200'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <p className={`text-sm ${offerFilter === 'closed' ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>Cerradas</p>
              <p className="text-2xl font-bold text-gray-700">{stats.closed}</p>
            </button>
          </div>
        )}

        {/* Pending Offers */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {offerFilter === 'all' && `Todas las Ofertas (${pagination.total})`}
                {offerFilter === 'pending' && `Ofertas Pendientes (${pagination.total})`}
                {offerFilter === 'approved' && `Ofertas Aprobadas (${pagination.total})`}
                {offerFilter === 'rejected' && `Ofertas Rechazadas (${pagination.total})`}
                {offerFilter === 'closed' && `Ofertas Cerradas (${pagination.total})`}
              </h2>
              
              {/* Búsqueda */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Buscar por título o empresa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
                  >
                    🔍
                  </button>
                </div>
                {(selectedTags.length > 0 || searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filtros de etiquetas */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600 mb-2">Filtrar por carrera:</p>
            <div className="flex flex-wrap gap-2">
              {CAREER_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    selectedTags.includes(tag)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {selectedTags.includes(tag) && '✓ '}{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Paginación info */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
              <span>
                Página {pagination.page} de {pagination.totalPages} 
                ({pagination.total} ofertas en total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {pendingOffers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">
                {offerFilter === 'all' && '📋'}
                {offerFilter === 'pending' && '✅'}
                {offerFilter === 'approved' && '✅'}
                {offerFilter === 'rejected' && '📋'}
                {offerFilter === 'closed' && '📁'}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {offerFilter === 'all' && 'No hay ofertas registradas'}
                {offerFilter === 'pending' && 'No hay ofertas pendientes'}
                {offerFilter === 'approved' && 'No hay ofertas aprobadas'}
                {offerFilter === 'rejected' && 'No hay ofertas rechazadas'}
                {offerFilter === 'closed' && 'No hay ofertas cerradas'}
              </h3>
              <p className="text-gray-500">
                {offerFilter === 'all' && 'Aún no se han creado ofertas en el sistema.'}
                {offerFilter === 'pending' && 'Todas las ofertas han sido revisadas.'}
                {offerFilter === 'approved' && 'No se ha aprobado ninguna oferta todavía.'}
                {offerFilter === 'rejected' && 'No se ha rechazado ninguna oferta todavía.'}
                {offerFilter === 'closed' && 'No hay ofertas cerradas.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingOffers.map((offer) => (
                <div
                  key={offer.id}
                  className={`p-6 hover:bg-gray-50 transition ${
                    offer.isOverdue ? 'bg-red-50 border-l-4 border-red-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {offer.company?.logoUrl ? (
                          <img
                            src={offer.company.logoUrl}
                            alt={offer.company.legalName}
                            className="h-10 w-10 rounded-lg object-contain bg-gray-100"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                            {offer.company?.legalName?.charAt(0) || 'E'}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{offer.title}</h3>
                          <p className="text-sm text-gray-500">
                            {offer.company?.tradeName || offer.company?.legalName}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          offer.status === 'approved' ? 'bg-green-100 text-green-800' :
                          offer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {offer.status === 'pending' ? '⏳ Pendiente' :
                           offer.status === 'approved' ? '✅ Aprobada' :
                           offer.status === 'rejected' ? '❌ Rechazada' : '📁 Cerrada'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {offer.modality === 'remote' ? 'Remoto' : 
                           offer.modality === 'hybrid' ? 'Híbrido' : 'Presencial'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {offer.area}
                        </span>
                        {offer.duration && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {offer.duration}
                          </span>
                        )}
                      </div>

                      <p className="text-gray-700 text-sm line-clamp-2 mb-2">{offer.description}</p>

                      {offer.isOverdue && (
                        <p className="text-sm text-red-600 font-medium">
                          ⚠️ Pendiente hace {offer.hoursPending}h (más de 48h)
                        </p>
                      )}

                      {offer.status === 'rejected' && offer.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
                          <p className="text-xs text-red-700 font-medium">Motivo de rechazo:</p>
                          <p className="text-xs text-red-600">{offer.rejectionReason}</p>
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-2">
                        Enviada: {new Date(offer.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {offer.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(offer.id)}
                            disabled={processingId === offer.id}
                            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {processingId === offer.id ? 'Procesando...' : 'Aprobar'}
                          </button>
                          <button
                            onClick={() => openRejectModal(offer)}
                            disabled={processingId === offer.id}
                            className="px-4 py-2 bg-white text-red-600 border border-red-300 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      {offer.status === 'approved' && (
                        <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
                          Aprobada
                        </span>
                      )}
                      {offer.status === 'rejected' && (
                        <span className="px-4 py-2 bg-red-100 text-red-800 text-sm font-medium rounded-lg">
                          Rechazada
                        </span>
                      )}
                      {offer.status === 'closed' && (
                        <span className="px-4 py-2 bg-gray-100 text-gray-800 text-sm font-medium rounded-lg">
                          Cerrada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Paginación inferior */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
              <span>
                Página {pagination.page} de {pagination.totalPages} 
                ({pagination.total} ofertas)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  ← Anterior
                </button>
                <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
          </>
        )}

        {activeTab === 'companies' && (
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Gestión de Empresas ({filteredCompanies.length})
              </h2>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Todas las empresas</option>
                <option value="canPublish">Pueden publicar</option>
                <option value="cannotPublish">No pueden publicar</option>
                <option value="verified">Verificadas</option>
                <option value="pending">Pendientes de verificación</option>
              </select>
            </div>

            {filteredCompanies.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay empresas</h3>
                <p className="text-gray-500">No se encontraron empresas con los filtros seleccionados.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredCompanies.map((company) => (
                  <div key={company.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {company.logoUrl ? (
                            <img
                              src={company.logoUrl}
                              alt={company.legalName}
                              className="h-12 w-12 rounded-lg object-contain bg-gray-100"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                              {company.legalName?.charAt(0) || 'E'}
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">{company.legalName}</h3>
                            <p className="text-sm text-gray-500">{company.user?.email}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            company.canPublishOffers
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {company.canPublishOffers ? '✅ Puede publicar' : '❌ No puede publicar'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            company.verificationStatus === 'verified'
                              ? 'bg-blue-100 text-blue-800'
                              : company.verificationStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {company.verificationStatus === 'verified' ? 'Verificada' : 
                             company.verificationStatus === 'pending' ? 'Pendiente' : 'No verificada'}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {company.industry || 'Sin industria'}
                          </span>
                        </div>

                        {company.description && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">{company.description}</p>
                        )}

                        <p className="text-xs text-gray-400">
                          Registrada: {new Date(company.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {company.canPublishOffers ? (
                          <button
                            onClick={() => handleDisablePublishing(company.id)}
                            disabled={processingId === company.id}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {processingId === company.id ? 'Procesando...' : 'Deshabilitar'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnablePublishing(company.id)}
                            disabled={processingId === company.id}
                            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {processingId === company.id ? 'Procesando...' : 'Habilitar'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Reject Modal */}
      {isRejecting && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Rechazar oferta
            </h3>
            <p className="text-gray-600 mb-4">
              <strong>{selectedOffer.title}</strong> de{' '}
              {selectedOffer.company?.tradeName || selectedOffer.company?.legalName}
            </p>

            <form onSubmit={handleReject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo de rechazo <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none"
                  placeholder="Explica por qué esta oferta no cumple con los estándares de la plataforma..."
                  required
                  minLength={10}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 10 caracteres. Este mensaje será enviado a la empresa.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeRejectModal}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processingId === selectedOffer.id || rejectionReason.length < 10}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                >
                  {processingId === selectedOffer.id ? 'Procesando...' : 'Confirmar rechazo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
