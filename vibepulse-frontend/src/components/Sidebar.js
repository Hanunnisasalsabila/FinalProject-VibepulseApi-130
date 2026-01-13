import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaKey, FaMusic, FaUsers, FaChartBar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const userMenuItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/api-keys', icon: FaKey, label: 'API Keys' },
    { path: '/music', icon: FaMusic, label: 'Music Library' }
  ];

  const adminMenuItems = [
    { path: '/admin', icon: FaHome, label: 'Dashboard' },
    { path: '/admin/users', icon: FaUsers, label: 'Users' },
    { path: '/admin/songs', icon: FaMusic, label: 'Songs' }
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  // Conditional colors based on role
  const colors = isAdmin ? {
    // ADMIN - Deep Navy Theme
    bgGradient: 'from-slate-900 via-slate-950 to-slate-950',
    border: 'border-slate-700/50',
    glowBall1: 'bg-sky-500',
    glowBall2: 'bg-sky-600',
    activeGradient: 'from-slate-600 via-slate-500 to-sky-500',
    activeShadow: 'shadow-sky-500/50',
    activeGlow: 'from-slate-600 to-sky-500',
    inactiveText: 'text-slate-300',
    badgeGradient: 'from-sky-400 to-sky-500'
  } : {
    // USER - Purple Theme (Original)
    bgGradient: 'from-[#1a1033] via-[#0f172a] to-[#020617]',
    border: 'border-purple-500/20',
    glowBall1: 'bg-purple-500',
    glowBall2: 'bg-purple-600',
    activeGradient: 'from-purple-500 to-purple-600',
    activeShadow: 'shadow-purple-500/50',
    activeGlow: 'from-purple-500 to-purple-600',
    inactiveText: 'text-gray-300',
    badgeGradient: 'from-purple-400 to-purple-500'
  };

  return (
    <div className={`w-64 bg-gradient-to-b ${colors.bgGradient} text-white h-screen fixed left-0 top-0 pt-20 shadow-2xl border-r ${colors.border} overflow-hidden z-[100]`}>
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3
            }}
          />
        ))}
      </div>

      {/* Gradient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className={`absolute w-32 h-32 ${colors.glowBall1} rounded-full blur-3xl -top-16 -left-16 animate-pulse`}></div>
        <div className={`absolute w-32 h-32 ${colors.glowBall2} rounded-full blur-3xl bottom-0 -right-16 animate-pulse`} style={{ animationDelay: '1s' }}></div>
      </div>

      <nav className="space-y-2 px-4 relative z-10">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin' || item.path === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${
                isActive
                  ? `bg-gradient-to-r ${colors.activeGradient} text-white shadow-lg ${colors.activeShadow}`
                  : `${colors.inactiveText} hover:bg-white/10 hover:text-white`
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Animated glow effect for active item */}
                {isActive && (
                  <>
                    <div className={`absolute inset-0 bg-gradient-to-r ${colors.activeGlow} rounded-xl blur-xl opacity-50 animate-pulse`}></div>
                    {/* Floating particles */}
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full animate-float-particle"
                          style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.5}s`
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                {/* Icon with bounce animation when active */}
                <item.icon 
                  className={`text-xl relative z-10 ${
                    isActive 
                      ? 'animate-bounce-gentle' 
                      : 'group-hover:scale-110 group-hover:rotate-12 transition-transform'
                  }`} 
                />
                
                {/* Label */}
                <span className="font-medium relative z-10">{item.label}</span>
                
                {/* Badge */}
                {item.badge && (
                  <span className={`ml-auto px-2 py-1 bg-gradient-to-r ${colors.badgeGradient} text-xs rounded-full font-bold animate-pulse relative z-10 shadow-lg`}>
                    {item.badge}
                  </span>
                )}

                {/* Hover shimmer effect */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Custom Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes float-particle {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100%);
            opacity: 0;
          }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }

        .animate-float-particle {
          animation: float-particle 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;