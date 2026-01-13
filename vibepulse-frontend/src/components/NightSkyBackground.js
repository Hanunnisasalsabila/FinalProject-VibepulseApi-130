import React, { useEffect, useRef, useState } from 'react';

const NightSkyBackground = () => {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 1. Mouse Tracking Effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 2. Canvas Animation Effect (Stars, Clouds, Shooting Stars)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // --- SETUP OBJECTS ---
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
    const clouds = [];
    for (let i = 0; i < 5; i++) {
      clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.6,
        width: Math.random() * 300 + 200,
        height: Math.random() * 80 + 50,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.1 + 0.05
      });
    }

    // --- DRAWING FUNCTIONS ---
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

    function drawStars() {
      stars.forEach(star => {
        star.opacity += star.twinkleSpeed * star.twinkleDirection;
        if (star.opacity >= 1 || star.opacity <= 0.2) {
          star.twinkleDirection *= -1;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 231, 255, ${star.opacity})`;
        ctx.fill();
      });
    }

    function drawShootingStars() {
      shootingStars.forEach((star, index) => {
        const gradient = ctx.createLinearGradient(
          star.x, star.y,
          star.x - Math.cos(star.angle) * star.length,
          star.y - Math.sin(star.angle) * star.length
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(
          star.x - Math.cos(star.angle) * star.length,
          star.y - Math.sin(star.angle) * star.length
        );
        ctx.stroke();

        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.opacity -= 0.01;

        if (star.opacity <= 0) shootingStars.splice(index, 1);
      });
    }

    function drawClouds() {
      clouds.forEach(cloud => {
        ctx.save();
        ctx.globalAlpha = cloud.opacity;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width * 0.3, cloud.y - cloud.height * 0.2, cloud.width * 0.35, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width * 0.6, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        cloud.x += cloud.speed;
        if (cloud.x > canvas.width + cloud.width) {
          cloud.x = -cloud.width;
          cloud.y = Math.random() * canvas.height * 0.6;
        }
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawStars();
      drawShootingStars();
      drawClouds();
      createShootingStar();
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

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* 1. Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1033] via-[#0f172a] to-[#020617]"></div>

      {/* 2. Canvas (Stars, Clouds) */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* 3. Glowing Moon */}
      <div 
        className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-[#fef3c7] to-[#fde68a] rounded-full opacity-80 blur-sm animate-pulse-slow"
        style={{
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          boxShadow: '0 0 100px 40px rgba(254, 243, 199, 0.3)'
        }}
      ></div>

      {/* 4. Aurora Effect */}
      <div className="absolute top-0 left-0 right-0 h-96 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/30 via-transparent to-transparent animate-aurora"></div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes aurora {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(50%) translateY(-20px); }
        }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-aurora { animation: aurora 15s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default NightSkyBackground;