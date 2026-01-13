import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FaUsers, FaKey, FaChartLine, FaMusic } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      setAnalytics(response.data.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Moon Background (same as UsersPage) */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black"></div>
          <div className="absolute top-20 right-20 w-64 h-64">
            <div className="relative w-full h-full animate-float-slow">
              <div className="absolute inset-0 bg-sky-400/30 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-slate-200 to-slate-400 rounded-full shadow-2xl">
                <div className="absolute top-8 left-12 w-8 h-8 bg-slate-500/30 rounded-full"></div>
                <div className="absolute top-20 right-16 w-12 h-12 bg-slate-500/20 rounded-full"></div>
                <div className="absolute bottom-16 left-16 w-6 h-6 bg-slate-500/40 rounded-full"></div>
              </div>
            </div>
          </div>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="relative flex items-center justify-center min-h-screen" style={{ zIndex: 10 }}>
          <div className="relative">
            <div className="w-20 h-20 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-slate-400 border-t-transparent rounded-full animate-spin-reverse"></div>
            <div className="absolute inset-3 w-14 h-14 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black"></div>
        <div className="relative text-center py-20" style={{ zIndex: 10 }}>
          <h2 className="text-3xl font-bold text-red-400 mb-4">Failed to Load Data</h2>
          <p className="text-slate-300 mb-8 text-lg">Make sure the backend server is running on port 5000</p>
          <button 
            onClick={fetchAnalytics} 
            className="px-8 py-4 bg-gradient-to-r from-slate-600 to-sky-500 rounded-2xl font-bold hover:from-slate-700 hover:to-sky-600 transition-all shadow-lg shadow-sky-500/30 hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { overview, topUsers, popularEndpoints, recentCalls } = analytics;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Moon Background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black"></div>
        
        {/* Moon */}
        <div className="absolute top-20 right-20 w-64 h-64">
          <div className="relative w-full h-full animate-float-slow">
            <div className="absolute inset-0 bg-sky-400/30 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute inset-4 bg-gradient-to-br from-slate-200 to-slate-400 rounded-full shadow-2xl">
              <div className="absolute top-8 left-12 w-8 h-8 bg-slate-500/30 rounded-full"></div>
              <div className="absolute top-20 right-16 w-12 h-12 bg-slate-500/20 rounded-full"></div>
              <div className="absolute bottom-16 left-16 w-6 h-6 bg-slate-500/40 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}

        {/* Shooting Stars */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white animate-shooting-star" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white animate-shooting-star" style={{ animationDelay: '5s' }}></div>

        {/* Clouds */}
        <div className="absolute bottom-20 left-0 w-full h-32 opacity-10">
          <div className="absolute bottom-0 left-0 w-64 h-24 bg-slate-400 rounded-full blur-2xl animate-cloud-slow"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-20 bg-slate-500 rounded-full blur-2xl animate-cloud-medium"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-8" style={{ zIndex: 10 }}>
        <div className="mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-200 via-sky-200 to-slate-200 bg-clip-text text-transparent mb-2 animate-gradient">
            Admin Dashboard
          </h1>
          <p className="text-slate-300 text-lg flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-sky-400 rounded-full animate-pulse"></span>
            System overview and statistics ✨
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FaUsers className="text-4xl text-blue-300" />}
            label="Total Users"
            value={overview.totalUsers}
            subtext={`${overview.totalDevelopers} developers`}
            gradient="from-blue-500/20 to-blue-600/30"
            delay="0s"
          />
          <StatCard
            icon={<FaKey className="text-4xl text-sky-300" />}
            label="API Keys"
            value={overview.totalApiKeys}
            subtext={`${overview.activeApiKeys} active`}
            gradient="from-sky-500/20 to-sky-600/30"
            delay="0.1s"
          />
          <StatCard
            icon={<FaChartLine className="text-4xl text-emerald-300" />}
            label="Total Requests"
            value={overview.totalRequests.toLocaleString()}
            subtext={`${overview.todayRequests} today`}
            gradient="from-emerald-500/20 to-emerald-600/30"
            delay="0.2s"
          />
          <StatCard
            icon={<FaMusic className="text-4xl text-purple-300" />}
            label="Total Songs"
            value={overview.totalSongs}
            subtext={`${overview.successRate}% success rate`}
            gradient="from-purple-500/20 to-purple-600/30"
            delay="0.3s"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Top Users */}
          <div className="bg-slate-800/40 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl hover:shadow-sky-500/10 transition-all duration-500 animate-slide-in">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-gradient-to-b from-sky-400 to-sky-600 rounded-full animate-pulse"></span>
              Top Users by API Calls
            </h2>
            <div className="space-y-3">
              {topUsers.map((user, index) => (
                <div 
                  key={user.UserId} 
                  className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/50 rounded-2xl hover:bg-slate-700/50 hover:border-sky-500/50 transition-all duration-300 group animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-sky-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-xs animate-bounce">
                          ⭐
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-sky-300 transition-colors">{user.User?.username}</p>
                      <p className="text-xs text-slate-400">{user.User?.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white text-xl group-hover:text-sky-300 transition-colors">{user.requestCount}</p>
                    <p className="text-xs text-slate-400">requests</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Endpoints */}
          <div className="bg-slate-800/40 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl hover:shadow-sky-500/10 transition-all duration-500 animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full animate-pulse"></span>
              Popular Endpoints (Today)
            </h2>
            <div className="space-y-3">
              {popularEndpoints.map((endpoint, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-2xl hover:bg-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <code className="text-sm font-mono text-sky-200 font-semibold">
                      {endpoint.method} {endpoint.endpoint}
                    </code>
                    <span className="font-bold text-white text-lg">{endpoint.hitCount}</span>
                  </div>
                  <div className="relative w-full bg-slate-600/30 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-sky-500 h-2.5 rounded-full transition-all duration-1000 shadow-lg shadow-emerald-500/50 animate-shimmer"
                      style={{ 
                        width: `${(endpoint.hitCount / popularEndpoints[0].hitCount) * 100}%`,
                        animationDelay: `${index * 0.2}s`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent API Calls */}
        <div className="bg-slate-800/40 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl hover:shadow-sky-500/10 transition-all duration-500 animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full animate-pulse"></span>
            Recent API Calls
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-4 px-4 text-sm font-bold text-sky-200 tracking-wide">User</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-sky-200 tracking-wide">Endpoint</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-sky-200 tracking-wide">Method</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-sky-200 tracking-wide">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-sky-200 tracking-wide">Response Time</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-sky-200 tracking-wide">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentCalls.map((call, index) => (
                  <tr 
                    key={call.id} 
                    className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="py-4 px-4 text-sm text-white font-semibold">{call.User?.username}</td>
                    <td className="py-4 px-4">
                      <code className="text-xs text-sky-300 bg-slate-700/50 px-3 py-1.5 rounded-lg">{call.endpoint}</code>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-bold border border-blue-400/30 shadow-lg">{call.method}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-lg ${
                        call.statusCode >= 200 && call.statusCode < 300
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 shadow-emerald-500/20'
                          : 'bg-red-500/20 text-red-300 border-red-400/30 shadow-red-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          call.statusCode >= 200 && call.statusCode < 300 ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                        }`}></span>
                        {call.statusCode}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-300 font-semibold">{call.responseTime}ms</td>
                    <td className="py-4 px-4 text-sm text-slate-400">
                      {new Date(call.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        @keyframes shooting-star {
          0% { transform: translateX(0) translateY(0); opacity: 1; }
          100% { transform: translateX(300px) translateY(300px); opacity: 0; }
        }

        @keyframes cloud-slow {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(100vw); }
        }

        @keyframes cloud-medium {
          0% { transform: translateX(-150px); }
          100% { transform: translateX(100vw); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .animate-shooting-star { animation: shooting-star 3s linear infinite; }
        .animate-cloud-slow { animation: cloud-slow 60s linear infinite; }
        .animate-cloud-medium { animation: cloud-medium 45s linear infinite; }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-in { animation: slide-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.4s ease-out; }
        .animate-spin-reverse { animation: spin-reverse 1.5s linear infinite; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-shimmer {
          position: relative;
          overflow: hidden;
        }
        .animate-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

const StatCard = ({ icon, label, value, subtext, gradient, delay }) => (
  <div 
    className={`relative bg-gradient-to-br ${gradient} backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-6 hover:scale-105 hover:shadow-2xl hover:shadow-sky-500/20 transition-all duration-500 cursor-pointer group overflow-hidden animate-fade-in`}
    style={{ animationDelay: delay }}
  >
    {/* Shimmer effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-sm text-sky-200 mb-2 font-semibold">{label}</p>
        <p className="text-4xl font-bold text-white mb-1 group-hover:scale-110 transition-transform">{value}</p>
        <p className="text-sm text-slate-300 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"></span>
          {subtext}
        </p>
      </div>
      <div className="opacity-80 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">{icon}</div>
    </div>
  </div>
);

export default AdminDashboard;