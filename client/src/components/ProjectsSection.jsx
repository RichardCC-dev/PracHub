import { useState, useRef, useCallback, useEffect } from 'react';
import CVSuggestion from './CVSuggestion';
import useCVStore from '../store/cvStore';

const normalizeProject = (p) => ({
  title: p.title || '',
  bullets: Array.isArray(p.bullets) ? p.bullets : (p.description ? [p.description] : ['']),
});

const ProjectsSection = ({ section, title, data }) => {
  const { updateSection, requestSectionSuggestion, acceptSectionSuggestion, clearSuggestion, suggestion, isLoading, activeSection } = useCVStore();
  const [projects, setProjects] = useState((data?.items || []).map(normalizeProject));
  const saveTimeoutRef = useRef(null);

  // Sincronizar cuando cambian los datos externos (ej: restaurar versión)
  useEffect(() => {
    setProjects((data?.items || []).map(normalizeProject));
  }, [data]);

  const showSuggestion = activeSection === section && suggestion;

  const debouncedSave = useCallback((items) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateSection(section, { items });
    }, 800);
  }, [section, updateSection]);

  const addProject = () => {
    const updated = [...projects, { title: '', bullets: [''] }];
    setProjects(updated);
  };

  const removeProject = async (index) => {
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
    await updateSection(section, { items: updated });
  };

  const updateProjectTitle = (index, value) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], title: value };
    setProjects(updated);
    debouncedSave(updated);
  };

  const updateBullet = (projIndex, bulletIndex, value) => {
    const updated = [...projects];
    const bullets = [...updated[projIndex].bullets];
    bullets[bulletIndex] = value;
    updated[projIndex] = { ...updated[projIndex], bullets };
    setProjects(updated);
    debouncedSave(updated);
  };

  const addBullet = (projIndex) => {
    const updated = [...projects];
    updated[projIndex] = { ...updated[projIndex], bullets: [...updated[projIndex].bullets, ''] };
    setProjects(updated);
  };

  const removeBullet = async (projIndex, bulletIndex) => {
    const updated = [...projects];
    const bullets = updated[projIndex].bullets.filter((_, i) => i !== bulletIndex);
    updated[projIndex] = { ...updated[projIndex], bullets: bullets.length > 0 ? bullets : [''] };
    setProjects(updated);
    await updateSection(section, { items: updated });
  };

  const handleRequestSectionSuggestion = async () => {
    await requestSectionSuggestion(section);
  };

  const handleAcceptSuggestion = async () => {
    if (suggestion && suggestion.improved?.items) {
      const improved = suggestion.improved.items.map(normalizeProject);
      setProjects(improved);
      clearSuggestion();
      await updateSection(section, { items: improved });
    }
  };

  const handleDiscardSuggestion = () => {
    clearSuggestion();
  };

  const hasContent = projects.some(proj =>
    proj.title.trim() || proj.bullets.some(b => b.trim())
  );

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl shadow-emerald-950/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-950">{title}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addProject}
            className="rounded-2xl border border-emerald-800 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
          >
            + Añadir proyecto
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

      {projects.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No has añadido ningún proyecto.</p>
          <button
            type="button"
            onClick={addProject}
            className="rounded-2xl bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            + Añadir tu primer proyecto
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((proj, projIndex) => (
            <div key={projIndex} className="border border-gray-200 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-gray-800">Proyecto {projIndex + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeProject(projIndex)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Eliminar
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Título del proyecto</label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700"
                    value={proj.title}
                    placeholder="ej. Sistema de gestión de inventario"
                    onChange={(e) => updateProjectTitle(projIndex, e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Detalles del proyecto</label>
                    <button
                      type="button"
                      onClick={() => addBullet(projIndex)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-600"
                    >
                      + Añadir viñeta
                    </button>
                  </div>
                  <div className="space-y-2">
                    {proj.bullets.map((bullet, bulletIndex) => (
                      <div key={bulletIndex} className="flex items-start gap-2">
                        <span className="mt-3.5 text-gray-400 text-xs">•</span>
                        <input
                          type="text"
                          className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
                          value={bullet}
                          placeholder="ej. Desarrollado con React y Node.js"
                          onChange={(e) => updateBullet(projIndex, bulletIndex, e.target.value)}
                        />
                        {proj.bullets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBullet(projIndex, bulletIndex)}
                            className="mt-2 text-gray-400 hover:text-red-500 text-lg leading-none"
                            title="Eliminar viñeta"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
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
        `Proyecto ${index + 1}:\nTítulo: ${item.title}\nDescripción: ${item.description}`
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

export default ProjectsSection;
