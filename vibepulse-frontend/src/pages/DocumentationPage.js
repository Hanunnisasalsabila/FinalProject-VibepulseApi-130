import { Link } from 'react-router-dom';
import { FaHome, FaBook, FaMusic } from 'react-icons/fa';

const DocumentationPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1033] via-[#0f172a] to-[#020617] relative overflow-hidden">
      {/* Animated stars background */}
      <div className="fixed inset-0 pointer-events-none">
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

      {/* Navigation */}
      <nav className="bg-white/5 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <FaBook className="text-2xl text-purple-300 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                VibePulse API Docs
              </span>
            </Link>
            <Link 
              to="/" 
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all group"
            >
              <FaHome className="group-hover:scale-110 transition-transform" />
              <span className="text-purple-200 group-hover:text-white transition-colors">Home</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <FaMusic className="text-5xl text-purple-300 animate-float" />
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                API Documentation
              </h1>
            </div>
          </div>
          <p className="text-xl text-purple-200">Complete guide to using the VibePulse API ✨</p>
        </div>

        <div className="space-y-8">
          <Section title="Authentication">
            <p className="text-purple-200 mb-4">All API requests require an API key in the request header:</p>
            <CodeBlock>{`x-api-key: YOUR_API_KEY`}</CodeBlock>
          </Section>

          <Section title="Get All Songs">
            <p className="text-purple-200 mb-2"><strong className="text-white">Endpoint:</strong> <code className="px-2 py-1 bg-purple-500/20 rounded text-purple-300">GET /api/songs</code></p>
            <p className="text-purple-200 mb-4"><strong className="text-white">Parameters:</strong></p>
            <ul className="list-disc list-inside text-purple-200 mb-4 space-y-1">
              <li><code className="text-purple-300">mood</code> (optional): focus, energetic, chill, motivation</li>
              <li><code className="text-purple-300">limit</code> (optional): Number of results (default: 20)</li>
              <li><code className="text-purple-300">search</code> (optional): Search by title or artist</li>
            </ul>
            <CodeBlock>{`curl -X GET "http://localhost:5000/api/songs?mood=focus&limit=10" \\
  -H "x-api-key: YOUR_API_KEY"`}</CodeBlock>
          </Section>

          <Section title="Get Random Songs">
            <p className="text-purple-200 mb-2"><strong className="text-white">Endpoint:</strong> <code className="px-2 py-1 bg-purple-500/20 rounded text-purple-300">GET /api/songs/random</code></p>
            <CodeBlock>{`curl -X GET "http://localhost:5000/api/songs/random?limit=5" \\
  -H "x-api-key: YOUR_API_KEY"`}</CodeBlock>
          </Section>

          <Section title="Get Songs by Mood">
            <p className="text-purple-200 mb-2"><strong className="text-white">Endpoint:</strong> <code className="px-2 py-1 bg-purple-500/20 rounded text-purple-300">GET /api/songs/mood/:mood</code></p>
            <CodeBlock>{`curl -X GET "http://localhost:5000/api/songs/mood/focus" \\
  -H "x-api-key: YOUR_API_KEY"`}</CodeBlock>
          </Section>

          <Section title="Response Format">
            <CodeBlock>{`{
  "success": true,
  "count": 10,
  "data": [{
    "id": 1,
    "title": "Midnight Study Beats",
    "artist": "Night Coder",
    "mood": "focus",
    "genre": "lofi",
    "file_url": "song-123.mp3",
    "playCount": 42
  }]
}`}</CodeBlock>
          </Section>

          <Section title="Rate Limits">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { plan: 'Free Plan', limit: '100 requests/day', color: 'from-blue-500 to-blue-600' },
                { plan: 'Pro Plan', limit: '10,000 requests/day', color: 'from-purple-500 to-purple-600' },
                { plan: 'Enterprise', limit: 'Unlimited', color: 'from-pink-500 to-pink-600' }
              ].map((tier, index) => (
                <div key={index} className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all group">
                  <div className={`text-lg font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent mb-2`}>
                    {tier.plan}
                  </div>
                  <div className="text-purple-200 text-sm">{tier.limit}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Error Codes">
            <div className="space-y-3">
              {[
                { code: '200', message: 'Success', color: 'text-green-400' },
                { code: '400', message: 'Bad Request', color: 'text-yellow-400' },
                { code: '401', message: 'Unauthorized - Invalid API Key', color: 'text-orange-400' },
                { code: '429', message: 'Too Many Requests - Rate Limit Exceeded', color: 'text-red-400' },
                { code: '500', message: 'Internal Server Error', color: 'text-red-400' }
              ].map((error, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                  <code className={`font-mono font-bold ${error.color}`}>{error.code}</code>
                  <span className="text-purple-200 text-sm">{error.message}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Back to Top */}
        <div className="mt-12 text-center">
          <a 
            href="#top" 
            className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-purple-200 hover:text-white transition-all group"
          >
            <span className="transform group-hover:-translate-y-1 transition-transform">↑</span>
            <span className="ml-2">Back to Top</span>
          </a>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-4 flex items-center">
      <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></span>
      {title}
    </h2>
    {children}
  </div>
);

const CodeBlock = ({ children }) => (
  <div className="bg-black/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 overflow-x-auto group hover:border-purple-400/50 transition-all">
    <pre className="text-sm text-green-300 font-mono">{children}</pre>
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 rounded text-xs text-purple-300 transition-all">
        Copy
      </button>
    </div>
  </div>
);

export default DocumentationPage;