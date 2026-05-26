const CVProgressBar = ({ completion }) => {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl shadow-emerald-950/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-950">Completitud del CV</h3>
        <span className="text-sm font-semibold text-emerald-800">{completion}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-emerald-800 h-full rounded-full transition-all duration-500"
          style={{ width: `${completion}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-gray-600">
        {completion === 100
          ? '¡Tu CV está completo!'
          : `Completa más secciones para mejorar tu perfil.`}
      </p>
    </div>
  );
};

export default CVProgressBar;
