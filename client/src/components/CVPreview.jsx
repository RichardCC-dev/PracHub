/* ─── Harvard: separador de sección ─────────────────────────────────────── */
const HarvardSectionTitle = ({ children }) => (
  <div className="mt-5 mb-2">
    <h3 className="text-[11.5px] font-bold tracking-[0.18em] uppercase text-gray-900">{children}</h3>
    <hr className="mt-0.5 border-t border-gray-900" />
  </div>
);

/* ─── Investment Banking: separador de sección ───────────────────────────── */
const IBSectionTitle = ({ children }) => (
  <div className="mt-4 mb-1.5">
    <h3 className="text-[11px] font-bold tracking-[0.14em] uppercase text-gray-900 border-b border-gray-900 pb-0.5">{children}</h3>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   TEMPLATE HARVARD
═══════════════════════════════════════════════════════════════════════════ */
const HarvardTemplate = ({ resume }) => {
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
    <div
      id="cv-harvard-preview"
      className="px-10 py-10 font-serif text-gray-900"
      style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '13px', lineHeight: '1.55' }}
    >
      {/* CABECERA */}
      <div className="text-center mb-1">
        {p.fullName
          ? <h1 className="text-[23px] font-bold tracking-wide uppercase" style={{ fontFamily: 'inherit' }}>{p.fullName}</h1>
          : <h1 className="text-[23px] font-bold tracking-wide uppercase text-gray-300" style={{ fontFamily: 'inherit' }}>Tu Nombre</h1>
        }
        {contactParts.length > 0 && (
          <p className="mt-1 text-[11px] text-gray-700 tracking-wide">{contactParts.join(' · ')}</p>
        )}
      </div>

      {/* PERFIL PROFESIONAL */}
      {profile.summary?.trim() && (
        <>
          <HarvardSectionTitle>Perfil Profesional</HarvardSectionTitle>
          <p className="text-[11.5px] text-gray-800 leading-relaxed">{profile.summary}</p>
        </>
      )}

      {/* FORMACIÓN ACADÉMICA */}
      {hasEdu && (
        <>
          <HarvardSectionTitle>Formación Académica</HarvardSectionTitle>
          <div className="space-y-3">
            {edu.items.filter(e => e.degree || e.institution).map((e, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline">
                  {e.institution && <p className="font-bold">{e.institution}</p>}
                  {(e.startDate || e.endDate) && (
                    <p className="text-gray-600 whitespace-nowrap ml-4 text-[11.5px]">
                      {[e.startDate, e.endDate].filter(Boolean).join(' – ')}
                    </p>
                  )}
                </div>
                {e.degree && <p className="italic text-gray-700">{e.degree}</p>}
                {e.courses?.trim() && (
                  <p className="text-gray-600 mt-0.5 ml-4 text-[11.5px]">• {e.courses}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* EXPERIENCIA */}
      {hasExp && (
        <>
          <HarvardSectionTitle>Experiencia Profesional</HarvardSectionTitle>
          <div className="space-y-3">
            {exp.items.filter(i => i.company || i.role || i.description).map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline">
                  <div>
                    {item.role && <p className="font-bold text-[12px]">{item.role}</p>}
                    {item.company && <p className="text-[12px] italic">{item.company}</p>}
                  </div>
                  {item.period && (
                    <p className="text-[11px] text-gray-600 whitespace-nowrap ml-4">{item.period}</p>
                  )}
                </div>
                {item.description?.trim() && (
                  <p className="text-[11.5px] text-gray-700 mt-0.5 leading-relaxed">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* PROYECTOS */}
      {hasProj && (
        <>
          <HarvardSectionTitle>Proyectos</HarvardSectionTitle>
          <div className="space-y-3">
            {proj.items.filter(i => i.title || i.bullets?.some(b => b.trim())).map((item, idx) => (
              <div key={idx}>
                {item.title && <p className="font-bold">{item.title}</p>}
                {Array.isArray(item.bullets) && item.bullets.filter(b => b.trim()).length > 0 && (
                  <ul className="mt-0.5 space-y-0.5">
                    {item.bullets.filter(b => b.trim()).map((b, bi) => (
                      <li key={bi} className="flex gap-2 text-gray-700">
                        <span className="mt-0.5 shrink-0">•</span><span>{b}</span>
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
          <HarvardSectionTitle>Certificaciones</HarvardSectionTitle>
          <div className="space-y-1">
            {certs.items.map((cert, idx) => (
              <div key={idx} className="flex justify-between items-baseline">
                <p className="text-[11.5px]">
                  <span className="font-bold">{cert.name}</span>
                  {cert.issuer && <span className="text-gray-600"> — {cert.issuer}</span>}
                </p>
                {cert.date && <p className="text-[11px] text-gray-500 ml-4 whitespace-nowrap">{cert.date}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* HABILIDADES */}
      {hasSkills && (
        <>
          <HarvardSectionTitle>Habilidades</HarvardSectionTitle>
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
          <HarvardSectionTitle>Idiomas</HarvardSectionTitle>
          <p className="text-[11.5px]">{langs.list}</p>
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TEMPLATE INVESTMENT BANKING
═══════════════════════════════════════════════════════════════════════════ */
const InvestmentBankingTemplate = ({ resume }) => {
  const p = resume?.personal || {};
  const edu = resume?.education || {};
  const exp = resume?.experience || {};
  const proj = resume?.projects || {};
  const certs = resume?.certifications || {};
  const skills = resume?.skills || {};
  const langs = resume?.languages || {};
  const profile = resume?.profile || {};

  const hasExp = exp.items?.some(i => i.company || i.role || i.description);
  const hasProj = proj.items?.some(i => i.title || i.description || i.bullets?.some(b => b.trim()));
  const hasCerts = certs.items?.length > 0;
  const hasSkills = skills.areas?.some(a => a.skills?.trim()) || skills.technical?.trim() || skills.soft?.trim();
  const hasLangs = langs.list?.trim();
  const hasEdu = edu.items?.some(e => e.degree || e.institution);

  const contactParts = [p.email, p.phone, p.linkedin].filter(Boolean);

  return (
    <div
      id="cv-ib-preview"
      className="px-9 py-8 text-gray-900"
      style={{ fontFamily: "'Arial', 'Helvetica Neue', sans-serif", fontSize: '12px', lineHeight: '1.45' }}
    >
      {/* CABECERA */}
      <div className="text-center border-b-2 border-gray-900 pb-3 mb-1">
        {p.fullName
          ? <h1 className="text-[20px] font-extrabold tracking-tight uppercase">{p.fullName}</h1>
          : <h1 className="text-[20px] font-extrabold tracking-tight uppercase text-gray-300">Tu Nombre</h1>
        }
        {contactParts.length > 0 && (
          <p className="mt-1 text-[11px] text-gray-600">{contactParts.join('  |  ')}</p>
        )}
      </div>

      {/* PERFIL PROFESIONAL */}
      {profile.summary?.trim() && (
        <>
          <IBSectionTitle>Perfil Profesional</IBSectionTitle>
          <p className="text-[11.5px] text-gray-800 leading-snug">{profile.summary}</p>
        </>
      )}

      {/* FORMACIÓN ACADÉMICA */}
      {hasEdu && (
        <>
          <IBSectionTitle>Formación Académica</IBSectionTitle>
          <div className="space-y-2">
            {edu.items.filter(e => e.degree || e.institution).map((e, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline">
                  <div>
                    {e.institution && <span className="font-bold text-[12px]">{e.institution}</span>}
                    {e.degree && <span className="text-[11.5px] text-gray-600 ml-2">{e.degree}</span>}
                  </div>
                  {(e.startDate || e.endDate) && (
                    <span className="text-[11px] text-gray-500 whitespace-nowrap ml-4 font-semibold">
                      {[e.startDate, e.endDate].filter(Boolean).join(' – ')}
                    </span>
                  )}
                </div>
                {e.courses?.trim() && (
                  <p className="text-[11px] text-gray-500 mt-0.5 ml-1">Cursos relevantes: {e.courses}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* EXPERIENCIA PROFESIONAL */}
      {hasExp && (
        <>
          <IBSectionTitle>Experiencia Profesional</IBSectionTitle>
          <div className="space-y-2.5">
            {exp.items.filter(i => i.company || i.role || i.description).map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline">
                  <div>
                    {item.company && <span className="font-bold text-[12px]">{item.company}</span>}
                    {item.role && <span className="text-[11.5px] text-gray-600 ml-2 italic">{item.role}</span>}
                  </div>
                  {item.period && (
                    <span className="text-[11px] text-gray-500 whitespace-nowrap ml-4 font-semibold">{item.period}</span>
                  )}
                </div>
                {item.description?.trim() && (
                  <ul className="mt-0.5 space-y-0.5 ml-3">
                    {item.description.split('\n').filter(l => l.trim()).map((line, li) => (
                      <li key={li} className="flex gap-1.5 text-[11.5px] text-gray-700">
                        <span className="shrink-0 mt-0.5">–</span><span>{line.trim()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* PROYECTOS */}
      {hasProj && (
        <>
          <IBSectionTitle>Proyectos</IBSectionTitle>
          <div className="space-y-2">
            {proj.items.filter(i => i.title || i.bullets?.some(b => b.trim())).map((item, idx) => (
              <div key={idx}>
                {item.title && <p className="font-bold text-[12px]">{item.title}</p>}
                {Array.isArray(item.bullets) && item.bullets.filter(b => b.trim()).length > 0 && (
                  <ul className="mt-0.5 space-y-0.5 ml-3">
                    {item.bullets.filter(b => b.trim()).map((b, bi) => (
                      <li key={bi} className="flex gap-1.5 text-[11.5px] text-gray-700">
                        <span className="shrink-0 mt-0.5">–</span><span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {!Array.isArray(item.bullets) && item.description?.trim() && (
                  <p className="text-[11.5px] text-gray-700 mt-0.5">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* CERTIFICACIONES */}
      {hasCerts && (
        <>
          <IBSectionTitle>Certificaciones</IBSectionTitle>
          <div className="space-y-0.5">
            {certs.items.map((cert, idx) => (
              <div key={idx} className="flex justify-between items-baseline">
                <p className="text-[11.5px]">
                  <span className="font-bold">{cert.name}</span>
                  {cert.issuer && <span className="text-gray-600"> — {cert.issuer}</span>}
                </p>
                {cert.date && <p className="text-[11px] text-gray-500 ml-4 whitespace-nowrap">{cert.date}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* HABILIDADES */}
      {hasSkills && (
        <>
          <IBSectionTitle>Habilidades</IBSectionTitle>
          <div className="space-y-0.5">
            {(skills.areas?.length > 0
              ? skills.areas.filter(a => a.skills?.trim())
              : skills.technical?.trim() ? [{ area: '', skills: skills.technical }] : []
            ).map((a, idx) => (
              <p key={idx} className="text-[11.5px]">
                {a.area?.trim()
                  ? <><span className="font-bold">{a.area}:</span> {a.skills}</>
                  : <><span className="font-bold">Técnicas:</span> {a.skills}</>
                }
              </p>
            ))}
            {skills.soft?.trim() && (
              <p className="text-[11.5px]"><span className="font-bold">Blandas:</span> {skills.soft}</p>
            )}
          </div>
        </>
      )}

      {/* IDIOMAS */}
      {hasLangs && (
        <>
          <IBSectionTitle>Idiomas</IBSectionTitle>
          <p className="text-[11.5px]">{langs.list}</p>
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════════════════════ */
const CVPreview = ({ resume, template = 'harvard' }) => {
  if (!resume) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-xl shadow-gray-200">
        <p className="text-sm text-gray-400 italic text-center">Completa los campos del formulario para ver tu CV aquí en tiempo real.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white shadow-xl shadow-gray-200 overflow-hidden">
      {template === 'investment-banking'
        ? <InvestmentBankingTemplate resume={resume} />
        : <HarvardTemplate resume={resume} />
      }
      {resume?.completionPercentage === 100 && (
        <div className="mx-10 mb-6 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
          <p className="text-xs font-semibold text-emerald-800 text-center">✅ CV completo — listo para exportar</p>
        </div>
      )}
    </div>
  );
};

export default CVPreview;
