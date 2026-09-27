import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import sproutLogo from '../../assets/branding/sprout-logo.png';
import sproutWordmark from '../../assets/branding/sprout-wordmark.png';

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, activeRole, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: 'dashboard',
      roles: [ROLES.FARMER, ROLES.FIELD_AGENT, ROLES.KRISHI_ADHIKARI],
    },
    {
      name: 'Live Rover',
      path: '/rover',
      icon: 'precision_manufacturing',
      roles: [ROLES.FARMER, ROLES.FIELD_AGENT, ROLES.KRISHI_ADHIKARI],
    },
    {
      name: 'AI Detection',
      path: '/ai-diagnostics',
      icon: 'psychology',
      roles: [ROLES.FARMER, ROLES.FIELD_AGENT, ROLES.KRISHI_ADHIKARI],
    },
    {
      name: 'Expert Validation',
      path: '/validation',
      icon: 'local_police',
      roles: [ROLES.FARMER, ROLES.FIELD_AGENT, ROLES.KRISHI_ADHIKARI],
      badge: activeRole === ROLES.KRISHI_ADHIKARI ? 'Review Queue' : null,
    },
    {
      name: 'Field Map',
      path: '/map',
      icon: 'map',
      roles: [ROLES.FARMER, ROLES.FIELD_AGENT, ROLES.KRISHI_ADHIKARI],
    },
    {
      name: 'Crop Health',
      path: '/crop-health',
      icon: 'potted_plant',
      roles: [ROLES.FARMER, ROLES.FIELD_AGENT, ROLES.KRISHI_ADHIKARI],
    },
    {
      name: 'Irrigation',
      path: '/irrigation',
      icon: 'water_drop',
      roles: [ROLES.FARMER, ROLES.FIELD_AGENT, ROLES.KRISHI_ADHIKARI],
    },
    {
      name: 'Risk Monitor',
      path: '/risks',
      icon: 'warning',
      roles: [ROLES.FARMER, ROLES.FIELD_AGENT, ROLES.KRISHI_ADHIKARI],
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: 'summarize',
      roles: [ROLES.FARMER, ROLES.FIELD_AGENT, ROLES.KRISHI_ADHIKARI],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-surface-container-highest dark:bg-inverse-surface text-primary dark:text-primary-fixed-dim flex flex-col border-r border-outline-variant shrink-0 transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header Branding */}
        <div className="p-gutter border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <img src={sproutLogo} alt="SPROUT Logo" className="w-9 h-9 object-contain shrink-0" />
            <div className="flex flex-col justify-center min-w-0">
              <img src={sproutWordmark} alt="SPROUT" className="h-6 object-contain object-left max-w-[125px]" />
              <p className="font-label-md text-[10px] text-on-surface-variant opacity-80 truncate">
                Smart Farm Rover AI
              </p>
            </div>
          </div>
          <button
            className="md:hidden text-on-surface-variant p-1"
            onClick={() => setMobileOpen(false)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Role Switcher Pills */}
        <div className="px-sm pt-sm pb-xs">
          <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider px-2 mb-1">
            Active Role:
          </div>
          <div className="grid grid-cols-3 gap-1 bg-surface-container-low p-1 rounded-md border border-outline-variant text-[10px]">
            <button
              onClick={() => switchRole(ROLES.FARMER)}
              className={`py-1 rounded font-semibold text-center truncate transition-colors ${
                activeRole === ROLES.FARMER
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              Farmer
            </button>
            <button
              onClick={() => switchRole(ROLES.FIELD_AGENT)}
              className={`py-1 rounded font-semibold text-center truncate transition-colors ${
                activeRole === ROLES.FIELD_AGENT
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              Agent
            </button>
            <button
              onClick={() => switchRole(ROLES.KRISHI_ADHIKARI)}
              className={`py-1 rounded font-semibold text-center truncate transition-colors ${
                activeRole === ROLES.KRISHI_ADHIKARI
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              Adhikari
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-xs">
          <ul className="flex flex-col gap-xs px-sm">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-md py-2 rounded transition-all font-label-md text-label-md ${
                      isActive
                        ? 'text-primary font-bold border-r-4 border-primary bg-surface-variant/80 shadow-xs'
                        : 'text-on-surface-variant hover:bg-surface-variant'
                    }`
                  }
                >
                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-[20px]">
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-tertiary-container text-on-tertiary-container text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <div className="p-md border-t border-outline-variant">
          <button
            onClick={() => navigate('/rover')}
            className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-2 rounded transition-colors flex items-center justify-center gap-sm shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            Deploy Rover
          </button>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-outline-variant py-xs">
          <div className="px-gutter flex items-center gap-sm p-sm rounded hover:bg-surface-variant mx-sm transition-colors cursor-pointer">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover border border-outline-variant"
            />
            <div className="flex-1 min-w-0">
              <p className="font-label-md text-label-md text-on-surface truncate">
                {user?.name}
              </p>
              <p className="font-body-sm text-[10px] text-on-surface-variant truncate">
                {user?.roleTitle}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Log Out"
              className="text-on-surface-variant hover:text-error p-1 rounded"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
