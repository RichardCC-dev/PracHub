import { useEffect } from 'react';
import CVSection from './CVSection';
import CVProgressBar from './CVProgressBar';
import CVPreview from './CVPreview';
import useCVStore from '../store/cvStore';

const sections = [
  { key: 'personal', title: 'Datos personales', fields: ['fullName', 'email', 'phone', 'linkedin'] },
  { key: 'profile', title: 'Perfil profesional', fields: ['summary'], isProfile: true },
  { key: 'education', title: 'Formación académica', fields: [], isEducation: true },
  { key: 'experience', title: 'Experiencia profesional (opcional)', fields: [], isExperience: true },
  { key: 'projects', title: 'Proyectos', fields: [], isProjects: true },
  { key: 'certifications', title: 'Certificaciones', fields: [], isCertifications: true },
  { key: 'skills', title: 'Habilidades', fields: [] },
  { key: 'languages', title: 'Idiomas', fields: ['list'] },
];

const CVWizard = () => {
  const { resume, fetchResume, isLoading, error, selectedTemplate, restoreCount } = useCVStore();

  useEffect(() => {
    fetchResume();
    return () => {
      useCVStore.setState({ resume: null, error: null });
    };
  }, [fetchResume]);

  if (!resume) return (
    <div className="flex items-center justify-center py-16">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700 mr-3" />
      <span className="text-sm text-gray-500">Cargando CV...</span>
    </div>
  );
  if (error) return <div className="text-center text-red-600 py-10">{error}</div>;

  return (
    <div className="space-y-6">
      <CVProgressBar completion={resume?.completionPercentage || 0} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          {sections.map((section) => (
            <CVSection
              key={`${section.key}-${restoreCount}`}
              section={section.key}
              title={section.title}
              fields={section.fields}
              data={resume?.[section.key] || {}}
              isEducation={section.isEducation}
              isExperience={section.isExperience}
              isProjects={section.isProjects}
              isProfile={section.isProfile}
              isCertifications={section.isCertifications}
            />
          ))}
        </div>
        <div className="xl:sticky xl:top-6 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
          <CVPreview key={`preview-${restoreCount}`} resume={resume} template={selectedTemplate} />
        </div>
      </div>
    </div>
  );
};

export default CVWizard;
