import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1033] via-[#0f172a] to-[#020617] flex items-center justify-center relative overflow-hidden">
        {/* Animated stars background */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
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

        {/* Constellation Loader */}
        <div className="relative">
          {/* Rotating constellation */}
          <div className="relative w-32 h-32 animate-spin-slow">
            {/* Constellation points */}
            {[0, 60, 120, 180, 240, 300].map((angle, index) => {
              const radian = (angle * Math.PI) / 180;
              const x = Math.cos(radian) * 50;
              const y = Math.sin(radian) * 50;
              
              return (
                <div
                  key={index}
                  className="absolute w-3 h-3 bg-purple-400 rounded-full animate-pulse"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)',
                    animationDelay: `${index * 0.2}s`,
                    boxShadow: '0 0 10px rgba(192, 132, 252, 0.8)'
                  }}
                />
              );
            })}

            {/* Connecting lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ transform: 'translate(-50%, -50%)', left: '50%', top: '50%' }}>
              {[0, 60, 120, 180, 240, 300].map((angle, index) => {
                const nextIndex = (index + 1) % 6;
                const angle1 = (angle * Math.PI) / 180;
                const angle2 = (([0, 60, 120, 180, 240, 300][nextIndex]) * Math.PI) / 180;
                
                const x1 = Math.cos(angle1) * 50 + 64;
                const y1 = Math.sin(angle1) * 50 + 64;
                const x2 = Math.cos(angle2) * 50 + 64;
                const y2 = Math.sin(angle2) * 50 + 64;
                
                return (
                  <line
                    key={index}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(192, 132, 252, 0.5)"
                    strokeWidth="1"
                    className="animate-pulse"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  />
                );
              })}
            </svg>
          </div>

          {/* Center glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-purple-400 rounded-full animate-pulse" style={{ boxShadow: '0 0 20px rgba(192, 132, 252, 1)' }}></div>
          </div>

          {/* Loading text */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <p className="text-purple-200 text-sm animate-pulse">Loading midnight music...</p>
          </div>
        </div>

        <style>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }

          .animate-spin-slow {
            animation: spin-slow 4s linear infinite;
          }

          .animate-twinkle {
            animation: twinkle 3s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;