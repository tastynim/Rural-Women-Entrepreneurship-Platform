import React, { useRef, useEffect } from 'react';

export default function InteractiveDots() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrameId;

    const dots = [];
    const spacing = 35;
    const baseRadius = 2;
    const mouse = { x: -1000, y: -1000 };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initDots();
    };

    const initDots = () => {
      dots.length = 0;
      const cols = Math.floor(width / spacing) + 2;
      const rows = Math.floor(height / spacing) + 2;
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dots.push({
            x: i * spacing,
            y: j * spacing,
            baseX: i * spacing,
            baseY: j * spacing,
            angle: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.4)'; // emerald-500 with low opacity

      dots.forEach((dot) => {
        // Floating animation
        dot.angle += 0.02;
        const floatX = Math.cos(dot.angle) * 2;
        const floatY = Math.sin(dot.angle) * 2;
        
        // Mouse interaction wave
        const dx = mouse.x - dot.baseX;
        const dy = mouse.y - dot.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let radius = baseRadius;
        let offsetX = 0;
        let offsetY = 0;

        const effectRadius = 150;
        if (distance < effectRadius) {
          // Wave effect: dots grow and repel slightly
          const force = (effectRadius - distance) / effectRadius;
          radius = baseRadius + force * 3;
          
          const angle = Math.atan2(dy, dx);
          offsetX = -Math.cos(angle) * force * 15;
          offsetY = -Math.sin(angle) * force * 15;
          
          ctx.fillStyle = `rgba(16, 185, 129, ${0.4 + force * 0.4})`; // Brighter near mouse
        } else {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.15)'; // Default dim
        }

        ctx.beginPath();
        ctx.arc(
          dot.baseX + floatX + offsetX, 
          dot.baseY + floatY + offsetY, 
          radius, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
