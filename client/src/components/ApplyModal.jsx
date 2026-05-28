import { useState, useEffect } from 'react';
import { X, FileText, Building2, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getApplicationPreview, createApplication } from '../services/applicationApi';

const ApplyModal = ({ offerId, isOpen, onClose, onSuccess }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (isOpen && offerId) {
      loadPreview();
    }
  }, [isOpen, offerId]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getApplicationPreview(offerId);
      setPreview(response.data);
    } catch (err) {
      if (err.response?.data?.code === 'ALREADY_APPLIED') {
        setError('Ya has postulado a esta oferta anteriormente');
      } else {
        setError(err.response?.data?.message || 'Error al cargar la previsualización');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      await createApplication({
        offerId,
        resumeId: preview.resume.id,
        coverLetter: coverLetter.trim() || null,
      });
      
      setShowConfirmation(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      if (err.response?.data?.code === 'DUPLICATE_APPLICATION') {
        setError('Ya has postulado a esta oferta anteriormente');
      } else {
        setError(err.response?.data?.message || 'Error al enviar la postulación');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Postular a Oferta
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Cargando información...</span>
            </div>
          ) : showConfirmation ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ¡Postulación enviada!
              </h3>
              <p className="text-gray-600">
                Tu postulación ha sido registrada exitosamente.
              </p>
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium">{error}</p>
                <button
                  onClick={onClose}
                  className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : preview ? (
            <div className="space-y-6">
              {/* Oferta Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {preview.offer.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {preview.offer.company.tradeName || preview.offer.company.legalName}
                    </p>
                    <div className="flex gap-2 mt-2 text-sm text-gray-500">
                      <span className="bg-white px-2 py-1 rounded">
                        {preview.offer.modality}
                      </span>
                      <span className="bg-white px-2 py-1 rounded">
                        {preview.offer.area}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos del Estudiante */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <h4 className="font-medium text-gray-900">Tus Datos</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Nombre:</span>
                    <p className="font-medium">{preview.student.firstName} {preview.student.lastName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{preview.student.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Universidad:</span>
                    <p className="font-medium">{preview.student.university}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Carrera:</span>
                    <p className="font-medium">{preview.student.career}</p>
                  </div>
                </div>
              </div>

              {/* CV a Enviar */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-gray-900">CV a Enviar</h4>
                </div>
                {preview.resume ? (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800">CV Activo</p>
                        <p className="text-sm text-green-600">
                          Completitud: {preview.resume.completionPercentage || 0}%
                        </p>
                      </div>
                      <span className="text-sm text-green-700 font-medium">
                        ✓ Listo para enviar
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-red-700">
                      No tienes un CV activo. Crea uno antes de postular.
                    </p>
                  </div>
                )}
              </div>

              {/* Carta de Presentación Opcional */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Carta de Presentación (Opcional)
                </h4>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Escribe una breve carta de presentación para destacar tu candidatura..."
                  className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={5000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {coverLetter.length}/5000 caracteres
                </p>
              </div>

              {/* Warning si no puede postular */}
              {!preview.canApply && (
                <div className="bg-yellow-50 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-700 text-sm">
                    No puedes postular a esta oferta. Asegúrate de tener un CV activo y que la oferta esté disponible.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {!loading && !showConfirmation && !error && preview?.canApply && (
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Confirmar Postulación'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyModal;
