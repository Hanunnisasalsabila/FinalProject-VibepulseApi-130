import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiKeysAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import NightSkyBackground from '../../components/NightSkyBackground';
import { FaKey, FaChartLine, FaClock, FaRocket, FaBook, FaPlay, FaMusic } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalKeys: 0,
    activeKeys: 0,
    totalRequests: 0,
    todayRequests: 0,
    remainingQuota: 100,
  });
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiKeysAPI.getAll();
      const keys = response.data.data;
      setApiKeys(keys);

      const activeKeys = keys.filter(k => k.status === 'active');
      const totalRequests = keys.reduce((sum, k) => sum + k.totalRequests, 0);
      const todayRequests = keys.reduce((sum, k) => sum + k.usedToday, 0);
      const remainingQuota = activeKeys.length > 0 
        ? activeKeys[0].dailyQuota - activeKeys[0].usedToday 
        : 0;

      setStats({
        totalKeys: keys.length,
        activeKeys: activeKeys.length,
        totalRequests,
        todayRequests,
        remainingQuota,
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background with Moon & Stars */}
        <NightSkyBackground />
        
        <div className="relative flex items-center justify-center min-h-screen" style={{ zIndex: 10 }}>
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin-reverse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 🌙 MOON & STARS BACKGROUND */}
      <NightSkyBackground />
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-6" style={{ zIndex: 10 }}>
        {/* Header with gradient text */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mb-2">
            Welcome back, {user?.username}! ✨
          </h1>
          <p className="text-purple-200 text-lg">Your midnight music API dashboard</p>
        </div>

        {/* Stats Grid with glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FaKey className="text-3xl text-purple-300" />}
            label="Active API Keys"
            value={stats.activeKeys}
            subtext={`${stats.totalKeys} total`}
            gradient="from-purple-500/20 to-purple-600/20"
          />
          <StatCard
            icon={<FaChartLine className="text-3xl text-green-300" />}
            label="Total Requests"
            value={stats.totalRequests.toLocaleString()}
            subtext="All time"
            gradient="from-green-500/20 to-green-600/20"
          />
          <StatCard
            icon={<FaClock className="text-3xl text-blue-300" />}
            label="Today's Usage"
            value={stats.todayRequests}
            subtext={`${stats.remainingQuota} remaining`}
            gradient="from-blue-500/20 to-blue-600/20"
          />
          <StatCard
            icon={<FaRocket className="text-3xl text-pink-300" />}
            label="Current Plan"
            value={user?.plan?.toUpperCase()}
            subtext={`${getQuotaByPlan(user?.plan)}/day`}
            gradient="from-pink-500/20 to-pink-600/20"
          />
        </div>

        {/* Quick Actions with hover effects */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8 hover:bg-white/10 transition-all">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionCard
              to="/api-keys"
              icon={<FaKey className="text-2xl" />}
              title="Manage API Keys"
              description="Generate or revoke keys"
              color="from-purple-500 to-purple-600"
            />
            <QuickActionCard
              to="/music"
              icon={<FaMusic className="text-2xl" />}
              title="Music Library"
              description="Browse midnight tracks"
              color="from-pink-500 to-purple-500"
              badge="New!"
            />
            <QuickActionCard
              to="/api-keys"
              icon={<FaPlay className="text-2xl" />}
              title="API Playground"
              description="Test API endpoints"
              color="from-blue-500 to-purple-500"
            />
          </div>
        </div>

        {/* Recent API Keys */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></span>
              Your API Keys
            </h2>
            <Link to="/api-keys" className="text-purple-300 hover:text-white font-semibold transition-colors flex items-center group">
              View All 
              <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {apiKeys.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <FaKey className="text-6xl text-purple-300/50 mx-auto mb-4 animate-float" />
              <p className="text-purple-200 mb-4 text-lg">You don't have any API keys yet</p>
              <Link 
                to="/api-keys" 
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50"
              >
                Generate Your First API Key
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.slice(0, 3).map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                      key.status === 'active' ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'
                    }`}></div>
                    <div>
                      <p className="font-semibold text-white">{key.name}</p>
                      <p className="text-sm text-purple-300 font-mono">{key.key}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">
                      {key.usedToday} / {key.dailyQuota}
                    </p>
                    <p className="text-xs text-purple-300">requests today</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-spin-reverse {
          animation: spin-reverse 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

const StatCard = ({ icon, label, value, subtext, gradient }) => (
  <div className={`bg-gradient-to-br ${gradient} backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-105 transition-all cursor-pointer group`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-purple-200 mb-2">{label}</p>
        <p className="text-4xl font-bold text-white mb-1 group-hover:scale-110 transition-transform">{value}</p>
        <p className="text-sm text-purple-300">{subtext}</p>
      </div>
      <div className="opacity-80 group-hover:scale-110 group-hover:rotate-12 transition-all">{icon}</div>
    </div>
  </div>
);

const QuickActionCard = ({ to, icon, title, description, color, badge }) => (
  <Link
    to={to}
    className="relative flex items-center space-x-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group overflow-hidden"
  >
    {/* Gradient overlay on hover */}
    <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
    
    <div className={`relative w-14 h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <div className="relative flex-1">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-white group-hover:text-purple-200 transition-colors">{title}</h3>
        {badge && (
          <span className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-purple-500 text-xs rounded-full font-bold animate-pulse">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-purple-300">{description}</p>
    </div>
    <div className="relative transform group-hover:translate-x-1 transition-transform text-purple-300">→</div>
  </Link>
);

const getQuotaByPlan = (plan) => {
  const quotas = { free: '100', pro: '10K', enterprise: 'Unlimited' };
  return quotas[plan] || '100';
};

export default Dashboard;