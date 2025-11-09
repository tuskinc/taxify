import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Home, 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Building, 
  Upload, 
  User, 
  LogOut,
  Menu,
  X,
  Calculator
} from 'lucide-react';

interface NavigationProps {
  user: any;
}

const Navigation: React.FC<NavigationProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const sidebarRef = React.useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const sidebarEl = sidebarRef.current;
    if (!sidebarEl) {
      return;
    }

    const getFocusable = (): HTMLElement[] => {
      const selectors = [
        'a[href]',
        'area[href]',
        'input:not([disabled]):not([type="hidden"])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'button:not([disabled])',
        'iframe',
        'object',
        'embed',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ].join(',');
      return Array.from(sidebarEl.querySelectorAll<HTMLElement>(selectors)).filter(
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement
      );
    };

    // Set initial focus to the first focusable element in the sidebar
    const focusables = getFocusable();
    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      // Ensure the sidebar itself is focusable if nothing else is
      sidebarEl.setAttribute('tabindex', '-1');
      sidebarEl.focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key === 'Tab') {
        const items = getFocusable();
        if (items.length === 0) {
          event.preventDefault();
          return;
        }

        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (event.shiftKey) {
          if (!active || active === first || !sidebarEl.contains(active)) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (!active || active === last || !sidebarEl.contains(active)) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) {
      const toRestore = previouslyFocusedRef.current ?? triggerRef.current;
      if (toRestore) {
        toRestore.focus();
      }
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Budget', href: '/budget', icon: DollarSign },
    { name: 'Investments', href: '/investments', icon: TrendingUp },
    { name: 'Tax Optimization', href: '/optimize-tax', icon: Calculator },
    { name: 'Tax Calendar', href: '/tax-calendar', icon: Calendar },
    { name: 'CRM', href: '/crm', icon: Building },
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white p-2 rounded-md shadow-md"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls="mobile-sidebar"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile sidebar */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        >
          <div
            id="mobile-sidebar"
            ref={sidebarRef}
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="p-6">
              <div className="flex items-center mb-8">
                 <div className="h-8 w-8 bg-[#00A8E8] rounded-full flex items-center justify-center">
                   <span className="text-white font-bold text-sm">T</span>
                 </div>
                <span className="ml-3 text-lg font-semibold text-gray-900">Taxify</span>
              </div>

              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.href);
                        setIsOpen(false);
                      }}
                       className={`w-full flex items-center pl-3 pr-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                         isActive(item.href)
                           ? 'bg-[#00A8E8] text-white'
                           : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                       }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-bold text-sm">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center pl-3 pr-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center px-6 py-4">
                 <div className="h-8 w-8 bg-[#00A8E8] rounded-full flex items-center justify-center">
                   <span className="text-white font-bold text-sm">T</span>
                 </div>
            <span className="ml-3 text-lg font-semibold text-gray-900">Taxify</span>
          </div>

          <nav className="flex-1 pl-4 pr-4 py-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                       className={`w-full flex items-center pl-3 pr-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                         isActive(item.href)
                           ? 'bg-[#00A8E8] text-white'
                           : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                       }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="pl-4 pr-4 py-4 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-bold text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center pl-3 pr-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
