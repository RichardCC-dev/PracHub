import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import CompanyProfileForm from '../components/CompanyProfileForm';
import { getCompanyProfile } from '../services/api';

const CompanyProfilePage = ({ onBack }) => {
  const { user, token, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return;
      
      try {
        const data = await getCompanyProfile(token);
        if (data.user) {
          setUser(data.user);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token, setUser]);

  const handleUpdate = (updatedData) => {
    if (updatedData.user) {
      setUser(updatedData.user);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-emerald-800 px-5 py-2 text-white hover:bg-emerald-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const company = user?.companyProfile;

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No se encontró información de la empresa</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-emerald-700 transition"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-950">Perfil de empresa</h1>
          <p className="text-gray-600 mt-2">
            Personaliza tu perfil para atraer los mejores candidatos
          </p>
        </div>

        {/* Company Info Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.legalName}
                className="h-16 w-16 rounded-xl object-contain bg-gray-50"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl">
                {company.legalName?.charAt(0) || 'E'}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-950">
                {company.tradeName || company.legalName}
              </h2>
              <p className="text-sm text-gray-500">{company.industry}</p>
            </div>
          </div>

          {/* Verification Status */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Estado de verificación:</span>
            {company.isVerified ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Verificada
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pendiente
              </span>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-950 mb-6">
            Editar información
          </h3>
          <CompanyProfileForm
            company={company}
            token={token}
            onUpdate={handleUpdate}
          />
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-950 mb-4">
            Vista previa del perfil
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Así verán los estudiantes tu empresa en las ofertas
          </p>
          
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex items-start gap-4">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt=""
                  className="h-12 w-12 rounded-lg object-contain bg-white"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  {company.legalName?.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-950">
                  {company.tradeName || company.legalName}
                </h4>
                {company.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {company.description}
                  </p>
                )}
                {company.cultureTags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {company.cultureTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfilePage;
