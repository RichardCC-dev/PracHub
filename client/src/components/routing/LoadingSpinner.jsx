/**
 * Spinner de pantalla completa utilizado por los route guards
 * mientras el estado de autenticación está siendo verificado.
 *
 * @param {string} [message] - Texto opcional debajo del spinner.
 */
const LoadingSpinner = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      {message && <span className="text-sm text-gray-600">{message}</span>}
    </div>
  </div>
);

export default LoadingSpinner;
