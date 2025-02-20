import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Form, Input, Button } from "antd";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Register.css";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    initializeParticles();
  }, []);

  const initializeParticles = () => {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      constructor() {
        this.reset();
        this.baseRadius = Math.random() * 1.5 + 0.5;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseRadius = Math.random() * 1.5 + 0.5;
        this.radius = this.baseRadius;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.alpha = Math.random() * 0.5 + 0.2;
        this.color = `rgba(255, 255, 255, ${this.alpha})`;
        this.pulseOffset = Math.random() * Math.PI * 2;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.1, this.radius), 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        this.radius = this.baseRadius + Math.sin(Date.now() * 0.001 + this.pulseOffset) * 0.2;
        this.radius = Math.max(0.1, this.radius);
      }
    }

    const particles = Array.from({ length: 100 }, () => new Particle());

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.forEach((particle) => particle.reset());
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  const onFinish = (values) => {
    setLoading(true);
    axios
      .post("https://remastered-vtm-backend-qnvd.onrender.com/auth/register", values)
      .then((response) => {
        if (response.status === 201) {
          toast.success("Registration successful! Please login.");
          navigate("/login");
        } else {
          toast.error("Registration failed.");
        }
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.message || "An error occurred.";
        toast.error(errorMessage);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="register-page">
      {/* Animated Particle Background */}
      <canvas id="particle-canvas" className="particle-background"></canvas>

      <motion.div
        className="register-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="register-header">
          <div className="brand-logo">VTM</div>
          <h2>Create Account</h2>
          <p className="subtitle">Join our community and start managing tasks efficiently</p>
        </div>

        {/* Registration Form */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Form
            key={Date.now()}
            form={form}
            layout="vertical"
            autoComplete="off"
            onFinish={onFinish}
            className="register-form"
          >
            <motion.div className="name-row" variants={itemVariants}>
              <Form.Item
                label="First Name"
                name="firstname"
                rules={[
                  { required: true, message: "Please enter your first name" },
                  { min: 3, message: "At least 3 characters" },
                ]}
              >
                <Input placeholder="Enter your first name" autoComplete="off" />
              </Form.Item>

              <Form.Item
                label="Last Name"
                name="lastname"
                rules={[{ required: true, message: "Please enter your last name" }]}
              >
                <Input placeholder="Enter your last name" autoComplete="off" />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Form.Item
                label="Username"
                name="username"
                rules={[
                  { required: true, message: "Please enter your username" },
                  { min: 3, message: "At least 3 characters" },
                ]}
              >
                <Input placeholder="Enter your username" autoComplete="off" />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Invalid email" },
                ]}
              >
                <Input placeholder="Enter your email" autoComplete="off" />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Please enter your password" }, { min: 6 }]}
              >
                <Input type="password" placeholder="Enter your password" autoComplete="new-password" />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} className="register-button">
                  Create Account
                </Button>
              </Form.Item>
            </motion.div>
          </Form>
        </motion.div>

        <p className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </motion.div>

      <ToastContainer />
    </div>
  );
};

export default Register;
