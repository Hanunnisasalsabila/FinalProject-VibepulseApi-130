import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaMusic, FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const canvasRef = useRef(null);

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/dashboard');
  }

  // Animated stars background - KEEP 150 STARS!
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkleDirection: Math.random() > 0.5 ? 1 : -1
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        star.opacity += star.twinkleSpeed * star.twinkleDirection;
        if (star.opacity >= 1 || star.opacity <= 0.2) {
          star.twinkleDirection *= -1;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 231, 255, ${star.opacity})`;
        ctx.fill();

        if (star.opacity > 0.7) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(224, 231, 255, ${(star.opacity - 0.7) * 0.3})`;
          ctx.fill();
        }
      });

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (formData.username.length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    }

    // Validasi format email sederhana
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Panggil fungsi login dari context
    const result = await register(formData);

    // Cek hasil
    if (result.success) {
      // ✅ SUKSES: Tidak perlu toast lagi (AuthContext sudah handle)
      // Cukup redirect saja
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } 
    // ❌ ERROR: Tidak perlu toast lagi (AuthContext sudah handle)
    // Di sini kosongkan saja atau biarkan tanpa else
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1033] via-[#0f172a] to-[#020617] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Animated Stars Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
      />

      {/* Glowing Moon */}
      <div className="fixed top-20 right-20 w-32 h-32 bg-gradient-to-br from-[#fef3c7] to-[#fde68a] rounded-full opacity-60 blur-sm animate-pulse-slow pointer-events-none"
        style={{ boxShadow: '0 0 100px 40px rgba(254, 243, 199, 0.2)' }}
      ></div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo with Animation */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <FaMusic className="text-6xl text-purple-300 animate-float" />
              <div className="absolute inset-0 blur-xl bg-purple-400 opacity-50 animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
            VibePulse
          </h2>
          <p className="mt-2 text-purple-200 text-lg">Join the midnight music community ✨</p>
        </div>

        {/* Register Card with Glassmorphism */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 animate-slide-in">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-purple-200 mb-2">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className="text-purple-300 group-focus-within:scale-110 transition-transform" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.username 
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50' 
                      : 'border-white/20 focus:border-purple-400 focus:ring-purple-400/50'
                  }`}
                  placeholder="Choose a username"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-300 animate-fade-in">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-purple-200 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-purple-300 group-focus-within:scale-110 transition-transform" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.email 
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50' 
                      : 'border-white/20 focus:border-purple-400 focus:ring-purple-400/50'
                  }`}
                  placeholder="your.email@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-300 animate-fade-in">{errors.email}</p>
              )}
            </div>

            {/* Password with Show/Hide Toggle */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-purple-200 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-purple-300 group-focus-within:scale-110 transition-transform" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.password 
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50' 
                      : 'border-white/20 focus:border-purple-400 focus:ring-purple-400/50'
                  }`}
                  placeholder="Create a password (min 6 characters)"
                />
                {/* Toggle Password Visibility */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-300 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-lg" />
                  ) : (
                    <FaEye className="text-lg" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-300 animate-fade-in">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password with Show/Hide Toggle */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-purple-200 mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-purple-300 group-focus-within:scale-110 transition-transform" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.confirmPassword 
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50' 
                      : 'border-white/20 focus:border-purple-400 focus:ring-purple-400/50'
                  }`}
                  placeholder="Confirm your password"
                />
                {/* Toggle Password Visibility */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-300 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="text-lg" />
                  ) : (
                    <FaEye className="text-lg" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-300 animate-fade-in">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-3 text-lg font-bold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 overflow-hidden group"
            >
              <span className="relative z-10">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </span>
              {!loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-purple-200">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-300 font-semibold hover:text-white transition-colors relative group">
                Login here
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-300 group-hover:w-full transition-all"></span>
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-purple-300/70 hover:text-purple-200 transition-colors inline-flex items-center group">
              <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
              <span className="ml-1">Back to home</span>
            </Link>
          </div>
        </div>

        {/* Floating Music Notes Decoration */}
        <div className="absolute -bottom-20 -right-20 text-9xl text-purple-500/10 animate-float pointer-events-none">♫</div>
        <div className="absolute top-10 -left-20 text-7xl text-purple-500/10 animate-float pointer-events-none" style={{ animationDelay: '1.5s' }}>♬</div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;