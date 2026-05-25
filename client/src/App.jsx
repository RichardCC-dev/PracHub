import { useEffect, useMemo, useState } from 'react';
import HomePage from './pages/HomePage';
import StudentOnboardingPage from './pages/StudentOnboardingPage';
import WelcomePage from './pages/WelcomePage';
import useAuthStore from './store/authStore';

const App = () => {
  const { user, token, logout } = useAuthStore();
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);

  const resetToken = searchParams.get('resetToken');
  const verifyToken = searchParams.get('token');

  const [page, setPage] = useState(() => {
    if (resetToken) return 'auth';
    if (verifyToken) return 'verify';
    if (token && user) return 'welcome';
    return 'home';
  });

  const [authInitialView, setAuthInitialView] = useState(resetToken ? 'reset' : 'login');

  useEffect(() => {
    if (verifyToken) {
      fetch(`${process.env.VITE_API_URL || 'http://localhost:4000/api'}/auth/verify-email/${verifyToken}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.token && data.user) {
            localStorage.setItem('prachub_token', data.token);
            useAuthStore.getState().login({ email: data.user.email, password: '' }).catch(() => {
              useAuthStore.setState({ user: data.user, token: data.token });
            });
          }
        })
        .catch(() => {})
        .finally(() => {
          window.history.replaceState({}, '', window.location.pathname);
          setPage(token && user ? 'welcome' : 'home');
        });
    }
  }, [verifyToken, token, user]);

  const goToAuth = (view) => {
    setAuthInitialView(view);
    setPage('auth');
  };

  const handleLoginSuccess = () => setPage('welcome');
  const handleLogout = () => {
    setPage('home');
  };

  if (page === 'welcome' && token && user) {
    return <WelcomePage onLogout={handleLogout} />;
  }

  if (page === 'home') {
    return (
      <HomePage
        onLogin={() => goToAuth('login')}
        onRegister={() => goToAuth('register')}
      />
    );
  }

  return (
    <StudentOnboardingPage
      initialView={authInitialView}
      onGoHome={() => setPage('home')}
      onLoginSuccess={handleLoginSuccess}
    />
  );
};

export default App;
