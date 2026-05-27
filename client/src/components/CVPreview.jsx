const SectionTitle = ({ children }) => (
  <div className="mt-5 mb-2">
    <h3 className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-900">{children}</h3>
    <hr className="mt-0.5 border-t border-gray-900" />
  </div>
);

const CVPreview = ({ resume }) => {
  if (!resume) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-xl shadow-gray-200">
        <p className="text-sm text-gray-400 italic text-center">Completa los campos del formulario para ver tu CV aquí en tiempo real.</p>
      </div>
    );
  }

  const p = resume?.personal || {};
  const edu = resume?.education || {};
  const exp = resume?.experience || {};
  const proj = resume?.projects || {};
  const certs = resume?.certifications || {};
  const skills = resume?.skills || {};
  const langs = resume?.languages || {};
  const profile = resume?.profile || {};

  const hasExp = exp.items?.some(i => i.company || i.role || i.description);
  const hasProj = proj.items?.some(i => i.title || i.description);
  const hasCerts = certs.items?.length > 0;
  const hasSkills = skills.areas?.some(a => a.skills?.trim()) || skills.technical?.trim() || skills.soft?.trim();
  const hasLangs = langs.list?.trim();
  const hasEdu = edu.items?.some(e => e.degree || e.institution);

  const contactParts = [p.email, p.phone, p.linkedin].filter(Boolean);

  return (
    <div className="rounded-2xl bg-white shadow-xl shadow-gray-200 overflow-hidden">
      <div
        id="cv-harvard-preview"
        className="px-10 py-10 font-serif text-gray-900"
        style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '12.5px', lineHeight: '1.55' }}
      >
        {/* CABECERA */}
        <div className="text-center mb-1">
          {p.fullName && (
            <h1 className="text-[22px] font-bold tracking-wide uppercase" style={{ fontFamily: 'inherit' }}>
              {p.fullName}
            </h1>
          )}
          {!p.fullName && (
            <h1 className="text-[22px] font-bold tracking-wide uppercase text-gray-300" style={{ fontFamily: 'inherit' }}>
              Tu Nombre
            </h1>
          )}
          {contactParts.length > 0 && (
            <p className="mt-1 text-[10px] text-gray-700 tracking-wide">
              {contactParts.join(' · ')}
            </p>
          )}
        </div>

        {/* PERFIL PROFESIONAL */}
        {profile.summary?.trim() && (
          <>
            <SectionTitle>Perfil Profesional</SectionTitle>
            <p className="text-[10.5px] text-gray-800 leading-relaxed">{profile.summary}</p>
          </>
        )}

        {/* FORMACIÓN ACADÉMICA */}
        {hasEdu && (
          <>
            <SectionTitle>Formación Académica</SectionTitle>
            <div className="space-y-3">
              {edu.items.filter(e => e.degree || e.institution).map((e, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline">
                    {e.institution && <p className="font-bold">{e.institution}</p>}
                    {(e.startDate || e.endDate) && (
                      <p className="text-gray-600 whitespace-nowrap ml-4 text-[11px]">
                        {[e.startDate, e.endDate].filter(Boolean).join(' – ')}
                      </p>
                    )}
                  </div>
                  {e.degree && <p className="italic text-gray-700">{e.degree}</p>}
                  {e.courses?.trim() && (
                    <p className="text-gray-600 mt-0.5 ml-4">
                      <span className="text-[11px]">• </span>{e.courses}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* EXPERIENCIA */}
        {hasExp && (
          <>
            <SectionTitle>Experiencia Profesional</SectionTitle>
            <div className="space-y-3">
              {exp.items.filter(i => i.company || i.role || i.description).map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline">
                    <div>
                      {item.role && <p className="font-bold text-[10.5px]">{item.role}</p>}
                      {item.company && <p className="text-[10.5px] italic">{item.company}</p>}
                    </div>
                    {item.period && (
                      <p className="text-[10px] text-gray-600 whitespace-nowrap ml-4">{item.period}</p>
                    )}
                  </div>
                  {item.description?.trim() && (
                    <p className="text-[10.5px] text-gray-700 mt-0.5 leading-relaxed">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* PROYECTOS */}
        {hasProj && (
          <>
            <SectionTitle>Proyectos</SectionTitle>
            <div className="space-y-3">
              {proj.items.filter(i => i.title || i.bullets?.some(b => b.trim())).map((item, idx) => (
                <div key={idx}>
                  {item.title && <p className="font-bold">{item.title}</p>}
                  {Array.isArray(item.bullets) && item.bullets.filter(b => b.trim()).length > 0 && (
                    <ul className="mt-0.5 space-y-0.5">
                      {item.bullets.filter(b => b.trim()).map((b, bi) => (
                        <li key={bi} className="flex gap-2 text-gray-700">
                          <span className="mt-0.5 shrink-0">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!Array.isArray(item.bullets) && item.description?.trim() && (
                    <p className="text-gray-700 mt-0.5">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* CERTIFICACIONES */}
        {hasCerts && (
          <>
            <SectionTitle>Certificaciones</SectionTitle>
            <div className="space-y-1">
              {certs.items.map((cert, idx) => (
                <div key={idx} className="flex justify-between items-baseline">
                  <p className="text-[10.5px]">
                    <span className="font-bold">{cert.name}</span>
                    {cert.issuer && <span className="text-gray-600"> — {cert.issuer}</span>}
                  </p>
                  {cert.date && <p className="text-[10px] text-gray-500 ml-4 whitespace-nowrap">{cert.date}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* HABILIDADES */}
        {hasSkills && (
          <>
            <SectionTitle>Habilidades</SectionTitle>
            <div className="space-y-1">
              {(skills.areas?.length > 0
                ? skills.areas.filter(a => a.skills?.trim())
                : skills.technical?.trim() ? [{ area: '', skills: skills.technical }] : []
              ).map((a, idx) => (
                <p key={idx}>
                  {a.area?.trim()
                    ? <><span className="font-bold">{a.area}:</span> {a.skills}</>
                    : <><span className="font-bold">Técnicas:</span> {a.skills}</>
                  }
                </p>
              ))}
              {skills.soft?.trim() && (
                <p><span className="font-bold">Blandas:</span> {skills.soft}</p>
              )}
            </div>
          </>
        )}

        {/* IDIOMAS */}
        {hasLangs && (
          <>
            <SectionTitle>Idiomas</SectionTitle>
            <p className="text-[10.5px]">{langs.list}</p>
          </>
        )}
      </div>

      {resume?.completionPercentage === 100 && (
        <div className="mx-10 mb-6 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
          <p className="text-xs font-semibold text-emerald-800 text-center">✅ CV completo — listo para exportar</p>
        </div>
      )}
    </div>
  );
};

export default CVPreview;
