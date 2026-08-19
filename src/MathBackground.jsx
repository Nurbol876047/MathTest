import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// Math functions for morphing
const mathFunctions = [
  (x) => 0.01 * x * x, // Parabola
  (x) => 50 * Math.sin(x * 0.05), // Sine wave
  (x) => x !== 0 ? 1000 / x : 0, // Hyperbola-like
  (x) => 0.0001 * x * x * x // Cubic
];

const formulas = [
  "b^2 - 4ac",
  "a^2 + b^2 = c^2",
  "\\int f(x)dx",
  "\\sin^2 x + \\cos^2 x = 1",
  "E = mc^2",
  "e^{i\\pi} + 1 = 0",
  "\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1"
];

const MathBackground = () => {
  const canvasRef = useRef(null);
  const [activeFormulas, setActiveFormulas] = useState([]);
  const prefersReducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Particles
  const particlesRef = useRef([]);
  // Morphing state
  const funcIndexRef = useRef(0);
  const morphProgressRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width, height;
    
    // Check if mobile
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 10 : 25;
    const gridSize = isMobile ? 48 : 32;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      // Re-init particles on resize
      particlesRef.current = Array.from({ length: particleCount }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      }));
    };

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 200);
    };

    window.addEventListener('resize', handleResize);
    resizeCanvas();

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.04)'; // Soft blue accent
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Axes
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Y axis
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      // X axis
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    const drawParticles = () => {
      const particles = particlesRef.current;
      ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
      
      particles.forEach((p, i) => {
        if (!prefersReducedMotion.current) {
          p.x += p.vx;
          p.y += p.vy;
          
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 22500) { // 150 * 150
            const opacity = 1 - Math.sqrt(distSq) / 150;
            ctx.strokeStyle = `rgba(37, 99, 235, ${opacity * 0.15})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
    };

    const drawFunction = () => {
      if (prefersReducedMotion.current) return;

      const func1 = mathFunctions[funcIndexRef.current];
      const func2 = mathFunctions[(funcIndexRef.current + 1) % mathFunctions.length];
      const progress = morphProgressRef.current;

      ctx.strokeStyle = 'rgba(37, 99, 235, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const centerX = width / 2;
      const centerY = height / 2;
      
      let first = true;
      for (let px = 0; px < width; px += 5) {
        const x = px - centerX;
        
        // Lerp between the two functions
        const y1 = func1(x);
        const y2 = func2(x);
        const y = y1 + (y2 - y1) * progress;
        
        const py = centerY - y;
        
        // Prevent drawing long lines to infinity for hyperbolas
        if (py > -1000 && py < height + 1000) {
          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        } else {
           first = true;
        }
      }
      ctx.stroke();

      // Update morph progress
      morphProgressRef.current += 0.0015; // Slow morph speed
      if (morphProgressRef.current >= 1) {
        morphProgressRef.current = 0;
        funcIndexRef.current = (funcIndexRef.current + 1) % mathFunctions.length;
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      drawGrid();
      drawFunction();
      drawParticles();
      
      if (!prefersReducedMotion.current) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Watermark formulas logic
  useEffect(() => {
    if (prefersReducedMotion.current) return;

    const addFormula = () => {
      // Max 4 formulas at a time
      setActiveFormulas(prev => {
        if (prev.length >= 4 || Math.random() < 0.5) return prev;
        
        const id = Date.now().toString() + Math.random();
        const formula = formulas[Math.floor(Math.random() * formulas.length)];
        const x = Math.random() * 80 + 10; // 10% to 90%
        const y = Math.random() * 80 + 10;
        
        // Remove after 8-10 seconds
        setTimeout(() => {
          setActiveFormulas(current => current.filter(f => f.id !== id));
        }, 8000 + Math.random() * 2000);

        return [...prev, { id, formula, x, y }];
      });
    };

    const intervalId = setInterval(addFormula, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <AnimatePresence>
          {activeFormulas.map(f => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.04, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              style={{
                position: 'absolute',
                left: `${f.x}%`,
                top: `${f.y}%`,
                transform: 'translate(-50%, -50%)',
                color: '#2563eb', // Using the soft blue
                fontSize: '2.5rem',
                userSelect: 'none',
              }}
            >
              <BlockMath math={f.formula} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MathBackground;
