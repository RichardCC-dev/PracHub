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
  const { exportPdf, isExporting, exportError, setSelectedTemplate, fetchVersions } = useCVStore();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { template: 'harvard' },
  });
  const selectedTemplate = watch('template');

  useEffect(() => {
    setSelectedTemplate(selectedTemplate);
  }, [selectedTemplate, setSelectedTemplate]);

  const onSubmit = async ({ template }) => {
    await exportPdf(template);
    await fetchVersions();
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Exportar PDF</p>
          <h2 className="mt-0.5 text-base font-bold text-gray-950">Elige una plantilla</h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">PDF seguro</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid gap-2 grid-cols-2">
          {templates.map((template) => {
            const isSelected = selectedTemplate === template.id;
            return (
              <label
                key={template.id}
                className={`cursor-pointer rounded-xl border p-3 transition ${isSelected ? 'border-emerald-700 bg-emerald-50 ring-1 ring-emerald-200' : 'border-gray-200 bg-white hover:border-emerald-200'}`}
              >
                <input
                  type="radio"
                  value={template.id}
                  className="sr-only"
                  {...register('template', { required: 'Selecciona una plantilla.' })}
                />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-gray-950 leading-tight">{template.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500 leading-snug">{template.description}</p>
                  </div>
                  <span className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border ${isSelected ? 'border-emerald-700 bg-emerald-700' : 'border-gray-300'}`} />
                </div>
              </label>
            );
          })}
        </div>

        {errors.template && <p className="text-xs font-medium text-red-600">{errors.template.message}</p>}
        {exportError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{exportError}</p>}

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400">Incluirá tu nombre y fecha.</p>
          <button
            type="submit"
            disabled={isExporting}
            className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExporting ? 'Generando...' : 'Descargar PDF'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CVExportPanel;
