import { Users, TrendingUp } from 'lucide-react';

/**
 * Componente de tarjeta para mostrar una métrica principal.
 * Se usa para total de seguidores, universidades únicas, carreras únicas, etc.
 */
const MetricsCard = ({ 
  icon: Icon = Users,
  title, 
  value, 
  subtitle, 
  trend,
  accent = 'emerald' 
}) => {
  const accentColors = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
  };

  const accentDark = {
    emerald: 'bg-emerald-100 text-emerald-700',
    purple: 'bg-purple-100 text-purple-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className={`rounded-2xl border-2 p-6 shadow-sm transition hover:shadow-md ${accentColors[accent]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
          {subtitle && <p className="text-xs text-gray-600 mt-2">{subtitle}</p>}
        </div>
        <div className={`rounded-xl p-3 ${accentDark[accent]}`}>
          <Icon size={24} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-700">
          <TrendingUp size={14} />
          {trend}
        </div>
      )}
    </div>
  );
};

export default MetricsCard;
