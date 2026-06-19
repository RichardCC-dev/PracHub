/**
 * StatCard — métrica destacada en una caja redondeada con el número en negrita.
 * Usada en los dashboards y el home para resaltar números importantes.
 */
const ACCENTS = {
  emerald: { box: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-700', value: 'text-emerald-700' },
  blue: { box: 'bg-blue-50', icon: 'bg-blue-100 text-blue-700', value: 'text-blue-700' },
  amber: { box: 'bg-amber-50', icon: 'bg-amber-100 text-amber-700', value: 'text-amber-700' },
  violet: { box: 'bg-violet-50', icon: 'bg-violet-100 text-violet-700', value: 'text-violet-700' },
  gray: { box: 'bg-gray-50', icon: 'bg-gray-100 text-gray-700', value: 'text-gray-900' },
};

const StatCard = ({ label, value, icon: Icon, accent = 'emerald', hint, onClick }) => {
  const a = ACCENTS[accent] || ACCENTS.emerald;
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border border-gray-100 ${a.box} p-4 text-left shadow-sm ${
        onClick ? 'transition hover:shadow-md hover:-translate-y-0.5 cursor-pointer w-full' : ''
      }`}
    >
      {Icon && (
        <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${a.icon}`}>
          <Icon className="h-5 w-5" />
        </span>
      )}
      <div className="min-w-0">
        <p className={`text-2xl font-extrabold leading-none ${a.value}`}>{value}</p>
        <p className="mt-1 text-xs font-medium text-gray-500 truncate">{label}</p>
        {hint && <p className="mt-0.5 text-[11px] text-gray-400 truncate">{hint}</p>}
      </div>
    </Tag>
  );
};

export default StatCard;
