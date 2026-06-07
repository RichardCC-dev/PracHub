import { useEffect, useState } from 'react';
import useSavedCompanyStore from '../store/savedCompanyStore';

export default function FollowCompanyButton({ companyId, className = '' }) {
  const { isFollowing, followingStatus, isToggling, checkFollowingStatus, toggleFollow } =
    useSavedCompanyStore();
  const [isHovered, setIsHovered] = useState(false);

  // Verificar estado inicial
  useEffect(() => {
    if (companyId && followingStatus[companyId] === undefined) {
      checkFollowingStatus(companyId);
    }
  }, [companyId, followingStatus, checkFollowingStatus]);

  const following = isFollowing(companyId);
  const isLoading = isToggling;

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    try {
      await toggleFollow(companyId);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  // Estilos según estado
  const baseClasses = `
    inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  if (following) {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isLoading}
        className={`
          ${baseClasses}
          ${
            isHovered
              ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 focus:ring-red-500'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500'
          }
          border
          ${className}
        `}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Procesando...
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 mr-2"
              fill={isHovered ? 'none' : 'currentColor'}
              stroke={isHovered ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            {isHovered ? 'Dejar de seguir' : 'Siguiendo'}
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        ${baseClasses}
        bg-white text-gray-700 border-gray-300
        hover:bg-gray-50 hover:border-gray-400
        focus:ring-emerald-500
        border
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Procesando...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          Seguir empresa
        </>
      )}
    </button>
  );
}
