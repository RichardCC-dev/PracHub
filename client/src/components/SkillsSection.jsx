import { useState, useRef, useCallback } from 'react';
import useCVStore from '../store/cvStore';

const normalizeSkills = (data) => {
  const areas = Array.isArray(data?.areas)
    ? data.areas
    : data?.technical
    ? [{ area: '', skills: data.technical }]
    : [{ area: '', skills: '' }];
  return { areas, soft: data?.soft || '' };
};

const SkillsSection = ({ section, title, data }) => {
  const { updateSection, isLoading } = useCVStore();
  const [skills, setSkills] = useState(() => normalizeSkills(data));
  const saveTimeoutRef = useRef(null);

  const debouncedSave = useCallback((state) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateSection(section, state);
    }, 800);
  }, [section, updateSection]);

  const updateArea = (index, field, value) => {
    const areas = [...skills.areas];
    areas[index] = { ...areas[index], [field]: value };
    const updated = { ...skills, areas };
    setSkills(updated);
    debouncedSave(updated);
  };

  const addArea = () => {
    const updated = { ...skills, areas: [...skills.areas, { area: '', skills: '' }] };
    setSkills(updated);
  };

  const removeArea = async (index) => {
    const areas = skills.areas.filter((_, i) => i !== index);
    const updated = { ...skills, areas: areas.length > 0 ? areas : [{ area: '', skills: '' }] };
    setSkills(updated);
    await updateSection(section, updated);
  };

  const updateSoft = (value) => {
    const updated = { ...skills, soft: value };
    setSkills(updated);
    debouncedSave(updated);
  };

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl shadow-emerald-950/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-950">{title}</h2>
        <button
          type="button"
          onClick={addArea}
          className="rounded-2xl border border-emerald-800 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
        >
          + Añadir área técnica
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3">Habilidades técnicas</p>
          <div className="space-y-3">
            {skills.areas.map((entry, index) => (
              <div key={index} className="border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Área {index + 1}</span>
                  {skills.areas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArea(index)}
                      className="text-red-500 hover:text-red-600 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nombre del área</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
                      value={entry.area}
                      placeholder="ej. Lenguajes de programación, Bases de datos, Cloud..."
                      onChange={(e) => updateArea(index, 'area', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Habilidades</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
                      value={entry.skills}
                      placeholder="ej. Python, JavaScript, Java"
                      onChange={(e) => updateArea(index, 'skills', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-800 block mb-2">Habilidades blandas</label>
          <textarea
            rows={3}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-700 resize-none"
            value={skills.soft}
            placeholder="ej. Trabajo en equipo, comunicación efectiva, liderazgo..."
            onChange={(e) => updateSoft(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default SkillsSection;
