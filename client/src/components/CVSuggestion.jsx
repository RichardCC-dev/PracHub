const CVSuggestion = ({ original, improved, onAccept, onDiscard }) => {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
      <p className="text-xs font-semibold text-emerald-800">Sugerencia de IA:</p>
      <div className="space-y-2 text-sm">
        <div>
          <p className="font-medium text-gray-700">Original:</p>
          <p className="text-gray-600">{original}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Mejorado:</p>
          <p className="text-gray-900">{improved}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onAccept}
          className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
        >
          Aceptar
        </button>
        <button
          onClick={onDiscard}
          className="rounded-xl border border-emerald-800 px-4 py-2 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-50"
        >
          Descartar
        </button>
      </div>
    </div>
  );
};

export default CVSuggestion;
