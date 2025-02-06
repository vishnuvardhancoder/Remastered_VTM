import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './LandingPage.css';

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    initializeParticles();
  }, []);

  const initializeParticles = () => {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      constructor() {
        this.reset();
        this.baseRadius = Math.random() * 1.5 + 0.5; // Store base radius
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseRadius = Math.random() * 1.5 + 0.5; // Base radius between 0.5 and 2
        this.radius = this.baseRadius;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.alpha = Math.random() * 0.5 + 0.2;
        this.color = `rgba(255, 255, 255, ${this.alpha})`;
        this.pulseOffset = Math.random() * Math.PI * 2; // Random starting point for pulse
      }

      draw() {
        // Ensure radius is never less than 0.1
        const drawRadius = Math.max(0.1, this.radius);
        ctx.beginPath();
        ctx.arc(this.x, this.y, drawRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        // Gentle pulsing effect with constraints
        const pulseAmount = 0.2; // Reduce pulse amount
        const time = Date.now() * 0.001; // Slower pulse
        this.radius = this.baseRadius + Math.sin(time + this.pulseOffset) * pulseAmount;
        
        // Ensure radius stays positive
        this.radius = Math.max(0.1, this.radius);
      }
    }

    const particles = Array.from({ length: 100 }, () => new Particle());

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.forEach(particle => particle.reset());
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="landing-page">
      <canvas id="particle-canvas" className="particle-background"></canvas>
      
      <motion.div 
        className={`landing-content ${isLoaded ? 'fade-in' : ''}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="brand-section" variants={itemVariants}>
          <div className="brand-logo">
            <span className="logo-text">VTM</span>
            <div className="logo-blur"></div>
          </div>
          <div className="brand-tagline">Task Management Reimagined</div>
        </motion.div>

        <motion.h1 className="main-headline" variants={itemVariants}>
  Stay Organized and Efficient
  <span className="headline-highlight">With Seamless Task Management</span>
</motion.h1>

        <motion.p className="sub-headline" variants={itemVariants}>
          Streamline your productivity with our intuitive task management platform.
          Experience the perfect balance of power and simplicity.
        </motion.p>

        <motion.div className="feature-grid" variants={itemVariants}>
        <div className="feature-item">
  <div className="feature-icon">🔄</div>
  <span>Real-Time Task Updates</span>
</div>

          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <span>Secure & Private</span>
          </div>
          <div className="feature-item">
  <div className="feature-icon">🧑‍💻</div>
  <span>Assign and Manage Tasks</span>
</div>

        </motion.div>

        <motion.div className="cta-buttons" variants={itemVariants}>
          <button 
            className="register-button1"
            onClick={() => window.location.href = '/register'}
          >
            <span className="button-content">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Get Started Free
            </span>
            <div className="button-blur"></div>
          </button>
          
          <button 
            className="login-button1"
            onClick={() => window.location.href = '/login'}
          >
            <span className="button-content">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login
            </span>
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default LandingPage;