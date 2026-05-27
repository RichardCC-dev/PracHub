import { useState, useRef, useCallback, useEffect } from 'react';
import useCVStore from '../store/cvStore';

const CertificationsSection = ({ section, title, data }) => {
  const { updateSection } = useCVStore();
  const [certifications, setCertifications] = useState(data?.items || []);

  const saveTimeoutRef = useRef(null);

  // Sincronizar cuando cambian los datos externos (ej: restaurar versión)
  useEffect(() => {
    setCertifications(data?.items || []);
  }, [data]);

  const debouncedSave = useCallback((items) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateSection(section, { items });
    }, 800);
  }, [section, updateSection]);

  const addCertification = () => {
    const updated = [...certifications, { name: '', issuer: '', date: '' }];
    setCertifications(updated);
  };

  const removeCertification = async (index) => {
    const updated = certifications.filter((_, i) => i !== index);
    setCertifications(updated);
    await updateSection(section, { items: updated });
  };

  const updateCertification = (index, field, value) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
    debouncedSave(updated);
  };

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl shadow-emerald-950/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-950">{title}</h2>
        <button
          type="button"
          onClick={addCertification}
          className="rounded-2xl border border-emerald-800 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
        >
          + Añadir certificación
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No has añadido ninguna certificación.</p>
          <button
            type="button"
            onClick={addCertification}
            className="rounded-2xl bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            + Añadir tu primera certificación
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {certifications.map((cert, index) => (
            <div key={index} className="border border-gray-200 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-950">Certificación {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeCertification(index)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Eliminar
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nombre del certificado</label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700"
                    value={cert.name}
                    onChange={(e) => updateCertification(index, 'name', e.target.value)}
                    placeholder="ej. AWS Cloud Practitioner"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Entidad emisora</label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700"
                    value={cert.issuer}
                    onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                    placeholder="ej. Amazon Web Services"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha de obtención</label>
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700"
                    value={cert.date}
                    onChange={(e) => updateCertification(index, 'date', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificationsSection;
