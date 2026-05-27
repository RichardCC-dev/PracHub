import { useState } from 'react';
import { useForm } from 'react-hook-form';
import CVSuggestion from './CVSuggestion';
import useCVStore from '../store/cvStore';

const ProjectsSection = ({ section, title, data }) => {
  const { updateSection, requestSectionSuggestion, acceptSectionSuggestion, clearSuggestion, suggestion, isLoading, activeSection } = useCVStore();
  const [projects, setProjects] = useState(data?.items || []);
  const { handleSubmit } = useForm();

  const showSuggestion = activeSection === section && suggestion;

  const onSubmit = async (values) => {
    const updatedData = { items: projects };
    await updateSection(section, updatedData);
  };

  const addProject = () => {
    setProjects([...projects, { title: '', description: '' }]);
  };

  const removeProject = async (index) => {
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
    // Usar los datos actualizados directamente
    await updateSection(section, { items: updated });
  };

  const updateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
    handleSubmit(onSubmit)();
  };

  const handleRequestSectionSuggestion = async () => {
    await requestSectionSuggestion(section);
  };

  const handleAcceptSuggestion = async () => {
    if (suggestion && suggestion.improved?.items) {
      const improvedItems = suggestion.improved.items;
      setProjects(improvedItems);
      // El store ya guarda automáticamente al aceptar
      await acceptSectionSuggestion(section);
    }
  };

  const handleDiscardSuggestion = () => {
    clearSuggestion();
  };

  const hasContent = projects.some(proj => 
    proj.title.trim() || proj.description.trim()
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
          {projects.map((proj, index) => (
            <div key={index} className="border border-gray-200 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-950">Proyecto {index + 1}</h3>
                <button
                    type="button"
                    onClick={() => removeProject(index)}
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
                    onChange={(e) => updateProject(index, 'title', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700 resize-none"
                    rows={3}
                    value={proj.description}
                    onChange={(e) => updateProject(index, 'description', e.target.value)}
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
