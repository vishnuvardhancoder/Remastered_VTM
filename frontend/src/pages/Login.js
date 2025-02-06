import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import googleLogo from '../assets/images/google.png';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowLeft } from 'lucide-react';
import './Login.css';
import ParticleBackground from '../components/ParticleBackground';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
  }, [form]);

  const onFinish = (values) => {
    setLoading(true);

    axios
      .post('http://localhost:3000/auth/login', values)
      .then((response) => {
        const accessToken = response.data.access_token;

        if (typeof accessToken === 'object' && accessToken.access_token) {
          localStorage.setItem('access_token', accessToken.access_token);
        } else if (typeof accessToken === 'string') {
          localStorage.setItem('access_token', accessToken);
        } else {
          throw new Error('Invalid access token format');
        }

        localStorage.setItem('user_id', response.data.userId);
        localStorage.setItem('username', response.data.username);
        toast.success('Login successful!');
        navigate('/dashboard');
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 401) {
            toast.error('Invalid username or password');
          } else if (error.response.status === 400) {
            toast.error(error.response.data.message);
          } else {
            toast.error('Something went wrong. Please try again later');
          }
        } else {
          toast.error('Network error. Please check your connection.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);

    new Promise((resolve, reject) => {
      window.location.href = 'http://localhost:3000/auth/google';
      resolve();
    })
      .catch((error) => {
        console.error('Google Login Error:', error);
        toast.error('Google login failed');
        setGoogleLoading(false);
      });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div className="login-page">
      <motion.div
        className="back-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/landingpage')}
      >
        <ArrowLeft size={24} />
      </motion.div>

      <ParticleBackground />

      <motion.div
        className="login-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="login-header">
          <div className="brand-logo">VTM</div>
          <h2 style={{marginTop:'-1px'}}>Login to Your Account</h2>
          <p className="subtitle">Welcome back, let's manage your tasks</p>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Form
            key={Date.now()}
            form={form}
            layout="vertical"
            autoComplete="off"
            onFinish={onFinish}
            className="login-form"
          >
            <motion.div className="form-row" variants={itemVariants}>
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please enter your username' }]}
              >
                <Input
                  placeholder="Enter your username"
                  className="login-input"
                  autoComplete="off"
                />
              </Form.Item>
            </motion.div>

            <motion.div className="form-row" variants={itemVariants}>
              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password
                  className="login-input"
                  placeholder="Enter your password"
                  autoComplete="new-password"
                />
              </Form.Item>
            </motion.div>

            <motion.div className="form-row" variants={itemVariants}>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="login-button"
                >
                  Login
                </Button>
              </Form.Item>
            </motion.div>
          </Form>

          <motion.div className="form-row" variants={itemVariants}>
            <Button
              type="default"
              className="google-login-button"
              loading={googleLoading}
              onClick={handleGoogleLogin}
            >
              <img src={googleLogo} alt="Google Logo" style={{ marginRight: '10px' }} />
              Login with Google
            </Button>
          </motion.div>

          <div className="register-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </div>
          <div className="admin-link">
            Are you an Admin? <Link to="/admin/login">Click here</Link>
          </div>
        </motion.div>
      </motion.div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Login;
