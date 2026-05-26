import { useEffect } from 'react';
import CVSection from './CVSection';
import CVProgressBar from './CVProgressBar';
import CVPreview from './CVPreview';
import useCVStore from '../store/cvStore';

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

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  if (isLoading && !resume) return <div className="text-center py-10">Cargando CV...</div>;
  if (error) return <div className="text-center text-red-600 py-10">{error}</div>;

  const isComplete = resume?.completionPercentage === 100;

  return (
    <div className="space-y-6">
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
  );
};

export default CVWizard;
