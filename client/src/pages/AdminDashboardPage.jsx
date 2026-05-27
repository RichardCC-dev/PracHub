// No existe problema de duplicidad en este archivo.
import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { getPendingOffers, getOfferStats, approveOffer, rejectOffer, getModerationHistory } from '../services/adminApi';

const AdminDashboardPage = () => {
  const { token, user } = useAuthStore();
  const [pendingOffers, setPendingOffers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [offersData, statsData, historyData] = await Promise.all([
        getPendingOffers(token),
        getOfferStats(token),
        getModerationHistory(token),
      ]);
      
      setPendingOffers(offersData.offers || []);
      setStats(statsData.stats || null);
      setHistory(historyData.history || []);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (offerId) => {
    try {
      setProcessingId(offerId);
      const result = await approveOffer(token, offerId);
      
      const approved = pendingOffers.find(o => o.id === offerId);
      setPendingOffers(prev => prev.filter(o => o.id !== offerId));
      if (approved) {
        setHistory(prev => [{ ...approved, status: 'approved', moderated_at: new Date().toISOString() }, ...prev]);
      }
      if (stats) {
        setStats(prev => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }));
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
      
      const rejected = pendingOffers.find(o => o.id === selectedOffer.id);
      setPendingOffers(prev => prev.filter(o => o.id !== selectedOffer.id));
      if (rejected) {
        setHistory(prev => [{ ...rejected, status: 'rejected', rejection_reason: rejectionReason, moderated_at: new Date().toISOString() }, ...prev]);
      }
      if (stats) {
        setStats(prev => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }));
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
            <div className="text-right">
              <p className="text-sm text-gray-600">{user?.email}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Administrador
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl shadow-sm p-4 border border-yellow-200">
              <p className="text-sm text-yellow-700">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
              {stats.overdue > 0 && (
                <p className="text-xs text-red-600 mt-1">{stats.overdue} &gt;48h</p>
              )}
            </div>
            <div className="bg-green-50 rounded-xl shadow-sm p-4 border border-green-200">
              <p className="text-sm text-green-700">Aprobadas</p>
              <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
            </div>
            <div className="bg-red-50 rounded-xl shadow-sm p-4 border border-red-200">
              <p className="text-sm text-red-700">Rechazadas</p>
              <p className="text-2xl font-bold text-red-800">{stats.rejected}</p>
            </div>
            <div className="bg-gray-50 rounded-xl shadow-sm p-4 border border-gray-200">
              <p className="text-sm text-gray-500">Cerradas</p>
              <p className="text-2xl font-bold text-gray-700">{stats.closed}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="px-6 pt-4 border-b border-gray-200">
            <div className="flex gap-1">
              {[
                { id: 'pending',  label: 'Pendientes', count: pendingOffers.length,                                   color: 'text-yellow-700' },
                { id: 'approved', label: 'Aprobadas',  count: history.filter(o => o.status === 'approved').length,    color: 'text-green-700'  },
                { id: 'rejected', label: 'Rechazadas', count: history.filter(o => o.status === 'rejected').length,    color: 'text-red-700'    },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 text-xs font-semibold ${activeTab === tab.id ? tab.color : 'text-gray-400'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab: Pendientes */}
          {activeTab === 'pending' && (
            pendingOffers.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ofertas pendientes</h3>
                <p className="text-gray-500">Todas las ofertas han sido revisadas.</p>
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
                            <img src={offer.company.logoUrl} alt={offer.company.legalName} className="h-10 w-10 rounded-lg object-contain bg-gray-100" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                              {offer.company?.legalName?.charAt(0) || 'E'}
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">{offer.title}</h3>
                            <p className="text-sm text-gray-500">{offer.company?.tradeName || offer.company?.legalName}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {offer.modality === 'remote' ? 'Remoto' : offer.modality === 'hybrid' ? 'Híbrido' : 'Presencial'}
                          </span>
                          {offer.area && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{offer.area}</span>}
                          {offer.duration && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{offer.duration}</span>}
                        </div>
                        <p className="text-gray-700 text-sm line-clamp-2 mb-2">{offer.description}</p>
                        {offer.isOverdue && (
                          <p className="text-sm text-red-600 font-medium">⚠️ Pendiente hace {offer.hoursPending}h (más de 48h)</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Enviada: {new Date(offer.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => handleApprove(offer.id)}
                          disabled={processingId === offer.id}
                          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
                        >
                          {processingId === offer.id ? 'Procesando...' : 'Aprobar'}
                        </button>
                        <button
                          onClick={() => openRejectModal(offer)}
                          disabled={processingId === offer.id}
                          className="px-4 py-2 bg-white text-red-600 border border-red-300 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 transition"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Tab: Aprobadas */}
          {activeTab === 'approved' && (
            history.filter(o => o.status === 'approved').length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ofertas aprobadas aún</h3>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {history.filter(o => o.status === 'approved').map(offer => (
                  <div key={offer.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700 font-bold">
                            {offer.company?.legalName?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{offer.title}</h3>
                            <p className="text-sm text-gray-500">{offer.company?.tradeName || offer.company?.legalName}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ Aprobada</span>
                          {offer.area && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{offer.area}</span>}
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {offer.modality === 'remote' ? 'Remoto' : offer.modality === 'hybrid' ? 'Híbrido' : 'Presencial'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Aprobada: {offer.moderated_at ? new Date(offer.moderated_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Tab: Rechazadas */}
          {activeTab === 'rejected' && (
            history.filter(o => o.status === 'rejected').length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ofertas rechazadas</h3>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {history.filter(o => o.status === 'rejected').map(offer => (
                  <div key={offer.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center text-red-700 font-bold">
                            {offer.company?.legalName?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{offer.title}</h3>
                            <p className="text-sm text-gray-500">{offer.company?.tradeName || offer.company?.legalName}</p>
                          </div>
                        </div>
                        {(offer.rejection_reason || offer.rejectionReason) && (
                          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-2">
                            <p className="text-xs font-medium text-red-700">Motivo:</p>
                            <p className="text-xs text-red-600 mt-0.5">{offer.rejection_reason || offer.rejectionReason}</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400">
                          Rechazada: {offer.moderated_at ? new Date(offer.moderated_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
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
