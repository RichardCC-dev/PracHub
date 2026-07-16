// Convierte un texto multilinea en bloques visuales legibles.
// Cada línea no vacía se renderiza como una línea independiente,
// y las líneas que empiezan con "•" o "-" se indentan como viñetas.
const renderFormattedText = (text) => {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1.5" />;

        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
        const isLabel = trimmed.includes(':') && !isBullet && trimmed.indexOf(':') < 40;

        if (isBullet) {
          const content = trimmed.replace(/^[•-]\s*/, '');
          return (
            <div key={idx} className="flex gap-2 pl-3">
              <span className="mt-0.5 shrink-0 text-gray-400">•</span>
              <span>{content}</span>
            </div>
          );
        }

        if (isLabel) {
          const colonIdx = trimmed.indexOf(':');
          const label = trimmed.slice(0, colonIdx);
          const value = trimmed.slice(colonIdx + 1).trim();
          return (
            <div key={idx} className="leading-relaxed">
              <span className="font-semibold text-gray-700">{label}:</span>{value && ' '}
              <span>{value}</span>
            </div>
          );
        }

        return <p key={idx} className="leading-relaxed">{trimmed}</p>;
      })}
    </div>
  );
};

const CVSuggestion = ({ original, improved, onAccept, onDiscard }) => {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-4">
      <p className="text-xs font-semibold text-emerald-800">Sugerencia de IA:</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white/60 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Original</p>
          <div className="text-sm text-gray-600">
            {renderFormattedText(original)}
          </div>
        </div>
        <div className="rounded-xl bg-white p-3 ring-1 ring-emerald-300">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">Mejorado</p>
          <div className="text-sm text-gray-900">
            {renderFormattedText(improved)}
          </div>
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
