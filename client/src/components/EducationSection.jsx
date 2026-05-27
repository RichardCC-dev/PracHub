import { useState, useRef, useCallback } from 'react';
import useCVStore from '../store/cvStore';

const EducationSection = ({ section, title, data }) => {
  const { updateSection, isSaving } = useCVStore();
  const [entries, setEntries] = useState(
    data?.items?.length > 0
      ? data.items
      : [{ degree: '', institution: '', startDate: '', endDate: '', courses: '' }]
  );
  const saveTimeoutRef = useRef(null);

  const debouncedSave = useCallback((items) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateSection(section, { items });
    }, 800);
  }, [section, updateSection]);

  const addEntry = () => {
    const updated = [...entries, { degree: '', institution: '', startDate: '', endDate: '', courses: '' }];
    setEntries(updated);
  };

  const removeEntry = async (index) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
    await updateSection(section, { items: updated });
  };

  const updateEntry = (index, field, value) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
    debouncedSave(updated);
  };

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl shadow-emerald-950/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-950">{title}</h2>
        <button
          type="button"
          onClick={addEntry}
          className="rounded-2xl border border-emerald-800 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
        >
          + Añadir formación
        </button>
      </div>

      <div className="space-y-6">
        {entries.map((entry, index) => (
          <div key={index} className="border border-gray-200 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-800">
                Formación {index + 1}
              </h3>
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEntry(index)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Eliminar
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Título / Grado</label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700"
                  value={entry.degree}
                  placeholder="ej. Ingeniería de Sistemas"
                  onChange={(e) => updateEntry(index, 'degree', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Institución</label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700"
                  value={entry.institution}
                  placeholder="ej. Universidad Nacional Mayor de San Marcos"
                  onChange={(e) => updateEntry(index, 'institution', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha de inicio</label>
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700"
                    value={entry.startDate}
                    onChange={(e) => updateEntry(index, 'startDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha de fin</label>
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700"
                    value={entry.endDate}
                    onChange={(e) => updateEntry(index, 'endDate', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Cursos relevantes</label>
                <textarea
                  rows={2}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700 resize-none"
                  value={entry.courses}
                  placeholder="ej. Python para ciencia de datos, Gestión de proyectos..."
                  onChange={(e) => updateEntry(index, 'courses', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationSection;
