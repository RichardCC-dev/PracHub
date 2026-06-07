import { ArrowLeft, Bell, History, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AlertSettingsForm from '../components/AlertSettingsForm';

const AlertSettingsPage = () => {
  const navigate = useNavigate();

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
              <h1 className="text-xl font-semibold text-gray-900">Configuración de Alertas</h1>
              <p className="text-sm text-gray-500">Personaliza cómo recibir notificaciones de ofertas compatibles</p>
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
              className="flex items-center gap-2 px-1 py-3 border-b-2 border-emerald-500 text-emerald-700 font-medium"
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
        <AlertSettingsForm />
      </div>
    </main>
  );
};

export default AlertSettingsPage;
