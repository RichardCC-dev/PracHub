/**
 * @module utils/format
 * Helpers de formato compartidos para garantizar que los datos se muestren
 * de forma consistente en toda la app (y que el formato enviado al backend
 * coincida con lo que espera la base de datos).
 */

// ── Modalidad ────────────────────────────────────────────────────────────────
// La BD almacena la modalidad en inglés (enum: remote | in_person | hybrid).
// En la interfaz siempre se muestra en español.
export const MODALITY_LABELS = {
  remote: 'Remoto',
  in_person: 'Presencial',
  hybrid: 'Híbrido',
};

export const MODALITY_OPTIONS = [
  { value: 'remote', label: 'Remoto' },
  { value: 'in_person', label: 'Presencial' },
  { value: 'hybrid', label: 'Híbrido' },
];

/** Devuelve la etiqueta en español de una modalidad almacenada en inglés. */
export const formatModality = (value) => MODALITY_LABELS[value] || value || '—';

// ── Estado de postulación ──────────────────────────────────────────────────────
export const APPLICATION_STATUS = {
  enviada: { label: 'Enviada', color: 'bg-blue-100 text-blue-700' },
  revision: { label: 'En revisión', color: 'bg-amber-100 text-amber-700' },
  aceptada: { label: 'Aceptada', color: 'bg-green-100 text-green-700' },
  descartada: { label: 'Descartada', color: 'bg-red-100 text-red-700' },
};

export const formatApplicationStatus = (status) =>
  APPLICATION_STATUS[status] || { label: status || '—', color: 'bg-gray-100 text-gray-700' };

// ── Empresa ────────────────────────────────────────────────────────────────────
/** Nombre visible de una empresa: nombre comercial o, en su defecto, razón social. */
export const companyName = (company) =>
  company?.tradeName || company?.legalName || 'Empresa';

// ── Carreras / tags ──────────────────────────────────────────────────────────
/** Normaliza careerTags (puede venir como array, string JSON o string separado por comas). */
export const careerTagsToArray = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  // Intentar parsear como JSON (ej: '["Ingeniería de Software"]')
  if (typeof tags === 'string' && tags.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed.map((t) => String(t).trim()).filter(Boolean);
    } catch {
      // Si falla el parse, caer al split por comas
    }
  }
  return String(tags)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
};

// ── Fechas ────────────────────────────────────────────────────────────────────
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatRelativeDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays <= 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return formatDate(date);
};
