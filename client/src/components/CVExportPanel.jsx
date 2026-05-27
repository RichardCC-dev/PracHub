import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useCVStore from '../store/cvStore';

const templates = [
  {
    id: 'harvard',
    name: 'Harvard',
    description: 'Formato académico clásico, sobrio y altamente legible para prácticas profesionales.',
  },
  {
    id: 'investment-banking',
    name: 'Investment Banking Resume',
    description: 'Formato compacto orientado a banca, consultoría y finanzas, con secciones de alto impacto.',
  },
];

const CVExportPanel = () => {
  const { exportPdf, isExporting, exportError, setSelectedTemplate } = useCVStore();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { template: 'harvard' },
  });
  const selectedTemplate = watch('template');

  useEffect(() => {
    setSelectedTemplate(selectedTemplate);
  }, [selectedTemplate, setSelectedTemplate]);

  const onSubmit = async ({ template }) => {
    await exportPdf(template);
  };

  return (
    <section className="mb-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Exportación PDF</p>
          <h2 className="mt-2 text-xl font-bold text-gray-950">Elige una plantilla para descargar tu CV</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Solo están habilitados los formatos Harvard e Investment Banking Resume para mantener consistencia con el alcance definido.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">PDF seguro desde backend</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => {
            const isSelected = selectedTemplate === template.id;
            return (
              <label
                key={template.id}
                className={`cursor-pointer rounded-2xl border p-4 transition ${isSelected ? 'border-emerald-700 bg-emerald-50 ring-2 ring-emerald-100' : 'border-gray-200 bg-white hover:border-emerald-200'}`}
              >
                <input
                  type="radio"
                  value={template.id}
                  className="sr-only"
                  {...register('template', { required: 'Selecciona una plantilla.' })}
                />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-950">{template.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{template.description}</p>
                  </div>
                  <span className={`mt-1 h-4 w-4 rounded-full border ${isSelected ? 'border-emerald-700 bg-emerald-700' : 'border-gray-300'}`} />
                </div>
              </label>
            );
          })}
        </div>

        {errors.template && <p className="text-sm font-medium text-red-600">{errors.template.message}</p>}
        {exportError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{exportError}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">El archivo incluirá tu nombre y la fecha de generación.</p>
          <button
            type="submit"
            disabled={isExporting}
            className="rounded-2xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExporting ? 'Generando PDF...' : 'Descargar PDF'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CVExportPanel;
