import { useEffect, useState } from 'react';
import CVSection from './CVSection';
import CVProgressBar from './CVProgressBar';
import CVPreview from './CVPreview';
import CVTemplateSelector from './CVTemplateSelector';
import ExportButton from './ExportButton';
import useCVStore from '../store/cvStore';
import { getTemplates } from '../services/pdfApi';

const sections = [
  { key: 'personal', title: 'Datos personales', fields: ['fullName', 'email', 'phone', 'linkedin'] },
  { key: 'education', title: 'Formación', fields: ['degree', 'institution', 'startDate', 'endDate'] },
  { key: 'experience', title: 'Experiencia', fields: [], isExperience: true },
  { key: 'skills', title: 'Habilidades', fields: ['technical', 'soft'] },
  { key: 'languages', title: 'Idiomas', fields: ['list'] },
  { key: 'projects', title: 'Proyectos', fields: [], isProjects: true },
];

const CVWizard = () => {
  const { resume, fetchResume, isLoading, error } = useCVStore();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState('classic');

  useEffect(() => {
    fetchResume();
    loadTemplates();
  }, [fetchResume]);

  const loadTemplates = async () => {
    try {
      const response = await getTemplates();
      setTemplates(response.data);
    } catch (err) {
      console.error('Error cargando plantillas:', err);
    }
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    // Encontrar el estilo de la plantilla seleccionada
    const template = templates.find(t => t.id === templateId);
    setSelectedStyle(template ? template.category : 'classic');
  };

  if (isLoading && !resume) return <div className="text-center py-10">Cargando CV...</div>;
  if (error) return <div className="text-center text-red-600 py-10">{error}</div>;

  const isComplete = resume?.completionPercentage === 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Columna izquierda: Formulario */}
      <div className="lg:col-span-2 space-y-4">
        <CVProgressBar completion={resume?.completionPercentage || 0} />
        <div className="space-y-6">
          {sections.map((section) => (
            <CVSection
              key={section.key}
              section={section.key}
              title={section.title}
              fields={section.fields}
              data={resume?.[section.key] || {}}
              isExperience={section.isExperience}
              isProjects={section.isProjects}
            />
          ))}
        </div>
        {isComplete && (
          <CVPreview resume={resume} />
        )}
      </div>

      {/* Columna derecha: Plantillas y Exportación */}
      <div className="space-y-6">
        <CVTemplateSelector 
          selectedTemplate={selectedTemplate} 
          onTemplateSelect={handleTemplateSelect} 
        />
        <ExportButton 
          templateId={selectedTemplate} 
          style={selectedStyle}
          disabled={!isComplete} 
        />
      </div>
    </div>
  );
};

export default CVWizard;
