import { useState } from 'react';
import useAuthStore from '../store/authStore';

const VALID_INDUSTRIES = [
  'Tecnología',
  'Finanzas',
  'Salud',
  'Educación',
  'Manufactura',
  'Retail',
  'Consultoría',
  'Marketing',
  'Ingeniería',
  'Legal',
  'Otro',
];

const COMPANY_SIZES = [
  { value: 'micro', label: 'Microempresa (1-10 empleados)' },
  { value: 'small', label: 'Pequeña empresa (11-50 empleados)' },
  { value: 'medium', label: 'Mediana empresa (51-200 empleados)' },
  { value: 'large', label: 'Gran empresa (200+ empleados)' },
];

const COUNTRIES = ['Perú', 'Colombia', 'México', 'Chile', 'Argentina', 'Ecuador', 'Bolivia', 'Otro'];

const CompanyRegistrationForm = ({ onGoToLogin, onLoginSuccess }) => {
  const { registerCompany, isLoading, error: storeError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    taxId: '',
    legalName: '',
    tradeName: '',
    description: '',
    industry: '',
    companySize: '',
    websiteUrl: '',
    country: 'Perú',
    city: '',
    address: '',
    responsibleName: '',
    responsiblePosition: '',
    responsiblePhone: '',
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const validateRUC = (ruc) => {
    const cleanRUC = ruc.replace(/\s/g, '');
    const rucRegex = /^(10|15|16|17|20)\d{9}$/;
    return rucRegex.test(cleanRUC);
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo válido.';
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    } else {
      if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'La contraseña debe incluir una mayúscula.';
      }
      if (!/[a-z]/.test(formData.password)) {
        newErrors.password = 'La contraseña debe incluir una minúscula.';
      }
      if (!/\d/.test(formData.password)) {
        newErrors.password = 'La contraseña debe incluir un número.';
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.taxId || !validateRUC(formData.taxId)) {
      newErrors.taxId = 'El RUC debe tener 11 dígitos y comenzar con 10, 15, 16, 17 o 20.';
    }

    if (!formData.legalName || formData.legalName.length < 2) {
      newErrors.legalName = 'La razón social es obligatoria.';
    }

    if (!formData.industry) {
      newErrors.industry = 'Selecciona un sector.';
    }

    if (!formData.companySize) {
      newErrors.companySize = 'Selecciona el tamaño de tu empresa.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};

    if (!formData.responsibleName || formData.responsibleName.length < 2) {
      newErrors.responsibleName = 'El nombre del responsable es obligatorio.';
    }

    if (!formData.responsiblePosition || formData.responsiblePosition.length < 2) {
      newErrors.responsiblePosition = 'El cargo del responsable es obligatorio.';
    }

    if (!formData.responsiblePhone || formData.responsiblePhone.length < 6) {
      newErrors.responsiblePhone = 'El teléfono del responsable es obligatorio.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setSubmitError(null);
  };

  const handleNext = () => {
    let isValid = false;
    if (currentStep === 1) isValid = validateStep1();
    else if (currentStep === 2) isValid = validateStep2();

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep3()) return;

    setSubmitError(null);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        taxId: formData.taxId.replace(/\s/g, ''),
        legalName: formData.legalName,
        tradeName: formData.tradeName,
        description: formData.description,
        industry: formData.industry,
        companySize: formData.companySize,
        websiteUrl: formData.websiteUrl,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        responsibleName: formData.responsibleName,
        responsiblePosition: formData.responsiblePosition,
        responsiblePhone: formData.responsiblePhone,
      };

      await registerCompany(payload);
      setSuccessMessage(
        '¡Registro exitoso! Hemos enviado un correo de verificación. Por favor revisa tu bandeja de entrada.'
      );
      setTimeout(() => {
        onLoginSuccess?.();
      }, 3000);
    } catch (err) {
      setSubmitError(err.message || 'Ocurrió un error al registrar la empresa.');
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-6 flex items-center justify-center space-x-2">
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
            step === currentStep
              ? 'bg-emerald-600 text-white'
              : step < currentStep
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {step < currentStep ? '✓' : step}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">1. Cuenta de acceso</h3>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Correo electrónico</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="empresa@ejemplo.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Contraseña</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="Mínimo 8 caracteres, mayúscula, minúscula y número"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Confirmar contraseña</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="Repite tu contraseña"
        />
        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">2. Información legal</h3>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">RUC (11 dígitos)</label>
        <input
          type="text"
          name="taxId"
          value={formData.taxId}
          onChange={handleChange}
          maxLength={11}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="20123456789"
        />
        {errors.taxId && <p className="mt-1 text-sm text-red-600">{errors.taxId}</p>}
        <p className="mt-1 text-xs text-gray-500">Debe comenzar con 10, 15, 16, 17 o 20</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Razón social</label>
        <input
          type="text"
          name="legalName"
          value={formData.legalName}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="Empresa S.A.C."
        />
        {errors.legalName && <p className="mt-1 text-sm text-red-600">{errors.legalName}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Nombre comercial (opcional)</label>
        <input
          type="text"
          name="tradeName"
          value={formData.tradeName}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="Mi Empresa"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Sector/Industria</label>
          <select
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <option value="">Seleccionar</option>
            {VALID_INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
          {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tamaño</label>
          <select
            name="companySize"
            value={formData.companySize}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <option value="">Seleccionar</option>
            {COMPANY_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
          {errors.companySize && <p className="mt-1 text-sm text-red-600">{errors.companySize}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">País</label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Ciudad</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Lima"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Sitio web (opcional)</label>
        <input
          type="url"
          name="websiteUrl"
          value={formData.websiteUrl}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="https://www.ejemplo.com"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Descripción de la empresa (opcional)</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="Breve descripción de tu empresa..."
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">3. Datos del responsable</h3>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Nombre completo</label>
        <input
          type="text"
          name="responsibleName"
          value={formData.responsibleName}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="Juan Pérez"
        />
        {errors.responsibleName && <p className="mt-1 text-sm text-red-600">{errors.responsibleName}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Cargo</label>
        <input
          type="text"
          name="responsiblePosition"
          value={formData.responsiblePosition}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="Gerente de Recursos Humanos"
        />
        {errors.responsiblePosition && <p className="mt-1 text-sm text-red-600">{errors.responsiblePosition}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
        <input
          type="tel"
          name="responsiblePhone"
          value={formData.responsiblePhone}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="+51 987 654 321"
        />
        {errors.responsiblePhone && <p className="mt-1 text-sm text-red-600">{errors.responsiblePhone}</p>}
      </div>

      <div className="rounded-lg bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          <strong>Importante:</strong> Tu empresa quedará en estado "pendiente de verificación" hasta que validemos
          el RUC. Podrás preparar ofertas pero no publicarlas hasta que la verificación esté completa.
        </p>
      </div>
    </div>
  );

  if (successMessage) {
    return (
      <div className="rounded-lg bg-emerald-50 p-6 text-center">
        <div className="mb-4 text-4xl">✓</div>
        <h3 className="mb-2 text-lg font-semibold text-emerald-900">¡Registro completado!</h3>
        <p className="text-emerald-800">{successMessage}</p>
        <p className="mt-4 text-sm text-emerald-700">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderStepIndicator()}

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {(submitError || storeError) && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{submitError || storeError}</div>
      )}

      <div className="flex gap-3 pt-4">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Atrás
          </button>
        )}

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Registrando...' : 'Registrar empresa'}
          </button>
        )}
      </div>

      <p className="text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{' '}
        <button
          type="button"
          onClick={onGoToLogin}
          className="font-medium text-emerald-700 hover:text-emerald-800"
        >
          Inicia sesión
        </button>
      </p>
    </form>
  );
};

export default CompanyRegistrationForm;
