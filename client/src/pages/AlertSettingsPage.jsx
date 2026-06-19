import { Bell, History } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import AlertSettingsForm from '../components/AlertSettingsForm';

const AlertSettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHistory = location.pathname === '/alert-history';

  return (
    <main className="min-h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Configuración de Alertas</h1>
          <p className="text-sm text-gray-500">Personaliza cómo recibir notificaciones de ofertas compatibles</p>
        </div>
      </header>

      {/* Navegación secundaria (sin "Empresas que sigo") */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex gap-6">
            <button
              onClick={() => navigate('/alert-settings')}
              className={`flex items-center gap-2 px-1 py-3 border-b-2 font-medium ${
                !isHistory ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Bell className="w-4 h-4" />
              Configuración
            </button>
            <button
              onClick={() => navigate('/alert-history')}
              className={`flex items-center gap-2 px-1 py-3 border-b-2 font-medium ${
                isHistory ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
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
