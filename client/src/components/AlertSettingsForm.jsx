import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAlertStore from '../store/alertStore';

const FREQUENCY_OPTIONS = [
  { value: 'immediate', label: 'Inmediata', description: 'Recibe alertas tan pronto se publique una oferta compatible' },
  { value: 'daily', label: 'Diaria', description: 'Recibe un resumen diario con todas las ofertas del día' },
  { value: 'weekly', label: 'Semanal', description: 'Recibe un resumen semanal los lunes' },
];

const WEEKDAY_OPTIONS = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

export default function AlertSettingsForm() {
  const { settings, isLoading, isUpdating, error, fetchSettings, updateSettings, clearError } = useAlertStore();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      frequency: 'immediate',
      emailEnabled: true,
      platformEnabled: true,
      dailyDigestTime: '09:00',
      weeklyDigestDay: 'monday',
    },
  });

  const frequency = watch('frequency');

  // Cargar configuración inicial
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Actualizar formulario cuando lleguen los datos
  useEffect(() => {
    if (settings) {
      reset({
        frequency: settings.frequency,
        emailEnabled: settings.emailEnabled,
        platformEnabled: settings.platformEnabled,
        dailyDigestTime: settings.dailyDigestTime?.slice(0, 5) || '09:00',
        weeklyDigestDay: settings.weeklyDigestDay || 'monday',
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data) => {
    try {
      clearError();
      setSaveSuccess(false);

      // Convertir tiempo a formato HH:MM:SS
      const payload = {
        ...data,
        dailyDigestTime: data.dailyDigestTime ? `${data.dailyDigestTime}:00` : undefined,
      };

      await updateSettings(payload);
      setSaveSuccess(true);

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error guardando configuración:', err);
    }
  };

  if (isLoading && !settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Configuración de Alertas</h2>
        <p className="mt-1 text-sm text-gray-500">
          Personaliza cómo y cuándo recibir notificaciones sobre ofertas compatibles
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* Frecuencia de alertas */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Frecuencia de alertas
          </label>
          <div className="space-y-3">
            {FREQUENCY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  frequency === option.value
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-200'
                }`}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register('frequency')}
                  className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">
                    {option.label}
                  </span>
                  <span className="block text-sm text-gray-500 mt-1">
                    {option.description}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Opciones adicionales para digest */}
        {frequency === 'daily' && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora del resumen diario
            </label>
            <input
              type="time"
              {...register('dailyDigestTime')}
              className="block w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        )}

        {frequency === 'weekly' && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Día del resumen semanal
              </label>
              <select
                {...register('weeklyDigestDay')}
                className="block w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              >
                {WEEKDAY_OPTIONS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Canales de notificación */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Canales de notificación
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('emailEnabled')}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">
                Recibir alertas por correo electrónico
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('platformEnabled')}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">
                Recibir alertas en la plataforma
              </span>
            </label>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Éxito */}
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg">
            Configuración guardada exitosamente
          </div>
        )}

        {/* Botón guardar */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isUpdating}
            className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Guardando...
              </span>
            ) : (
              'Guardar configuración'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
