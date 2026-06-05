import { useUiStore, toggleSidebar } from '../../../../store/uiStore';
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { prefetchVendorRoute } from '../../utils/routePrefetch';
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Star,
  Building2,
  BarChart3,
  MessageCircle,
  MessageSquare,
  MessageSquareText,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  ShieldCheck,
  UserCog,
  Users2,
  Headset,
  Store,
  ShoppingCart,
  Image as ImageIcon,
  Clock,
  CheckCircle,
  XCircle,
  FileEdit,
} from 'lucide-react';
import { LogoIcon } from '../../../../data/icons';

const navItems = [
  { path: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },

  { path: '/vendor/subscriptions', label: 'Subscription Plans', icon: CreditCard },

  {
    path: '/vendor/properties',
    label: 'Properties',
    icon: Building2,
    children: [
      { path: '/vendor/properties/list', label: 'All Properties', icon: Building2 },
      { path: '/vendor/properties/pending', label: 'Pending', icon: Clock },
      { path: '/vendor/properties/verified', label: 'Verified', icon: CheckCircle },
      { path: '/vendor/properties/rejected', label: 'Rejected', icon: XCircle },
      { path: '/vendor/properties/draft', label: 'Draft', icon: FileEdit },
    ],
  },
  // { path: '/banners', label: 'Banners', icon: ImageIcon },
  { path: '/vendor/banner-subscriptions', label: 'Banner Ads', icon: ShoppingCart },

  // {
  //   label: 'Staff',
  //   icon: Users2,
  //   children: [
  //     { path: '/staff/roles', label: 'Roles', icon: ShieldCheck },
  //     { path: '/staff/members', label: 'Members', icon: UserCog },
  //   ]
  // },
  // ✅ New Sections
  { path: '/vendor/support', label: 'Support', icon: MessageCircle },
];

const SidebarItem = ({ item, collapsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const Icon = item.icon;
  const hasChildren = !!item.children;
  const isChildrenActive =
    hasChildren && item.children.some((child) => location.pathname.startsWith(child.path));

  useEffect(() => {
    if (isChildrenActive && !collapsed) {
      setIsOpen(true);
    }
  }, [isChildrenActive, collapsed]);

  if (!hasChildren) {
    return (
      <NavLink
        to={item.path}
        end={item.path === '/'}
        onMouseEnter={() => prefetchVendorRoute(item.path)}
        onFocus={() => prefetchVendorRoute(item.path)}
        className={({ isActive }) =>
          `flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-md font-semibold transition-colors ${
            isActive
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          } ${collapsed ? 'justify-center px-0' : ''}`
        }
        title={collapsed ? item.label : ''}
      >
        <Icon size={18} className="flex-shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    );
  }

  // Header (parent item with children)
  return (
    <div className="flex flex-col gap-1 w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-md font-semibold transition-all ${
          isChildrenActive
            ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
        } ${collapsed ? 'justify-center px-0' : ''}`}
        title={collapsed ? item.label : ''}
      >
        <Icon size={18} className="flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronRight
              size={14}
              className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
            />
          </>
        )}
      </button>

      {!collapsed && (
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-1 pl-4 pr-1">
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              return (
                <NavLink
                  key={child.path}
                  to={child.path}
                  onMouseEnter={() => prefetchVendorRoute(child.path)}
                  onFocus={() => prefetchVendorRoute(child.path)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-semibold transition-all ${
                      isActive
                        ? 'text-primary bg-primary/10 border-l-2 border-primary pl-4'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <ChildIcon size={15} className="flex-shrink-0" />
                  <span>{child.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <aside
      className={`bg-white flex flex-col fixed top-0 left-0 h-full z-30 border-r border-slate-200 transition-all duration-500 ease-in-out ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Logo → Dashboard */}
      <NavLink
        to="/vendor/dashboard"
        end
        onMouseEnter={() => prefetchVendorRoute('/vendor/dashboard')}
        onFocus={() => prefetchVendorRoute('/vendor/dashboard')}
        title="Go to dashboard"
        className={({ isActive }) =>
          `flex h-20 w-full items-center border-b border-slate-100 transition-colors hover:bg-slate-50 ${collapsed ? 'justify-center px-0' : 'px-6'} ${isActive ? 'bg-slate-50' : ''}`
        }
      >
        {!collapsed ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-md flex items-center justify-center shrink-0">
              <LogoIcon className="h-9 w-9 shrink-0 text-[#023526]" />
            </div>
            <div className="min-w-0">
              <p className="text-md font-semibold text-slate-900 leading-tight">
                Yukthi <span className="text-primary">Properties</span>
              </p>
              <p className="text-md font-medium text-slate-500 mt-1">Seller panel</p>
            </div>
          </div>
        ) : (
          <div className="h-11 w-11 rounded-md flex items-center justify-center mx-auto">
            <LogoIcon className="h-9 w-9 shrink-0 text-[#023526]" />
          </div>
        )}
      </NavLink>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
            Main Menu
          </p>
        )}
        {navItems.map((item, index) => (
          <SidebarItem key={item.path || index} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-2 pb-4">
        <button
          onClick={() => toggleSidebar()}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-150 text-xs"
        >
          {collapsed ? (
            <ChevronRight size={14} />
          ) : (
            <>
              <ChevronLeft size={14} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
