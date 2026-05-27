const CVPreview = ({ resume }) => {
  if (!resume) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-xl shadow-emerald-950/10">
        <h2 className="text-2xl font-bold text-gray-950 mb-4">Vista previa del CV</h2>
        <p className="text-sm text-gray-400 italic">Completa los campos del formulario para ver tu CV aquí en tiempo real.</p>
      </div>
    );
  }

  const formatSection = (title, data, fields) => {
    if (!data) return null;

    // Caso especial para experiencia (opcional: no mostrar si está vacía)
    if (title === 'Experiencia') {
      if (!data.items || data.items.length === 0) return null;

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

  const hasCertifications = resume?.certifications?.items?.length > 0;

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl shadow-emerald-950/10">
      <h2 className="text-2xl font-bold text-gray-950 mb-6">Vista previa del CV</h2>
      <div className="prose prose-sm max-w-none">
        {/* 1. Datos personales */}
        {formatSection('Datos personales', resume?.personal, ['fullName', 'email', 'phone', 'linkedin'])}
        {/* 2. Perfil profesional */}
        {resume?.profile?.summary?.trim() && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-950 mb-2">Perfil profesional</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{resume.profile.summary}</p>
          </div>
        )}
        {/* 3. Formación académica */}
        {formatSection('Formación académica', resume?.education, ['degree', 'institution', 'startDate', 'endDate', 'courses'])}
        {/* 4. Experiencia */}
        {formatSection('Experiencia', resume?.experience, ['company', 'role', 'description'])}
        {/* 5. Proyectos */}
        {formatSection('Proyectos', resume?.projects, ['title', 'description'])}
        {/* 6. Certificaciones */}
        {hasCertifications && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-950 mb-2">Certificaciones</h3>
            <div className="space-y-2">
              {resume.certifications.items.map((cert, i) => (
                <div key={i} className="text-sm border-l-2 border-emerald-200 pl-4">
                  <span className="font-medium text-gray-900">{cert.name}</span>
                  {cert.issuer && <span className="text-gray-600"> — {cert.issuer}</span>}
                  {cert.date && <span className="text-gray-400 ml-2">{cert.date}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* 7. Habilidades */}
        {formatSection('Habilidades', resume?.skills, ['technical', 'soft'])}
        {/* 8. Idiomas */}
        {formatSection('Idiomas', resume?.languages, ['list'])}
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
