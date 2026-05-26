const CVPreview = ({ resume }) => {
  const formatSection = (title, data, fields) => {
    if (!data) return null;

    // Caso especial para experiencia
    if (title === 'Experiencia') {
      if (!data.items || data.items.length === 0) {
        return (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-950 mb-2">{title}</h3>
            <p className="text-sm text-gray-600">Sin experiencia laboral previa</p>
          </div>
        );
      }

      return (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-950 mb-2">{title}</h3>
          <div className="space-y-4">
            {data.items.map((exp, index) => (
              <div key={`exp-${index}`} className="border-l-2 border-emerald-200 pl-4">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Empresa: </span>
                  <span className="text-gray-900">{exp.company}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Rol: </span>
                  <span className="text-gray-900">{exp.role}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Descripción: </span>
                  <span className="text-gray-900">{exp.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Caso especial para proyectos
    if (title === 'Proyectos') {
      if (!data.items || data.items.length === 0) {
        return (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-950 mb-2">{title}</h3>
            <p className="text-sm text-gray-600">No has añadido ningún proyecto</p>
          </div>
        );
      }

      return (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-950 mb-2">{title}</h3>
          <div className="space-y-4">
            {data.items.map((proj, index) => (
              <div key={`proj-${index}`} className="border-l-2 border-emerald-200 pl-4">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Título: </span>
                  <span className="text-gray-900">{proj.title}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Descripción: </span>
                  <span className="text-gray-900">{proj.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Para las demás secciones
    if (Object.values(data).every(v => !v || v.trim() === '')) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-950 mb-2">{title}</h3>
        <div className="space-y-1">
          {fields.map(field => {
            const value = data[field];
            if (!value || value.trim() === '') return null;
            
            const labels = {
              fullName: 'Nombre completo',
              email: 'Correo electrónico',
              phone: 'Teléfono',
              linkedin: 'LinkedIn',
              degree: 'Título',
              institution: 'Institución',
              startDate: 'Fecha de inicio',
              endDate: 'Fecha de fin',
              company: 'Empresa',
              role: 'Rol',
              description: 'Descripción',
              technical: 'Habilidades técnicas',
              soft: 'Habilidades blandas',
              list: 'Idiomas',
              title: 'Título del proyecto',
            };

            return (
              <div key={field} className="text-sm">
                <span className="font-medium text-gray-700">{labels[field]}: </span>
                <span className="text-gray-900">{value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl shadow-emerald-950/10">
      <h2 className="text-2xl font-bold text-gray-950 mb-6">Vista previa del CV</h2>
      <div className="prose prose-sm max-w-none">
        {formatSection('Datos personales', resume?.personal, ['fullName', 'email', 'phone', 'linkedin'])}
        {formatSection('Formación', resume?.education, ['degree', 'institution', 'startDate', 'endDate'])}
        {formatSection('Experiencia', resume?.experience, ['company', 'role', 'description'])}
        {formatSection('Habilidades', resume?.skills, ['technical', 'soft'])}
        {formatSection('Idiomas', resume?.languages, ['list'])}
        {formatSection('Proyectos', resume?.projects, ['title', 'description'])}
      </div>
      {resume?.completionPercentage === 100 && (
        <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
          <p className="text-sm font-semibold text-emerald-800">✅ ¡Tu CV está completo!</p>
        </div>
      )}
    </div>
  );
};

export default CVPreview;
