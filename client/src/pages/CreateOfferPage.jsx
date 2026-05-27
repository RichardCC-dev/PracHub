import { useState } from 'react';
import useAuthStore from '../store/authStore';
import { createOffer, updateOffer } from '../services/offerApi';

const AREAS = [
  'Tecnología', 'Marketing', 'Finanzas', 'Recursos Humanos', 'Operaciones',
  'Contabilidad', 'Derecho', 'Diseño', 'Comunicaciones', 'Administración',
  'Ingeniería', 'Logística', 'Ventas', 'Otro',
];

const CAREERS = [
  'Ingeniería de Software', 'Sistemas de Información', 'Ingeniería Industrial',
  'Administración', 'Marketing', 'Contabilidad', 'Economía', 'Derecho',
  'Psicología', 'Comunicaciones', 'Diseño Gráfico', 'Arquitectura',
];

const CreateOfferPage = ({ onBack, onSuccess, editOffer = null }) => {
  const { token } = useAuthStore();
  const isEditing = !!editOffer;

  const [form, setForm] = useState({
    title: editOffer?.title || '',
    description: editOffer?.description || '',
    requirements: editOffer?.requirements || '',
    area: editOffer?.area || '',
    modality: editOffer?.modality || 'in_person',
    duration: editOffer?.duration || '',
    compensation: editOffer?.compensation || '',
    careerTags: editOffer?.careerTags || [],
    expiresAt: editOffer?.expiresAt ? editOffer.expiresAt.split('T')[0] : '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCareerToggle = (career) => {
    setForm(prev => {
      const current = prev.careerTags || [];
      if (current.includes(career)) {
        return { ...prev, careerTags: current.filter(c => c !== career) };
      }
      if (current.length >= 5) return prev;
      return { ...prev, careerTags: [...current, career] };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'El título es requerido.';
    if (!form.description.trim()) newErrors.description = 'La descripción es requerida.';
    if (form.description.trim().length < 20) newErrors.description = 'Mínimo 20 caracteres.';
    if (!form.area) newErrors.area = 'El área es requerida.';
    if (!form.modality) newErrors.modality = 'La modalidad es requerida.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      ...form,
      expiresAt: form.expiresAt || null,
    };

    try {
      setLoading(true);
      setSubmitError(null);

      if (isEditing) {
        await updateOffer(token, editOffer.id, payload);
      } else {
        await createOffer(token, payload);
      }

      onSuccess?.();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-800 transition"
          >
            ← Volver
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Editar oferta' : 'Nueva oferta de práctica'}
            </h1>
            <p className="text-sm text-gray-500">
              {isEditing
                ? 'Los cambios vuelven a enviar la oferta a revisión.'
                : 'La oferta quedará pendiente de aprobación por el administrador.'}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Información básica</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del puesto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none ${errors.title ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="ej. Practicante de Desarrollo Web"
                  maxLength={200}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Área <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    className={`w-full rounded-xl border px-4 py-3 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none ${errors.area ? 'border-red-400' : 'border-gray-300'}`}
                  >
                    <option value="">Seleccionar área</option>
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modalidad <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="modality"
                    value={form.modality}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  >
                    <option value="in_person">Presencial</option>
                    <option value="remote">Remoto</option>
                    <option value="hybrid">Híbrido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
                  <input
                    type="text"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    placeholder="ej. 3 meses, 6 meses"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Compensación</label>
                  <input
                    type="text"
                    name="compensation"
                    value={form.compensation}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    placeholder="ej. S/ 1,200 mensual"
                    maxLength={100}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite de postulación</label>
                <input
                  type="date"
                  name="expiresAt"
                  value={form.expiresAt}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Descripción y requisitos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Detalle de la oferta</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full rounded-xl border px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="Describe el rol, responsabilidades y el equipo con el que trabajará el practicante..."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requisitos</label>
                <textarea
                  name="requirements"
                  value={form.requirements}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none"
                  placeholder="Conocimientos, habilidades o herramientas requeridas..."
                />
              </div>
            </div>
          </div>

          {/* Carreras afines */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Carreras afines</h2>
            <p className="text-sm text-gray-500 mb-4">Selecciona hasta 5 carreras relacionadas con esta práctica.</p>

            <div className="flex flex-wrap gap-2">
              {CAREERS.map(career => {
                const selected = form.careerTags.includes(career);
                return (
                  <button
                    key={career}
                    type="button"
                    onClick={() => handleCareerToggle(career)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      selected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {career}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">{form.careerTags.length}/5 seleccionadas</p>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
              {submitError}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-700 text-white font-semibold rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition"
            >
              {loading
                ? 'Enviando...'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Publicar oferta'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateOfferPage;
