import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FaUser, FaBan, FaCheck, FaTrash, FaCrown } from 'react-icons/fa';
import { toast } from 'react-toastify';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers({ search });
      setUsers(response.data.data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (id, username) => {
    if (!window.confirm(`Block user "${username}"?`)) return;
    try {
      await adminAPI.blockUser(id);
      toast.success('User blocked');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to block user');
    }
  };

  const handleUnblock = async (id, username) => {
    try {
      await adminAPI.unblockUser(id);
      toast.success('User unblocked');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to unblock user');
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Moon Background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black"></div>
        
        {/* Moon */}
        <div className="absolute top-20 right-20 w-64 h-64">
          <div className="relative w-full h-full animate-float-slow">
            {/* Moon glow */}
            <div className="absolute inset-0 bg-sky-400/30 rounded-full blur-3xl animate-pulse-slow"></div>
            {/* Moon body */}
            <div className="absolute inset-4 bg-gradient-to-br from-slate-200 to-slate-400 rounded-full shadow-2xl">
              {/* Moon craters */}
              <div className="absolute top-8 left-12 w-8 h-8 bg-slate-500/30 rounded-full"></div>
              <div className="absolute top-20 right-16 w-12 h-12 bg-slate-500/20 rounded-full"></div>
              <div className="absolute bottom-16 left-16 w-6 h-6 bg-slate-500/40 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Floating Stars */}
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
        <div className="absolute top-2/3 left-2/3 w-1 h-1 bg-white animate-shooting-star" style={{ animationDelay: '8s' }}></div>

        {/* Floating Clouds */}
        <div className="absolute bottom-20 left-0 w-full h-32 opacity-10">
          <div className="absolute bottom-0 left-0 w-64 h-24 bg-slate-400 rounded-full blur-2xl animate-cloud-slow"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-20 bg-slate-500 rounded-full blur-2xl animate-cloud-medium"></div>
          <div className="absolute bottom-0 right-0 w-72 h-28 bg-slate-400 rounded-full blur-2xl animate-cloud-fast"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-8" style={{ zIndex: 10 }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="animate-fade-in">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-200 via-sky-200 to-slate-200 bg-clip-text text-transparent mb-2 animate-gradient">
              User Management
            </h1>
            <p className="text-slate-300 text-lg flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-sky-400 rounded-full animate-pulse"></span>
              {users.length} total users
            </p>
          </div>
          
          <div className="relative group animate-slide-in">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
              className="w-full md:w-80 px-6 py-4 bg-slate-800/50 backdrop-blur-xl border-2 border-slate-700/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/50 transition-all shadow-lg group-hover:shadow-xl group-hover:shadow-sky-500/20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/0 via-sky-500/10 to-sky-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 animate-fade-in">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-slate-400 border-t-transparent rounded-full animate-spin-reverse"></div>
              <div className="absolute inset-3 w-14 h-14 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/40 backdrop-blur-2xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl hover:shadow-sky-500/10 transition-all duration-500 animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/50">
                    <th className="text-left py-5 px-6 font-bold text-sky-200 tracking-wide">User</th>
                    <th className="text-left py-5 px-6 font-bold text-sky-200 tracking-wide">Role</th>
                    <th className="text-left py-5 px-6 font-bold text-sky-200 tracking-wide">Plan</th>
                    <th className="text-left py-5 px-6 font-bold text-sky-200 tracking-wide">Status</th>
                    <th className="text-left py-5 px-6 font-bold text-sky-200 tracking-wide">API Keys</th>
                    <th className="text-left py-5 px-6 font-bold text-sky-200 tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr 
                      key={user.id} 
                      className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-all duration-300 group animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-sky-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-sky-300 transition-colors">{user.username}</p>
                            <p className="text-sm text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        {user.role === 'admin' ? (
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-xl text-sm font-bold border border-red-400/30 shadow-lg shadow-red-500/20 animate-pulse-gentle">
                            <FaCrown className="animate-bounce-gentle" /> Admin
                          </span>
                        ) : (
                          <span className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-xl text-sm font-bold border border-blue-400/30 shadow-lg">Developer</span>
                        )}
                      </td>
                      <td className="py-5 px-6">
                        <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-xl text-sm font-bold border border-emerald-400/30 shadow-lg group-hover:shadow-emerald-500/30 transition-shadow">{user.plan}</span>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border shadow-lg transition-all ${
                          user.status === 'active' 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 shadow-emerald-500/20' 
                            : 'bg-red-500/20 text-red-300 border-red-400/30 shadow-red-500/20'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-white font-bold text-lg group-hover:text-sky-300 transition-colors">
                          {user.ApiKeys?.length || 0}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex gap-2">
                          {user.role !== 'admin' && (
                            <>
                              {user.status === 'active' ? (
                                <button
                                  onClick={() => handleBlock(user.id, user.username)}
                                  className="p-3 bg-slate-700/50 hover:bg-amber-500/20 border border-slate-600/50 hover:border-amber-400/50 rounded-xl transition-all group/btn hover:scale-110 shadow-lg hover:shadow-amber-500/30"
                                  title="Block user"
                                >
                                  <FaBan className="text-amber-300 group-hover/btn:animate-spin-once" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUnblock(user.id, user.username)}
                                  className="p-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded-xl transition-all group/btn hover:scale-110 shadow-lg shadow-emerald-500/20"
                                  title="Unblock user"
                                >
                                  <FaCheck className="text-emerald-300 group-hover/btn:animate-bounce" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(user.id, user.username)}
                                className="p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl transition-all group/btn hover:scale-110 shadow-lg shadow-red-500/20"
                                title="Delete user"
                              >
                                <FaTrash className="text-red-300 group-hover/btn:animate-shake" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
          0% {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateX(300px) translateY(300px);
            opacity: 0;
          }
        }

        @keyframes cloud-slow {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(100vw); }
        }

        @keyframes cloud-medium {
          0% { transform: translateX(-150px); }
          100% { transform: translateX(100vw); }
        }

        @keyframes cloud-fast {
          0% { transform: translateX(-80px); }
          100% { transform: translateX(100vw); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-in {
          from { 
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes pulse-gentle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes spin-once {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .animate-shooting-star { animation: shooting-star 3s linear infinite; }
        .animate-cloud-slow { animation: cloud-slow 60s linear infinite; }
        .animate-cloud-medium { animation: cloud-medium 45s linear infinite; }
        .animate-cloud-fast { animation: cloud-fast 30s linear infinite; }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-in { animation: slide-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.4s ease-out; }
        .animate-spin-reverse { animation: spin-reverse 1.5s linear infinite; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-pulse-gentle { animation: pulse-gentle 2s ease-in-out infinite; }
        .animate-bounce-gentle { animation: bounce-gentle 1.5s ease-in-out infinite; }
        .animate-spin-once { animation: spin-once 0.5s ease-out; }
        .animate-shake { animation: shake 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default UsersPage;