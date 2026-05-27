import { useState, useRef, useCallback, useEffect } from 'react';
import CVSuggestion from './CVSuggestion';
import useCVStore from '../store/cvStore';

const ExperienceSection = ({ section, title, data }) => {
  const { updateSection, requestSectionSuggestion, acceptSectionSuggestion, clearSuggestion, suggestion, isLoading, activeSection } = useCVStore();
  const [experiences, setExperiences] = useState(data?.items || []);
  const saveTimeoutRef = useRef(null);

  // Sincronizar cuando cambian los datos externos (ej: restaurar versión)
  useEffect(() => {
    setExperiences(data?.items || []);
  }, [data]);

  const showSuggestion = activeSection === section && suggestion;

  const debouncedSave = useCallback((items) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateSection(section, { items });
    }, 800);
  }, [section, updateSection]);

  const addExperience = () => {
    setExperiences([...experiences, { company: '', role: '', description: '' }]);
  };

  const removeExperience = async (index) => {
    const updated = experiences.filter((_, i) => i !== index);
    setExperiences(updated);
    await updateSection(section, { items: updated });
  };

  const updateExperience = (index, field, value) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
    debouncedSave(updated);
  };

  const handleRequestSectionSuggestion = async () => {
    await requestSectionSuggestion(section);
  };

  const handleAcceptSuggestion = async () => {
    if (suggestion && suggestion.improved?.items) {
      const improved = suggestion.improved.items;
      setExperiences(improved);
      clearSuggestion();
      await updateSection(section, { items: improved });
    }
  };

  const handleDiscardSuggestion = () => {
    clearSuggestion();
  };

  const hasContent = experiences.some(exp => 
    exp.company.trim() || exp.role.trim() || exp.description.trim()
  );

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl shadow-emerald-950/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-950">{title}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addExperience}
            className="rounded-2xl border border-emerald-800 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
          >
            + Añadir experiencia
          </button>
          {hasContent && (
            <button
              type="button"
              onClick={handleRequestSectionSuggestion}
              disabled={isLoading}
              className="rounded-2xl border border-emerald-800 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50 disabled:opacity-50"
            >
              {isLoading ? '...IA' : 'Mejorar sección con IA'}
            </button>
          )}
        </div>
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No has añadido ninguna experiencia laboral.</p>
          <button
            type="button"
            onClick={addExperience}
            className="rounded-2xl bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            + Añadir tu primera experiencia
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <div key={index} className="border border-gray-200 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-950">Experiencia {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Eliminar
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Empresa</label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700"
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Rol</label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700"
                    value={exp.role}
                    onChange={(e) => updateExperience(index, 'role', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700 resize-none"
                    rows={3}
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSuggestion && (
        <div className="mt-6">
          <CVSuggestion
            original={formatSuggestionText(suggestion.original)}
            improved={formatSuggestionText(suggestion.improved)}
            onAccept={handleAcceptSuggestion}
            onDiscard={handleDiscardSuggestion}
          />
        </div>
      )}
    </div>
  );
};

const formatSuggestionText = (data) => {
  if (typeof data === 'string') return data;
  if (typeof data === 'object' && data !== null) {
    if (data.items && Array.isArray(data.items)) {
      return data.items.map((item, index) => 
        `Experiencia ${index + 1}:\nEmpresa: ${item.company}\n\nRol: ${item.role}\n\nDescripción: ${item.description}`
      ).join('\n\n');
    }
    const fieldLabels = {
      company: 'Empresa',
      role: 'Rol',
      description: 'Descripción',
      technical: 'Habilidades técnicas',
      soft: 'Habilidades blandas',
      list: 'Idiomas',
      title: 'Título del proyecto',
    };
    return Object.entries(data)
      .map(([key, value]) => `${fieldLabels[key] || key}: ${value}`)
      .join('\n\n');
  }
  return String(data);
};

export default ExperienceSection;
