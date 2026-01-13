import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaBook, FaMusic, FaKey, FaCode, FaExclamationCircle } from 'react-icons/fa';

const DocumentationPage = () => {
  const [activeSection, setActiveSection] = useState('auth');

  // Handle scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['auth', 'endpoints', 'response', 'errors'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-purple-500/30">
      
      {/* 1. BACKGROUND GRADIENT & STARS (VibePulse Theme) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1033] via-[#0f172a] to-[#020617]" />
        {/* Stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5 + 0.2
            }}
          />
        ))}
      </div>

      {/* 2. NAVBAR (FIXED TOP) */}
      <nav className="fixed top-0 inset-x-0 h-16 bg-[#1a1033]/80 backdrop-blur-xl border-b border-white/10 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-full flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
              <FaBook className="text-white text-sm" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
              VibePulse <span className="font-light text-purple-400">Docs</span>
            </span>
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm text-purple-200"
          >
            <FaHome /> Back to Home
          </Link>
        </div>
      </nav>

      {/* 3. LAYOUT CONTAINER */}
      <div className="max-w-[1400px] mx-auto pt-16 relative z-10 flex">
        
        {/* SIDEBAR (FIXED LEFT - TIDAK IKUT SCROLL) */}
        <aside className="fixed top-16 bottom-0 left-0 w-72 bg-[#1a1033]/50 backdrop-blur-md border-r border-white/5 overflow-y-auto hidden lg:block custom-scrollbar">
          <div className="p-8 space-y-8">
            <div>
              <h5 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">Getting Started</h5>
              <ul className="space-y-1">
                <NavItem active={activeSection === 'auth'} onClick={() => scrollToSection('auth')} icon={FaKey}>Authentication</NavItem>
              </ul>
            </div>
            
            <div>
              <h5 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">Song Endpoints</h5>
              <ul className="space-y-1">
                <NavItem active={activeSection === 'endpoints'} onClick={() => scrollToSection('endpoints')} icon={FaMusic}>
                  All Endpoints
                </NavItem>
                <div className="pl-4 border-l border-white/10 ml-4 space-y-2 mt-2">
                  <SubNavItem onClick={() => scrollToSection('get-all')}>List All Songs</SubNavItem>
                  <SubNavItem onClick={() => scrollToSection('get-single')}>Get Single Song</SubNavItem>
                  <SubNavItem onClick={() => scrollToSection('get-random')}>Random Songs</SubNavItem>
                  <SubNavItem onClick={() => scrollToSection('get-mood')}>Filter by Mood</SubNavItem>
                </div>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">Reference</h5>
              <ul className="space-y-1">
                <NavItem active={activeSection === 'response'} onClick={() => scrollToSection('response')} icon={FaCode}>Response Format</NavItem>
                <NavItem active={activeSection === 'errors'} onClick={() => scrollToSection('errors')} icon={FaExclamationCircle}>Errors & Limits</NavItem>
              </ul>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT (SCROLLABLE - ADA MARGIN KIRI SUPAYA GAK KETUTUP SIDEBAR) */}
        <main className="flex-1 lg:ml-72 min-h-screen p-8 lg:p-12 pb-32">
          
          {/* Header Area */}
          <div className="mb-16 animate-fade-in">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
              API Reference
            </h1>
            <p className="text-xl text-purple-200/70 leading-relaxed max-w-3xl">
              Welcome to the VibePulse API documentation. You can use our API to access specific music data endpoints, which can provide information regarding songs, moods, and streaming URLs.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 px-4 py-2 bg-black/30 rounded-lg border border-purple-500/20 text-purple-300 font-mono text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
              Base URL: https://api.vibepulse.dev
            </div>
          </div>

          <div className="space-y-20">
            
            {/* 1. AUTHENTICATION */}
            <section id="auth" className="scroll-mt-32">
              <SectionTitle icon={FaKey} title="Authentication" />
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <p className="text-gray-300 mb-6 text-lg">
                  Authenticate your requests by including your API key in the <code className="text-pink-300">x-api-key</code> header.
                </p>
                <CodeBlock label="Header Example">
                  x-api-key: YOUR_GENERATED_API_KEY
                </CodeBlock>
                <div className="mt-6 flex items-start gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <FaExclamationCircle className="text-purple-400 mt-1 shrink-0" />
                  <p className="text-sm text-purple-200">
                    You can manage and regenerate your API Keys from your Dashboard. Keep them secret!
                  </p>
                </div>
              </div>
            </section>

            {/* 2. SONG ENDPOINTS */}
            <section id="endpoints" className="scroll-mt-32">
              <SectionTitle icon={FaMusic} title="Song Endpoints" />
              
              <div className="grid xl:grid-cols-2 gap-8">
                
                {/* Endpoint 1 */}
                <EndpointCard 
                  id="get-all"
                  method="GET" 
                  path="/api/songs" 
                  title="List All Songs"
                  desc="Retrieve a paginated list of all available tracks."
                >
                   <ParamItem name="mood" type="string" opt>focus, energetic, chill</ParamItem>
                   <ParamItem name="limit" type="number" opt>Default: 20</ParamItem>
                   <CodeBlock small>
{`curl -X GET "https://api.vibepulse.dev/api/songs?mood=focus" \\
  -H "x-api-key: YOUR_KEY"`}
                   </CodeBlock>
                </EndpointCard>

                {/* Endpoint 2 */}
                <EndpointCard 
                  id="get-single"
                  method="GET" 
                  path="/api/songs/:id" 
                  title="Get Specific Song"
                  desc="Get detailed metadata for a single track by ID."
                >
                   <ParamItem name="id" type="string" req>Song ID (e.g. 12)</ParamItem>
                   <div className="mt-4"></div>
                   <CodeBlock small>
{`curl -X GET "https://api.vibepulse.dev/api/songs/12" \\
  -H "x-api-key: YOUR_KEY"`}
                   </CodeBlock>
                </EndpointCard>

                {/* Endpoint 3 */}
                <EndpointCard 
                  id="get-random"
                  method="GET" 
                  path="/api/songs/random" 
                  title="Random Discovery"
                  desc="Get a set of random songs for discovery."
                >
                   <ParamItem name="limit" type="number" opt>Max: 10</ParamItem>
                   <div className="mt-4"></div>
                   <CodeBlock small>
{`curl -X GET "https://api.vibepulse.dev/api/songs/random" \\
  -H "x-api-key: YOUR_KEY"`}
                   </CodeBlock>
                </EndpointCard>

                 {/* Endpoint 4 */}
                 <EndpointCard 
                  id="get-mood"
                  method="GET" 
                  path="/api/songs/mood/:mood" 
                  title="Filter by Mood"
                  desc="Quickly fetch songs matching a specific vibe."
                >
                   <ParamItem name="mood" type="enum" req>focus | chill | energetic</ParamItem>
                   <div className="mt-4"></div>
                   <CodeBlock small>
{`curl -X GET "https://api.vibepulse.dev/api/songs/mood/chill" \\
  -H "x-api-key: YOUR_KEY"`}
                   </CodeBlock>
                </EndpointCard>

              </div>
            </section>

            {/* 3. REFERENCE SECTION */}
            <div className="grid xl:grid-cols-2 gap-8">
              
              {/* Response Format */}
              <section id="response" className="scroll-mt-32">
                <SectionTitle icon={FaCode} title="Response Object" />
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full backdrop-blur-sm">
                  <p className="text-gray-400 mb-4 text-sm">Standard JSON response:</p>
                  <CodeBlock>
{`{
  "success": true,
  "count": 1,
  "data": [{
    "id": 1,
    "title": "Midnight Study",
    "artist": "Night Coder",
    "mood": "focus",
    "url": ".../song.mp3",
    "cover": ".../img.jpg"
  }]
}`}
                  </CodeBlock>
                </div>
              </section>

              {/* Status Codes */}
              <section id="errors" className="scroll-mt-32">
                <SectionTitle icon={FaExclamationCircle} title="Status Codes" />
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden h-full backdrop-blur-sm">
                  <div className="divide-y divide-white/5">
                    <StatusRow code="200" text="OK" desc="Everything worked as expected." color="text-green-400" />
                    <StatusRow code="400" text="Bad Request" desc="Missing parameters or invalid input." color="text-yellow-400" />
                    <StatusRow code="401" text="Unauthorized" desc="Invalid or missing API Key." color="text-orange-400" />
                    <StatusRow code="429" text="Rate Limit" desc="Too many requests. Upgrade plan." color="text-red-400" />
                    <StatusRow code="500" text="Server Error" desc="Something went wrong on our end." color="text-red-400" />
                  </div>
                </div>
              </section>

            </div>

          </div>

           {/* Footer */}
           <footer className="mt-20 pt-8 border-t border-white/10 text-center text-purple-300/40 text-sm">
              <p>VibePulse API Reference • Made with ❤️ by Hanun Nisa Salsabila</p>
           </footer>
        </main>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        
        /* Custom Scrollbar for Sidebar */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.5); }
      `}</style>
    </div>
  );
};

// --- COMPONENTS ---

const NavItem = ({ children, active, onClick, icon: Icon }) => (
  <li 
    onClick={onClick}
    className={`
      flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300
      ${active 
        ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'}
    `}
  >
    {Icon && <Icon className={active ? 'text-pink-400' : 'text-gray-500'} />}
    <span className="font-medium text-sm">{children}</span>
  </li>
);

const SubNavItem = ({ children, onClick }) => (
  <div 
    onClick={onClick} 
    className="text-sm text-gray-500 hover:text-purple-300 cursor-pointer transition-colors py-1 block"
  >
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
      <Icon className="text-2xl text-purple-300" />
    </div>
    <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
  </div>
);

const EndpointCard = ({ id, method, path, title, desc, children }) => (
  <div id={id} className="scroll-mt-32 bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/40 hover:bg-white/[0.07] transition-all flex flex-col group backdrop-blur-sm">
    <div className="flex items-center gap-3 mb-4">
      <span className="px-2.5 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-lg border border-green-500/20 uppercase tracking-wider">
        {method}
      </span>
      <code className="text-sm text-purple-200 font-mono bg-black/20 px-2 py-1 rounded">{path}</code>
    </div>
    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">{title}</h3>
    <p className="text-gray-400 text-sm mb-6 flex-1 leading-relaxed">{desc}</p>
    <div className="space-y-4 pt-4 border-t border-white/5">
      {children}
    </div>
  </div>
);

const ParamItem = ({ name, type, children, req, opt }) => (
  <div className="flex items-baseline gap-3 text-sm border-b border-white/5 pb-2 last:border-0">
    <code className="text-pink-300 font-bold font-mono">{name}</code>
    <span className="text-gray-500 text-xs font-mono px-1.5 py-0.5 bg-white/5 rounded">{type}</span>
    {req && <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded border border-red-400/20">REQ</span>}
    {opt && <span className="text-[10px] text-gray-500 border border-white/10 px-1.5 py-0.5 rounded">OPT</span>}
    <span className="text-gray-400 ml-auto text-xs">{children}</span>
  </div>
);

const StatusRow = ({ code, text, desc, color }) => (
  <div className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
    <code className={`font-mono font-bold ${color} w-12 text-lg`}>{code}</code>
    <div className="flex-1">
      <div className={`font-semibold ${color}`}>{text}</div>
      <div className="text-gray-500 text-xs mt-0.5">{desc}</div>
    </div>
  </div>
);

const CodeBlock = ({ children, label, small }) => (
  <div className="group relative mt-2">
    {label && <div className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">{label}</div>}
    <div className={`
      bg-[#0a0f1d] rounded-xl border border-white/10 overflow-x-auto relative shadow-inner
      ${small ? 'p-4' : 'p-5'}
    `}>
      <pre className={`${small ? 'text-xs' : 'text-sm'} font-mono text-gray-300 leading-relaxed`}>
        {children}
      </pre>
      <button 
        onClick={() => navigator.clipboard.writeText(children)}
        className="absolute top-2 right-2 p-2 bg-white/5 hover:bg-purple-500/20 rounded-lg text-gray-500 hover:text-purple-300 transition-all opacity-0 group-hover:opacity-100"
        title="Copy Code"
      >
        <FaCode />
      </button>
    </div>
  </div>
);

export default DocumentationPage;