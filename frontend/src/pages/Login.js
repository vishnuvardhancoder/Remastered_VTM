import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import googleLogo from '../assets/images/google.png';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import ParticleBackground from '../components/ParticleBackground';

const { Title } = Typography;

// Reusable GoogleLoginButton Component
const GoogleLoginButton = ({ loading, setLoading }) => {
  const handleGoogleLogin = () => {
    setLoading(true);

    // Redirect to backend Google OAuth endpoint
    new Promise((resolve, reject) => {
      window.location.href = 'http://localhost:3000/auth/google';
      resolve(); // As we're not expecting errors directly from location redirection
    })
      .then(() => {
        // Additional logic can be added if needed after redirection
      })
      .catch((error) => {
        console.error('Google Login Error:', error);
        toast.error('Google login failed');
        setLoading(false);
      });
  };

  return (
    <Button
    type="default"
    className="button-common google-login-button"
    loading={loading}
    onClick={handleGoogleLogin}
    style={{ display: 'flex', alignItems: 'center' }} // Ensure the image and text are aligned properly
  >
    {/* Custom Google Logo */}
    <img 
      src={googleLogo}// Provide the relative path to your image
      alt="Google Logo"
      style={{ marginRight: '10px', width: '20px', height: '20px' }} // Adjust image size
    />
    {loading ? 'Redirecting...' : 'Login with Google'}
  </Button>
  );
};

const Login = () => {
  const [loading, setLoading] = useState(false); // For login form button
  const [googleLoading, setGoogleLoading] = useState(false); // For Google login button
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
      localStorage.setItem('access_token', accessToken.access_token); // Extract correctly
    } else if (typeof accessToken === 'string') {
      localStorage.setItem('access_token', accessToken); // Store as string
    } else {
      throw new Error('Invalid access token format');
    }

    localStorage.setItem('user_id', response.data.userId);
    localStorage.setItem('username', response.data.username);
    toast.success('Login successful!');
    navigate('/dashboard');
  })
  .catch((error) => {
    console.error('Login error:', error);

    if (error.response) {
      if (error.response.status === 401) {
        toast.error('Invalid username or password');
      } else if (error.response.status === 400) {
        toast.error(error.response.data.message); // Show password length error from backend
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

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('access_token'); // Handle access token
    const userId = queryParams.get('user_id'); // Handle user_id from normal login
    const googleUserId = queryParams.get('google_user_id'); // Handle google_user_id

    if (token) {
      localStorage.setItem('access_token', token); // Save the token

      if (userId) {
        localStorage.setItem('user_id', userId); // Normal user ID
      } else if (googleUserId) {
        localStorage.setItem('google_user_id', googleUserId); // Google user ID
      }

      toast.success('Login successful!');
      navigate('/dashboard'); // Navigate to the dashboard after successful login
    } else {
      if (queryParams.has('access_token') || queryParams.has('user_id') || queryParams.has('google_user_id')) {
        console.warn('Partial data received from OAuth:', { token, userId, googleUserId });
        toast.error('Failed to log in. Please try again.');
      }
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="login-page">
      <ParticleBackground/>
      <div className="login-container">
        <Title level={2} className="login-title">VTM Login</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          className="login-form"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input
              placeholder="Enter your username"
              className="login-input"
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters long' }, 
            ]}
          >
            <Input.Password
              placeholder="Enter your password"
              className="login-input"
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="button-common login-button"
            >
              Login
            </Button>
          </Form.Item>
        </Form>

        {/* Google Login Button Component */}
        <GoogleLoginButton loading={googleLoading} setLoading={setGoogleLoading} />

        <div className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>

      {/* ToastContainer Outside the Login Box */}
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
