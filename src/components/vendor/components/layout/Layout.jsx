import { useUiStore } from '../../../../store/uiStore';
import { useAuthStore, getMe } from '../../../../store/authStore';
import { isSellerUserType } from '../../../../utils/isSellerUserType';
import { useEffect, Suspense, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../../../Loader/Loader';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../../index.css'; // Import vendor-specific CSS

export default function Layout() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const location = useLocation();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);
  const [authReady, setAuthReady] = useState(false);

  const canAccessVendorPanel = isLoggedIn && isSellerUserType(user?.type);
  const redirectTo = !canAccessVendorPanel ? (isLoggedIn ? '/' : '/subscription') : null;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (isLoggedIn) {
        try {
          await getMe();
        } catch {
          /* session may be invalid — redirect handled below */
        }
      }
      if (!cancelled) setAuthReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    // Add vendor-panel class to body to trigger specific resets
    document.body.classList.add('vendor-panel');
    // Set base font size to 14px to match admin panel
    document.documentElement.style.fontSize = '14px';

    return () => {
      document.body.classList.remove('vendor-panel');
      // Reset font size when leaving vendor portal
      document.documentElement.style.fontSize = '';
    };
  }, []);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader text="Loading seller panel..." />
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Topbar />
      <main
        className={`transition-[margin] duration-200 ease-in-out pt-20 min-h-screen ${collapsed ? 'ml-20' : 'ml-64'}`}
      >
        <div className="p-5">
          <Suspense
            fallback={
              <div className="flex min-h-[50vh] items-center justify-center py-16">
                <Loader text="Loading page..." />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
