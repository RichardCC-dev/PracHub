import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { updateCompanyProfile, uploadLogo } from '../services/api';

const CULTURE_TAG_OPTIONS = [
  'trabajo remoto',
  'mentorías',
  'equipo joven',
  'ambiente inclusivo',
  'crecimiento rápido',
  'flexibilidad horaria',
  'proyectos internacionales',
  'capacitación constante',
  'buen ambiente laboral',
  'innovación',
];

const CompanyProfileForm = ({ company, token, onUpdate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedTags, setSelectedTags] = useState(company.cultureTags || []);
  const [customTag, setCustomTag] = useState('');
  
  // Estados para upload de logo
  const [logoMode, setLogoMode] = useState(company.logoUrl ? 'url' : 'upload'); // 'url' | 'upload'
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState(company.logoUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(company.logoUrl || '');
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      description: company.description || '',
      tradeName: company.tradeName || '',
      websiteUrl: company.websiteUrl || '',
      city: company.city || '',
      address: company.address || '',
      logoUrl: company.logoUrl || '',
    },
  });

  const description = watch('description');
  const charCount = description?.length || 0;

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = customTag.trim().toLowerCase();
    if (trimmed && !selectedTags.includes(trimmed) && selectedTags.length < 3) {
      setSelectedTags([...selectedTags, trimmed]);
      setCustomTag('');
    }
  };

  // Funciones para manejar upload de logo
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamaño (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('El archivo es demasiado grande. Máximo 2MB.');
      return;
    }

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Solo se permiten imágenes (JPEG, PNG, WebP, GIF).');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const result = await uploadLogo(token, file);
      setUploadedLogoUrl(result.logoUrl);
      setPreviewUrl(result.logoUrl);
      setLogoMode('upload');
    } catch (err) {
      setUploadError(err.message || 'Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setUploadedLogoUrl(url);
    setPreviewUrl(url);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        ...data,
        logoUrl: logoMode === 'upload' ? uploadedLogoUrl : data.logoUrl,
        cultureTags: selectedTags,
      };

      const result = await updateCompanyProfile(token, payload);
      onUpdate(result);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('[CompanyProfileForm] Error:', err);
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Logo - Upload o URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logotipo de la empresa
        </label>
        
        {/* Preview del logo */}
        {previewUrl && (
          <div className="mb-4">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Logo preview"
                className="h-24 w-24 rounded-xl object-contain bg-gray-50 border border-gray-200"
                onError={() => setPreviewUrl('')}
              />
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl('');
                  setUploadedLogoUrl('');
                  setLogoMode('upload');
                }}
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center text-sm"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Toggle entre URL y Upload */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setLogoMode('upload')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              logoMode === 'upload'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            Subir archivo
          </button>
          <button
            type="button"
            onClick={() => setLogoMode('url')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              logoMode === 'url'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            URL externa
          </button>
        </div>

        {/* Opción Upload */}
        {logoMode === 'upload' && (
          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full rounded-xl border-2 border-dashed border-gray-300 px-4 py-6 text-gray-600 hover:border-emerald-500 hover:text-emerald-700 transition disabled:opacity-50"
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Subiendo...
                </span>
              ) : (
                <span className="flex flex-col items-center gap-1">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Click para seleccionar imagen</span>
                  <span className="text-xs text-gray-400">Máximo 2MB (JPEG, PNG, WebP, GIF)</span>
                </span>
              )}
            </button>
            {uploadError && (
              <p className="text-sm text-red-600">{uploadError}</p>
            )}
          </div>
        )}

        {/* Opción URL */}
        {logoMode === 'url' && (
          <div>
            <input
              type="url"
              {...register('logoUrl')}
              onChange={handleUrlChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
              placeholder="https://ejemplo.com/logo.png"
            />
            <p className="text-xs text-gray-500 mt-1">Ingresa la URL de tu logotipo</p>
          </div>
        )}
      </div>

      {/* Trade Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre comercial
        </label>
        <input
          type="text"
          {...register('tradeName', { maxLength: 200 })}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
          placeholder="Nombre comercial de tu empresa"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción de la empresa
        </label>
        <textarea
          {...register('description', { maxLength: 500 })}
          rows={4}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition resize-none"
          placeholder="Describe tu empresa, misión, visión y valores (máx. 500 caracteres)"
        />
        <div className="flex justify-between mt-1">
          <span className={`text-xs ${charCount > 500 ? 'text-red-500' : 'text-gray-500'}`}>
            {charCount}/500 caracteres
          </span>
          {errors.description && (
            <span className="text-xs text-red-600">{errors.description.message}</span>
          )}
        </div>
      </div>

      {/* Culture Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Etiquetas de cultura (máx. 3)
        </label>
        
        {/* Selected Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleTagToggle(tag)}
                className="text-emerald-600 hover:text-emerald-800"
              >
                ×
              </button>
            </span>
          ))}
          {selectedTags.length === 0 && (
            <span className="text-sm text-gray-400 italic">Selecciona hasta 3 etiquetas</span>
          )}
        </div>

        {/* Predefined Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {CULTURE_TAG_OPTIONS.filter(tag => !selectedTags.includes(tag)).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagToggle(tag)}
              disabled={selectedTags.length >= 3}
              className="px-3 py-1 rounded-full border border-gray-300 text-gray-600 text-sm hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + {tag}
            </button>
          ))}
        </div>

        {/* Custom Tag Input */}
        {selectedTags.length < 3 && (
          <div className="flex gap-2">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              maxLength={30}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              placeholder="Etiqueta personalizada..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              disabled={!customTag.trim()}
              className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-medium hover:bg-emerald-200 transition disabled:opacity-50"
            >
              Agregar
            </button>
          </div>
        )}
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sitio web
        </label>
        <input
          type="url"
          {...register('websiteUrl', { 
            pattern: {
              value: /^https?:\/\/.+/,
              message: 'La URL debe comenzar con http:// o https://'
            }
          })}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
          placeholder="https://www.tuempresa.com"
        />
        {errors.websiteUrl && (
          <p className="text-sm text-red-600 mt-1">{errors.websiteUrl.message}</p>
        )}
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ciudad
        </label>
        <input
          type="text"
          {...register('city', { maxLength: 100 })}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
          placeholder="Ciudad donde se ubica la empresa"
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dirección
        </label>
        <input
          type="text"
          {...register('address', { maxLength: 300 })}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
          placeholder="Dirección física de la empresa"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm">
          Perfil actualizado correctamente ✓
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-emerald-800 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  );
};

export default CompanyProfileForm;
