import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaMusic, FaUser, FaSignOutAlt, FaBell } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Conditional colors based on role
  const colors = isAdmin ? {
    // ADMIN - Deep Navy Theme
    bgGradient: 'from-slate-900 via-slate-950 to-slate-900',
    border: 'border-slate-700/50',
    logoIcon: 'text-sky-400',
    logoGlow: 'bg-sky-400',
    logoText: 'from-slate-200 to-sky-200',
    userText: 'text-slate-300',
    badgeBg: 'bg-sky-500/30',
    badgeText: 'text-sky-200',
    badgeBorder: 'border-sky-400/30',
    avatarGradient: 'from-slate-600 to-sky-500',
    avatarShadow: 'shadow-sky-500/50',
    glowLine: 'via-sky-500'
  } : {
    // USER - Purple Theme (Original)
    bgGradient: 'from-[#1a1033] via-[#0f172a] to-[#1a1033]',
    border: 'border-purple-500/20',
    logoIcon: 'text-purple-300',
    logoGlow: 'bg-purple-400',
    logoText: 'from-purple-300 to-pink-300',
    userText: 'text-purple-300',
    badgeBg: 'bg-purple-500/30',
    badgeText: 'text-purple-200',
    badgeBorder: 'border-purple-400/30',
    avatarGradient: 'from-purple-500 to-purple-600',
    avatarShadow: 'shadow-purple-500/50',
    glowLine: 'via-purple-500'
  };

  return (
    // 👇 PERBAIKAN: Tambahkan 'md:ml-64' agar Navbar bergeser ke kanan sidebar
    <nav className={`bg-gradient-to-r ${colors.bgGradient} border-b ${colors.border} sticky top-0 z-40 backdrop-blur-xl shadow-lg md:ml-64 transition-all duration-300`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to={isAdmin ? '/admin' : '/dashboard'} 
            className="flex items-center space-x-2 group"
          >
            <div className="relative">
              <FaMusic className={`text-2xl ${colors.logoIcon} group-hover:scale-110 transition-transform`} />
              <div className={`absolute inset-0 blur-lg ${colors.logoGlow} opacity-0 group-hover:opacity-50 transition-opacity`}></div>
            </div>
            <span className={`text-xl font-bold bg-gradient-to-r ${colors.logoText} bg-clip-text text-transparent`}>
              VibePulse
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            <div className="flex items-center space-x-3 group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{user?.username}</p>
                <p className={`text-xs ${colors.userText}`}>
                  {isAdmin ? 'Administrator' : 'Developer'}
                  <span className={`ml-2 px-2 py-0.5 ${colors.badgeBg} ${colors.badgeText} rounded-full text-xs font-medium border ${colors.badgeBorder}`}>
                    {user?.plan}
                  </span>
                </p>
              </div>
              <div className={`w-10 h-10 bg-gradient-to-br ${colors.avatarGradient} rounded-full flex items-center justify-center text-white font-bold shadow-lg ${colors.avatarShadow} group-hover:scale-110 transition-transform cursor-pointer`}>
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className={`p-2 ${isAdmin ? 'text-slate-300' : 'text-purple-300'} hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all group`}
              title="Logout"
            >
              <FaSignOutAlt className="text-xl group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Animated glow line */}
      <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${colors.glowLine} to-transparent opacity-50`}></div>

      <style>{`
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 0.6s ease-in-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;