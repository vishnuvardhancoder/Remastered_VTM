import React, { useState, useEffect } from 'react';
import './LandingPage.css';

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 2;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
    }

    const particles = Array.from({ length: 150 }, () => new Particle());

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  const handleRegister = () => {
    window.location.href = '/register';
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="landing-page">
      <canvas id="particle-canvas" className="particle-background"></canvas>
      <div className={`landing-content ${isLoaded ? 'fade-in' : ''}`}>
        <div className="brand-section">
          <div className="brand-logo">VTM</div>
          <div className="brand-tagline">Task Management</div>
        </div>

        <h1 className="main-headline">
          Manage Your Tasks <br />Efficiently
        </h1>

        <p className="sub-headline">
          Simplify your workflow and boost productivity with VTM.
        </p>

        <div className="cta-buttons">
          <button 
            className="register-button"
            onClick={handleRegister}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Get Started
          </button>
          <button 
            className="login-button"
            onClick={handleLogin}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;