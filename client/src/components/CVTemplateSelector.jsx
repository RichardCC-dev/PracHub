import { useState, useEffect } from 'react';
import { getTemplates } from '../services/pdfApi';

const CVTemplateSelector = ({ selectedTemplate, onTemplateSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await getTemplates();
      setTemplates(response.data);
      
      // Seleccionar la primera plantilla por defecto si no hay ninguna seleccionada
      if (!selectedTemplate && response.data.length > 0) {
        onTemplateSelect(response.data[0].id);
      }
    } catch (err) {
      setError('Error cargando plantillas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-950 mb-4">Plantilla de CV</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-2xl"></div>
          <div className="h-24 bg-gray-200 rounded-2xl"></div>
          <div className="h-24 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-950 mb-4">Plantilla de CV</h3>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  const getTemplateName = (category) => {
    const names = {
      modern: 'Moderna',
      classic: 'Clásica',
      creative: 'Creativa'
    };
    return names[category] || category;
  };

  const getTemplateDescription = (category) => {
    const descriptions = {
      modern: 'Diseño limpio y profesional con gradientes modernos',
      classic: 'Estilo tradicional y formal, ideal para sectores conservadores',
      creative: 'Diseño vibrante con colores y elementos visuales atractivos'
    };
    return descriptions[category] || 'Plantilla profesional';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-950 mb-4">Plantilla de CV</h3>
      <p className="text-sm text-gray-600 mb-6">
        Elige el diseño que mejor represente tu perfil profesional
      </p>
      
      <div className="space-y-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
            }`}
            onClick={() => onTemplateSelect(template.id)}
          >
            {/* Indicador de selección */}
            {selectedTemplate === template.id && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            )}

            {/* Preview de la plantilla */}
            <div className="flex items-center space-x-4">
              {/* Thumbnail placeholder */}
              <div className="w-20 h-28 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <div className={`w-16 h-24 rounded ${
                  template.category === 'modern' ? 'bg-gradient-to-br from-blue-400 to-purple-500' :
                  template.category === 'classic' ? 'bg-gray-800' :
                  'bg-gradient-to-br from-pink-400 to-orange-400'
                }`}></div>
              </div>

              {/* Información de la plantilla */}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-950">
                  {getTemplateName(template.category)}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {getTemplateDescription(template.category)}
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    template.category === 'modern' ? 'bg-blue-100 text-blue-700' :
                    template.category === 'classic' ? 'bg-gray-100 text-gray-700' :
                    'bg-pink-100 text-pink-700'
                  }`}>
                    {template.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        La plantilla seleccionada se usará para generar tu PDF
      </p>
    </div>
  );
};

export default CVTemplateSelector;
