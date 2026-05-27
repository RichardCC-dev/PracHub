import { useState } from 'react';
import { exportPDF, downloadPDF } from '../services/pdfApi';

const ExportButton = ({ templateId, style = 'classic', disabled = false }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleExport = async () => {
    if (!templateId) {
      setError('Por favor selecciona una plantilla primero');
      return;
    }

    try {
      setIsExporting(true);
      setError(null);
      setSuccess(null);

      await exportPDF(templateId, style);
      
      setSuccess('PDF generado exitosamente');
      
      // Esperar un momento y luego descargar automáticamente
      setTimeout(() => {
        handleDownload();
      }, 1000);

    } catch (err) {
      setError(err.message || 'Error generando PDF');
      console.error('Error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadPDF();
      setSuccess('PDF descargado exitosamente');
    } catch (err) {
      setError(err.message || 'Error descargando PDF');
      console.error('Error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-950 mb-4">Exportar CV</h3>
      
      {/* Mensajes de estado */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-sm text-emerald-600">{success}</p>
        </div>
      )}

      {/* Botones de acción */}
      <div className="space-y-3">
        <button
          onClick={handleExport}
          disabled={disabled || isExporting || !templateId}
          className="w-full rounded-2xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generando PDF...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span>Generar y Descargar PDF</span>
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          disabled={disabled || isDownloading}
          className="w-full rounded-2xl border border-emerald-800 px-5 py-3 font-semibold text-emerald-900 transition hover:bg-emerald-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Descargando...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
              </svg>
              <span>Descargar PDF Anterior</span>
            </>
          )}
        </button>
      </div>

      {/* Información adicional */}
      <div className="mt-4 p-3 bg-gray-50 rounded-xl">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Información de exportación:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• El PDF se genera en menos de 5 segundos</li>
          <li>• El nombre del archivo incluye tu nombre y fecha</li>
          <li>• El diseño respeta exactamente la plantilla seleccionada</li>
          <li>• Puedes descargar PDFs generados anteriormente</li>
        </ul>
      </div>

      {!templateId && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-700">
            ⚠️ Debes seleccionar una plantilla antes de generar el PDF
          </p>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
