import { useEffect } from 'react';
import { BrowserRouter as Router, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/ScrollToTop';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { websiteRoutes } from './routes/websiteRoutes';
import { requestNotificationPermission, firebaseOnMessage } from './service/firebaseNotifications';
import { useAuthStore, openLoginModal } from './store/authStore';
import { SearchProvider } from './context/SearchContext';

export default function App() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('showLogin') === 'true') {
      openLoginModal();
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      requestNotificationPermission();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    firebaseOnMessage().then((payload) => {
      console.log('Foreground message received:', payload);
    });
  }, []);

  return (
    <Router>
      <SearchProvider>
        <ScrollToTop />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: { fontSize: '13px', fontWeight: 600, borderRadius: '10px' },
            success: {
              style: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
            },
            error: {
              style: { background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3' },
            },
          }}
        />
        <Login />
        <Register />
        <Routes>
          {websiteRoutes}
        </Routes>
      </SearchProvider>
    </Router>
  );
}
