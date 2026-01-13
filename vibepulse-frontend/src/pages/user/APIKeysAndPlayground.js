import { useState, useEffect } from 'react';
import { apiKeysAPI, songsAPI } from '../../services/api';
import { FaKey, FaPlus, FaCopy, FaSync, FaCheck, FaPlay } from 'react-icons/fa';
import { toast } from 'react-toastify';
import NightSkyBackground from '../../components/NightSkyBackground';

const APIKeysAndPlayground = () => {
  // API Keys State
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Playground State
  const [selectedKey, setSelectedKey] = useState('');
  const [endpoint, setEndpoint] = useState('/api/songs');
  const [method, setMethod] = useState('GET');
  const [params, setParams] = useState({
    mood: '',
    limit: '10',
    search: '',
  });
  const [response, setResponse] = useState(null);
  const [testing, setTesting] = useState(false);
  const [responseTime, setResponseTime] = useState(0);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  useEffect(() => {
    // Auto-select first active key for playground
    if (apiKeys.length > 0 && !selectedKey) {
      setSelectedKey(apiKeys[0].key);
    }
  }, [apiKeys, selectedKey]);

  const fetchApiKeys = async () => {
    try {
      const res = await apiKeysAPI.getAll();
      setApiKeys(res.data.data);
    } catch (error) {
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await apiKeysAPI.generate({ name: 'My VibePulse App' });
      toast.success('API key generated successfully!');
      fetchApiKeys();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate API key');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async (id, name) => {
    if (!window.confirm(`Regenerate "${name}"? The old key will stop working immediately.`)) {
      return;
    }

    try {
      await apiKeysAPI.regenerate(id);
      toast.success('API key regenerated successfully');
      fetchApiKeys();
    } catch (error) {
      toast.error('Failed to regenerate API key');
    }
  };

  const copyToClipboard = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    toast.success('API key copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTest = async () => {
    if (!selectedKey) {
      toast.error('Please select an API key');
      return;
    }

    setTesting(true);
    setResponse(null);
    const startTime = Date.now();

    try {
      let res;
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== '')
      );

      if (endpoint === '/api/songs') {
        res = await songsAPI.getAll(cleanParams, selectedKey);
      } else if (endpoint === '/api/songs/moods') {
        res = await songsAPI.getMoods(selectedKey);
      } else if (endpoint === '/api/songs/random') {
        res = await songsAPI.getRandom(cleanParams, selectedKey);
      }

      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      setResponse({
        status: res.status,
        data: res.data
      });
      toast.success('Request successful!');
    } catch (error) {
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      setResponse({
        status: error.response?.status || 500,
        data: error.response?.data || { message: 'Request failed' }
      });
      toast.error('Request failed');
    } finally {
      setTesting(false);
    }
  };

  function buildQueryString() {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return query ? `?${query}` : '';
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* 🌙 MOON & STARS BACKGROUND */}
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mb-2">
            API Keys & Playground
          </h1>
          <p className="text-purple-200 text-lg">Manage your keys and test endpoints in real-time ✨</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* LEFT COLUMN - API Keys (2/5 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* API Key Card or Empty State */}
            {apiKeys.length === 0 ? (
              // 1. KONDISI JIKA BELUM PUNYA KEY (Tombol Generate Muncul Disini)
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center animate-fade-in">
                <FaKey className="text-6xl text-purple-300/50 mx-auto mb-4 animate-float" />
                <h3 className="text-xl font-bold text-white mb-2">No API Keys Yet</h3>
                <p className="text-purple-200 mb-6 text-sm">Generate your first key to start testing</p>
                <button 
                  onClick={handleGenerate} 
                  disabled={generating}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50 disabled:opacity-50"
                >
                  {generating ? 'Creating...' : 'Generate API Key'}
                </button>
              </div>
            ) : (
              <>
                {/* 2. KONDISI JIKA SUDAH PUNYA KEY (Tampilkan Key Saja) */}
                {apiKeys.map((key) => (
                  <div key={key.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">{key.name}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-300 border border-green-400/30">
                        Active
                      </span>
                    </div>

                    {/* API Key Display */}
                    <div className="flex items-center space-x-2 mb-4">
                      <code className="flex-1 bg-black/30 backdrop-blur-sm border border-white/10 px-3 py-2 rounded-xl font-mono text-xs text-purple-200 break-all">
                        {key.key}
                      </code>
                      <button
                        onClick={() => copyToClipboard(key.key, key.id)}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all flex-shrink-0"
                        title="Copy"
                      >
                        {copiedKey === key.id ? (
                          <FaCheck className="text-green-400" />
                        ) : (
                          <FaCopy className="text-purple-300" />
                        )}
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-purple-300">Total Requests</p>
                        <p className="text-lg font-bold text-white">{key.totalRequests}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-purple-300">Today</p>
                        <p className="text-lg font-bold text-white">{key.usedToday} / {key.dailyQuota}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRegenerate(key.id, key.name)}
                        className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-semibold transition-all flex items-center justify-center space-x-2"
                      >
                        <FaSync className="text-purple-300" />
                        <span>Regenerate</span>
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* RIGHT COLUMN - Playground (3/5 width) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <FaPlay className="mr-3 text-purple-300" />
                API Playground
              </h2>

              {/* API Key Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-purple-200 mb-2">
                  Active API Key
                </label>
                <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 font-mono text-sm flex items-center justify-between">
                  {apiKeys.length > 0 ? (
                    <>
                      <span className="text-purple-300 font-bold">{apiKeys[0].name}</span>
                      <span className="opacity-50">
                        {apiKeys[0].key.substring(0, 25)}...
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-500 italic">No Active Key Found</span>
                  )}
                </div>
              </div>

              {/* Endpoint Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-purple-200 mb-2">
                  Endpoint
                </label>
                <select
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="/api/songs" className="bg-[#1a1033]">GET /api/songs</option>
                  <option value="/api/songs/moods" className="bg-[#1a1033]">GET /api/songs/moods</option>
                  <option value="/api/songs/random" className="bg-[#1a1033]">GET /api/songs/random</option>
                </select>
              </div>

              {/* Parameters */}
              {(endpoint === '/api/songs' || endpoint === '/api/songs/random') && (
                <div className="mb-6 space-y-4">
                  <label className="block text-sm font-semibold text-purple-200">
                    Parameters
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-purple-300 mb-1">Mood</label>
                      <select
                        value={params.mood}
                        onChange={(e) => setParams({ ...params, mood: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="" className="bg-[#1a1033]">All</option>
                        <option value="focus" className="bg-[#1a1033]">Focus</option>
                        <option value="energetic" className="bg-[#1a1033]">Energetic</option>
                        <option value="chill" className="bg-[#1a1033]">Chill</option>
                        <option value="motivation" className="bg-[#1a1033]">Motivation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-purple-300 mb-1">Limit</label>
                      <input
                        type="number"
                        value={params.limit}
                        onChange={(e) => setParams({ ...params, limit: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="1"
                        max="100"
                      />
                    </div>
                    
                    {/* Input Search hanya relevan untuk /api/songs, tapi tidak apa-apa muncul di random (akan diabaikan backend) */}
                    <div className="col-span-2">
                      <label className="block text-xs text-purple-300 mb-1">Search</label>
                      <input
                        type="text"
                        value={params.search}
                        onChange={(e) => setParams({ ...params, search: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Search title or artist..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Request Preview */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-purple-200 mb-2">
                  Request
                </label>
                <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 font-mono text-xs">
                  <div className="text-green-300 mb-2">GET {endpoint}{buildQueryString()}</div>
                  <div className="text-purple-300">x-api-key: {selectedKey ? selectedKey.substring(0, 30) + '...' : 'Not selected'}</div>
                </div>
              </div>

              {/* Test Button */}
              <button
                onClick={handleTest}
                disabled={testing || !selectedKey}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <FaPlay />
                <span>{testing ? 'Testing...' : 'Send Request'}</span>
              </button>

              {/* Response */}
              {response && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-purple-200">
                      Response
                    </label>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className={`px-3 py-1 rounded-full font-bold ${
                        response.status >= 200 && response.status < 300
                          ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                          : 'bg-red-500/20 text-red-300 border border-red-400/30'
                      }`}>
                        {response.status}
                      </span>
                      <span className="text-purple-300">{responseTime}ms</span>
                    </div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 font-mono text-xs text-green-300 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap break-all">
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
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

export default APIKeysAndPlayground;