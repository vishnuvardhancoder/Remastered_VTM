import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminLogin.css';
import ParticleBackground from '../components/ParticleBackground';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';


const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Generate random particles with different positions
  const particles = Array.from({ length: 50 }, (_, index) => ({
    id: index,
    left: `${Math.random() * 100}%`,
    animationDuration: `${15 + Math.random() * 5}s`,
    animationDelay: `-${Math.random() * 10}s`
  }));

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('https://remastered-vtm-backend-qnvd.onrender.com/auth/admin-login', {
        email: values.username,
        password: values.password,
      });

      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('role', 'admin');
      localStorage.setItem('username', values.username);

      toast.success('Admin logged in successfully!');
      navigate('/admin/dashboard');
    } catch (error) {
      setLoading(false);
      if (error.response) {
        toast.error(error.response.data.error || 'Invalid email or password');
      } else if (error.request) {
        toast.error('No response from the server. Please try again.');
      } else {
        toast.error('An error occurred. Please try again.');
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="admin-login-page">
      <div className="animated-background">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="floating-particle"
            style={{
              left: particle.left,
              animationDuration: particle.animationDuration,
              animationDelay: particle.animationDelay
            }}
          />
        ))}
      </div>

      <motion.div 
        className="back-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/login')}
      >
        <ArrowLeft size={24} />
      </motion.div>
      <ParticleBackground />

      <motion.div 
        className="admin-login-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="admin-login-header">
          <div className="brand-logo">VTM</div>
          <h2>Admin Portal</h2>
          <p className="subtitle">Access your administrative dashboard</p>
        </div>

        <motion.div variants={formVariants} initial="hidden" animate="visible">
          <Form 
            form={form}
            layout="vertical" 
            onFinish={handleLogin}
            className="admin-login-form"
            autoComplete="off"
          >
            <motion.div variants={itemVariants}>
              <Form.Item 
                label="Email" 
                name="username" 
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input 
                  placeholder="admin@example.com"
                  autoComplete="off"
                  autoFocus={false}
                />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants}>
  <Form.Item
    label="Password"
    name="password"
    rules={[{ required: true, message: 'Please enter your password' }]}
  >
    <Input.Password
      className="login-input1"
      placeholder="Enter your password"
      autoComplete="new-password"
    />
  </Form.Item>
</motion.div>



            <motion.div variants={itemVariants}>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading} 
                  className="login-button"
                >
                  Login to Dashboard
                </Button>
              </Form.Item>
            </motion.div>
          </Form>
        </motion.div>
      </motion.div>
      <ToastContainer position="top-right" theme="dark" />
    </div>
  );
};

export default AdminLogin;