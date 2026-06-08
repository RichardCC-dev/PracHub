import '@testing-library/jest-dom';

// Mock global de fetch para tests (evita llamadas HTTP reales)
globalThis.fetch = vi.fn();

// Mock de react-router-dom useNavigate
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', state: null }),
    BrowserRouter: ({ children }) => children,
  };
});

// Limpiar mocks entre tests
afterEach(() => {
  vi.clearAllMocks();
});
