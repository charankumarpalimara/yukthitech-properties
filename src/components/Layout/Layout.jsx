import { useEffect, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore, getMe } from '../../store/authStore';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import SupportButton from '../SupportButton/SupportButton';
import Loader from '../Loader/Loader';
import { usePropertiesStore } from '../../store/propertiesStore';
import '../../styles/website.css';

export default function Layout() {
  const user = useAuthStore((s) => s.user);
  const fetchWishlist = usePropertiesStore((state) => state.fetchWishlist);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe();
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = user?._id || user?.id;
    if (token && userId) {
      fetchWishlist(userId);
    }
  }, [fetchWishlist, user?._id, user?.id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, position: 'relative', paddingTop: 'var(--navbar-height)' }}>
        <Suspense
          fallback={
            <div className="min-h-[50vh] flex items-center justify-center">
              <Loader text="Loading..." />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <SupportButton />
    </div>
  );
}
