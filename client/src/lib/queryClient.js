import { QueryClient } from '@tanstack/react-query';

/**
 * Instancia singleton del QueryClient de TanStack Query.
 *
 * Se extrae a su propio módulo para que el authStore pueda limpiar la caché
 * al hacer logout (evita que el siguiente usuario vea data cacheada del anterior).
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,       // 2 minutos antes de refetch
      retry: 1,                         // 1 reintento en caso de error
      refetchOnWindowFocus: false,      // No refetch al enfocar ventana
    },
  },
});

export default queryClient;
