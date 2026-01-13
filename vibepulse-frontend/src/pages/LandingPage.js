import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMusic, FaRocket, FaCode, FaPlay, FaHeadphones, FaClock, FaShieldAlt, FaGithub, FaBolt, FaHeart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Animated night sky
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkleDirection: Math.random() > 0.5 ? 1 : -1
      });
    }

    const shootingStars = [];
    
    // FLUFFY CLOUDS! Not ovals!
    const clouds = [];
    for (let i = 0; i < 5; i++) {
      clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.6,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.15 + 0.1,
        // Multiple circles to make fluffy cloud shape
        circles: [
          { offsetX: 0, offsetY: 0, radius: 50 + Math.random() * 20 },
          { offsetX: 40, offsetY: -10, radius: 40 + Math.random() * 15 },
          { offsetX: -40, offsetY: -5, radius: 45 + Math.random() * 15 },
          { offsetX: 70, offsetY: 5, radius: 35 + Math.random() * 10 },
          { offsetX: -70, offsetY: 10, radius: 38 + Math.random() * 10 },
          { offsetX: 20, offsetY: 15, radius: 42 + Math.random() * 12 },
          { offsetX: -20, offsetY: 20, radius: 40 + Math.random() * 10 }
        ]
      });
    }

    const musicNotes = [];
    const noteSymbols = ['♪', '♫', '♬', '♩'];

    function createShootingStar() {
      if (Math.random() < 0.995) return;
      shootingStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        length: Math.random() * 80 + 40,
        speed: Math.random() * 4 + 3,
        opacity: 1,
        angle: Math.PI / 4
      });
    }

    function createMusicNote() {
      if (Math.random() < 0.98) return;
      musicNotes.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 50,
        symbol: noteSymbols[Math.floor(Math.random() * noteSymbols.length)],
        speed: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.6 + 0.4,
        size: Math.random() * 20 + 15,
        sway: Math.random() * Math.PI * 2
      });
    }

    function drawStars() {
      stars.forEach(star => {
        star.opacity += star.twinkleSpeed * star.twinkleDirection;
        if (star.opacity >= 1 || star.opacity <= 0.2) {
          star.twinkleDirection *= -1;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });
    }

    function drawShootingStars() {
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        ctx.save();
        ctx.translate(star.x, star.y);
        ctx.rotate(star.angle);
        const gradient = ctx.createLinearGradient(0, 0, star.length, 0);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(star.length, 0);
        ctx.stroke();
        ctx.restore();
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.opacity -= 0.01;
        if (star.opacity <= 0) shootingStars.splice(i, 1);
      }
    }

    // DRAW FLUFFY CLOUDS!
    function drawClouds() {
      clouds.forEach(cloud => {
        ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
        
        // Draw multiple overlapping circles to create fluffy cloud
        cloud.circles.forEach(circle => {
          ctx.beginPath();
          ctx.arc(
            cloud.x + circle.offsetX,
            cloud.y + circle.offsetY,
            circle.radius,
            0,
            Math.PI * 2
          );
          ctx.fill();
        });
        
        cloud.x += cloud.speed;
        if (cloud.x > canvas.width + 150) {
          cloud.x = -150;
        }
      });
    }

    function drawMusicNotes() {
      for (let i = musicNotes.length - 1; i >= 0; i--) {
        const note = musicNotes[i];
        ctx.save();
        ctx.globalAlpha = note.opacity;
        ctx.font = `${note.size}px Arial`;
        ctx.fillStyle = '#60a5fa'; // Blue-400 for music notes
        ctx.textAlign = 'center';
        ctx.fillText(note.symbol, note.x + Math.sin(note.sway) * 20, note.y);
        ctx.restore();
        note.y -= note.speed;
        note.sway += 0.05;
        note.opacity -= 0.002;
        if (note.y < -50 || note.opacity <= 0) musicNotes.splice(i, 1);
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawStars();
      drawShootingStars();
      drawClouds();
      drawMusicNotes();
      createShootingStar();
      createMusicNote();
      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      navigate('/register');
    }
  };
 
  const soundBarHeights = useMemo(() => {
    return [...Array(7)].map(() => Math.random() * 60 + 40);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f172a] to-[#020617] text-white overflow-hidden relative">
      {/* Animated Canvas Background */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />

      {/* Glowing Moon with Parallax */}
      <div 
        className="fixed top-20 right-20 w-40 h-40 bg-gradient-to-br from-[#fef3c7] to-[#fde68a] rounded-full opacity-80 blur-sm animate-pulse-slow pointer-events-none"
        style={{
          transform: `translate(${mousePos.x}px, ${mousePos.y}px) translateY(${scrollY * 0.2}px)`,
          boxShadow: '0 0 120px 50px rgba(254, 243, 199, 0.3)'
        }}
      />

      {/* Aurora Effect - BLUE only! */}
      <div className="fixed top-0 left-0 right-0 h-96 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/30 via-sky-600/20 to-transparent animate-aurora" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <FaMusic className="text-4xl text-blue-300 animate-float" />
            <div className="absolute inset-0 blur-xl bg-blue-400 opacity-50 animate-pulse" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-300 via-sky-300 to-blue-300 bg-clip-text text-transparent">
            VibePulse
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/docs"
            className="px-6 py-2 text-gray-300 hover:text-white transition-colors relative group"
          >
            Documentation
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-sky-400 group-hover:w-full transition-all duration-300" />
          </Link>
          {user ? (
            <Link
              to={user.role === 'admin' ? '/admin' : '/dashboard'}
              className="px-6 py-2 bg-gradient-to-r from-blue-700 to-blue-900 rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all relative overflow-hidden group"
            >
              <span className="relative z-10">Dashboard</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-950 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-gradient-to-r from-blue-700 to-blue-900 rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all transform hover:scale-105"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* 🎨 HERO SECTION - DEEP BLUE! */}
      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          
          {/* LEFT: Text Content */}
          <div className="text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-lg border border-blue-500/30 rounded-full mb-6 animate-fade-in">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-sm text-blue-200">Now Playing: 100+ Curated Tracks</span>
            </div>

            <h1 className="text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="block text-white">Music API for</span>
              <span className="block animate-text-shimmer bg-gradient-to-r from-blue-300 via-sky-300 to-blue-300 bg-[length:200%_auto] bg-clip-text text-transparent">
                Midnight Coders
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-xl">
              Akses koleksi musik indie yang sempurna untuk coding, studying, dan deep focus sessions. 
              <span className="text-blue-300"> Dengerin musik di bawah bintang ✨</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={handleGetStarted}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-700 to-blue-900 rounded-full text-lg font-bold overflow-hidden transform hover:scale-105 transition-all shadow-lg shadow-blue-500/30"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Listening Free
                  <FaRocket className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-950 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </button>
              
              <Link
                to="/docs"
                className="group px-8 py-4 bg-white/5 backdrop-blur-lg border border-white/20 rounded-full text-lg font-bold hover:bg-white/10 transition-all relative overflow-hidden"
              >
                <span className="flex items-center gap-2 relative z-10">
                  <FaPlay className="text-blue-400" />
                  View Docs
                </span>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6">
              {[
                { icon: FaBolt, label: '100 req/day', color: 'text-cyan-400' },
                { icon: FaShieldAlt, label: 'Free Forever', color: 'text-emerald-400' },
                { icon: FaClock, label: '24/7 Uptime', color: 'text-blue-400' }
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-300">
                  <stat.icon className={`${stat.color} text-lg`} />
                  <span className="text-sm font-medium">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Interactive Music Player Card */}
          <div 
            className="relative animate-fade-in-up"
            style={{ 
              animationDelay: '0.2s',
              transform: `translateY(${scrollY * 0.1}px)` 
            }}
          >
            <div className="relative bg-gradient-to-br from-blue-950/40 via-blue-900/30 to-slate-900/30 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden">
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-sky-600/10 animate-pulse-slow" />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Mini Player UI */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl animate-spin-slow flex items-center justify-center">
                    <FaMusic className="text-2xl text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Midnight Study Beats</h3>
                    <p className="text-sm text-blue-200">Night Coder</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 cursor-pointer transition-all">
                    <FaPlay className="ml-1" />
                  </div>
                </div>

                {/* Waveform Visualization */}
                <div className="flex items-end justify-between gap-1 h-20 mb-6">
                  {[...Array(40)].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-blue-700 to-sky-500 rounded-full animate-sound-wave opacity-70"
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.05}s`
                      }}
                    />
                  ))}
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: FaHeadphones, value: '100+', label: 'Tracks' },
                    { icon: FaCode, value: 'REST', label: 'API' }
                  ].map((item, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all cursor-pointer">
                      <item.icon className="text-2xl text-blue-300 mb-2" />
                      <div className="text-2xl font-bold text-white">{item.value}</div>
                      <div className="text-sm text-gray-400">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating particles */}
              <div className="absolute top-10 right-10 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl animate-float" />
              <div className="absolute bottom-10 left-10 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 FEATURES GRID - ALL BLUE! */}
      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-300 to-sky-300 bg-clip-text text-transparent">
            Why Developers Love Us
          </h2>
          <p className="text-gray-400 text-lg">Everything you need to integrate music into your app</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: FaMusic,
              title: 'Curated Music Library',
              description: '100+ tracks handpicked untuk coding, studying, dan focus sessions',
              color: 'from-blue-700 to-blue-900',
              gradient: 'from-blue-700/20 to-blue-900/20'
            },
            {
              icon: FaCode,
              title: 'Simple REST API',
              description: 'Clean endpoints dengan comprehensive documentation. Mulai dalam hitungan menit',
              color: 'from-blue-600 to-sky-700',
              gradient: 'from-blue-600/20 to-sky-700/20'
            },
            {
              icon: FaBolt,
              title: 'Fast & Reliable',
              description: '99.9% uptime dengan CDN global. Response time under 100ms',
              color: 'from-sky-600 to-cyan-700',
              gradient: 'from-sky-600/20 to-cyan-700/20'
            },
            {
              icon: FaShieldAlt,
              title: 'Secure Authentication',
              description: 'API key based auth. Rate limiting & abuse protection included',
              color: 'from-cyan-600 to-teal-700',
              gradient: 'from-cyan-600/20 to-teal-700/20'
            },
            {
              icon: FaHeadphones,
              title: 'Mood-Based Filtering',
              description: 'Filter by mood: focus, energetic, chill, motivation & more',
              color: 'from-blue-800 to-slate-800',
              gradient: 'from-blue-800/20 to-slate-800/20'
            },
            {
              icon: FaHeart,
              title: 'Free Forever',
              description: '100 requests/day gratis. No credit card required. Scale as you grow',
              color: 'from-slate-700 to-blue-800',
              gradient: 'from-slate-700/20 to-blue-800/20'
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all hover:scale-105 cursor-pointer overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg`}>
                  <feature.icon className="text-2xl text-white" />
                </div>

                {/* Text */}
                <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">{feature.title}</h3>
                <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Hover effect particles */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform" />
            </div>
          ))}
        </div>
      </div>

      {/* 💻 CODE EXAMPLE - BLUE THEME */}
      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-300 to-sky-300 bg-clip-text text-transparent">
              Start in 60 Seconds
            </h2>
            <p className="text-gray-400">Simple API, powerful results</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Code Block */}
            <div className="bg-[#0a1628]/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-2xl hover:border-blue-400/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  <span className="ml-4 text-gray-400 text-sm font-mono">request.js</span>
                </div>
                <button className="text-xs text-blue-400 hover:text-blue-300 font-mono">Copy</button>
              </div>

              <pre className="text-sm font-mono overflow-x-auto">
                <code className="text-blue-300">
{`// Get your API key at /dashboard
const response = await fetch(
  'https://api.vibepulse.dev/songs?mood=focus',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  }
);

const data = await response.json();
console.log(data.tracks);`}
                </code>
              </pre>
            </div>

            {/* Response */}
            <div className="bg-[#0a1628]/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-gray-400 text-sm font-mono">200 OK • 45ms</span>
              </div>

              <pre className="text-sm font-mono overflow-x-auto">
                <code className="text-emerald-300">
{`{
  "success": true,
  "tracks": [
    {
      "id": "track_001",
      "title": "Midnight Study",
      "artist": "Night Coder",
      "mood": "focus",
      "duration": 240,
      "url": "/stream/track_001"
    }
  ]
}`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 FINAL CTA - DEEP BLUE */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="relative max-w-4xl mx-auto">
          {/* Glowing background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700/20 to-sky-700/20 blur-3xl" />
          
          <div className="relative bg-gradient-to-br from-blue-950/40 via-blue-900/30 to-slate-900/30 backdrop-blur-2xl border border-white/20 rounded-3xl p-12 text-center overflow-hidden">
            {/* Animated particles */}
            <div className="absolute top-0 left-1/4 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-sky-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full mb-6">
                <FaGithub className="text-blue-300" />
                <span className="text-sm text-blue-200">Join 1000+ developers</span>
              </div>

              <h2 className="text-5xl font-bold mb-6 animate-text-shimmer bg-gradient-to-r from-white via-blue-200 to-white bg-[length:200%_auto] bg-clip-text text-transparent">
                Ready to Vibe?
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Dapetin API key gratis dan mulai streaming curated music dalam 60 detik. No credit card required.
              </p>

              <button
                onClick={handleGetStarted}
                className="group relative px-12 py-5 bg-gradient-to-r from-blue-700 to-blue-900 rounded-full text-xl font-bold overflow-hidden transform hover:scale-105 transition-all shadow-2xl shadow-blue-500/30"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Get Started Free
                  <FaRocket className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-950 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </button>

              <p className="mt-6 text-gray-400 text-sm">
                100 requests/day • No credit card • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FaMusic className="text-2xl text-blue-300 animate-float" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-300 to-sky-300 bg-clip-text text-transparent">VibePulse</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link to="/docs" className="hover:text-white transition-colors">Docs</Link>
              <span>•</span>
              <span>Made with ❤️ by Hanun Nisa Salsabila</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        @keyframes aurora {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(50%) translateY(-20px); }
        }

        @keyframes sound-wave {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }

        @keyframes text-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-aurora {
          animation: aurora 15s ease-in-out infinite;
        }

        .animate-sound-wave {
          animation: sound-wave 0.8s ease-in-out infinite;
        }

        .animate-text-shimmer {
          animation: text-shimmer 3s linear infinite;
        }

        .animate-fade-in {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;